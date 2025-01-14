package com.vexxaab.jobportal.controllers;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vexxaab.jobportal.dtos.ContactDetails;
import com.vexxaab.jobportal.dtos.JobListing;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import reactor.core.publisher.Mono;

@RequestMapping("/api/vexxajobportal")
@CrossOrigin
@RestController
@OpenAPIDefinition(tags = { @Tag(name = "Job Search") })
public class JobSearchController {

	@Value("${jobsearch.api.base-url}")
	private String jobSearchApiBaseUrl;

	private final WebClient webClient;
	
	 @Autowired
	 private RestTemplate restTemplate;

	@GetMapping("/jobs")
	public ResponseEntity<String> getJobs() {
		return ResponseEntity.ok("List of jobs");
	}

	public JobSearchController(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.exchangeStrategies(ExchangeStrategies.builder()
				.codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // Increase limit to
																									// 10MB
				.build()).build();
	}

	@Operation(tags = {
			"Job Search" }, summary = "Job Search", description = "Search for jobs based on various criteria.")
	@GetMapping(value = "/search-jobs", produces = APPLICATION_JSON_VALUE)
	public ResponseEntity<Page<JobListing>> searchJobs(
			@RequestParam(value = "skills", required = false) String skills,
			@RequestParam(value = "jobType", required = false) String jobType,
			@RequestParam(value = "timeframe", required = false) String timeFrame,
			@RequestParam(value = "publishedafter", required = false) String publishedAfter,
			@RequestParam(value = "publishedbefore", required = false) String publishedBefore,
			@RequestParam(value = "industry", required = false) String occupationname,
			@RequestParam(value = "freesearch", required = false) List<String> freesearch,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "25") int size) {
		try {
			System.out.println("JobSearchController.searchJobs() URL: " + (jobSearchApiBaseUrl + "/search"));

			// Convert timeframe to YYYY-MM-dd format
			publishedAfter = getDate(timeFrame, publishedAfter);

			String query = buildQuery(skills, jobType, publishedAfter, publishedBefore, occupationname,
					freesearch);

			System.out.println("JobSearchController.searchJobs() Query: " + query);

			// Fetch the response from the API
			Mono<String> responseMono = webClient.get().uri(uriBuilder -> uriBuilder.scheme("https")
					.host("jobsearch.api.jobtechdev.se").path("/search").query(query).build()).retrieve()
					.bodyToMono(String.class);

			String response = responseMono.block();

			// Process and paginate results
			List<JobListing> allJobListings = processJobSearchResponse(response);
			int start = Math.min((int) PageRequest.of(page, size).getOffset(), allJobListings.size());
			int end = Math.min((start + size), allJobListings.size());
			List<JobListing> paginatedList = allJobListings.subList(start, end);

			return ResponseEntity.ok(new PageImpl<>(paginatedList, PageRequest.of(page, size), allJobListings.size()));
		} catch (IllegalArgumentException e) {
			// Handle invalid arguments (e.g., "limit" or invalid page/size values)
			System.err.println("Invalid argument in query parameters: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.badRequest().body(Page.empty());
		} catch (Exception e) {
			// Handle other exceptions
			System.err.println("An unexpected error occurred: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(500).body(Page.empty());
		}
	}

	private String getDate(String timeFrame, String publishedAfter) {
		if (timeFrame != null && !timeFrame.isEmpty()) {
			try {
				DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
				DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
				LocalDate parsedDate = LocalDate.parse(timeFrame, inputFormatter);
				publishedAfter = parsedDate.format(outputFormatter);
			} catch (DateTimeParseException e) {
				e.printStackTrace();
			}
		}
		return publishedAfter;
	}

	private String buildQuery(String skills, String jobType, String publishedAfter,
			String publishedBefore, String occupationNames, List<String> freesearch) {
		StringBuilder queryBuilder = new StringBuilder();
		if (skills != null && !skills.isEmpty())
		    queryBuilder.append("skill=").append(String.join(",", skills)).append("&");

		if (jobType != null && !jobType.isEmpty())
		    queryBuilder.append("employment-type=").append(String.join(",", jobType)).append("&");

		if (publishedAfter != null && !publishedAfter.trim().isEmpty())
		    queryBuilder.append("published-after=").append(publishedAfter.trim()).append("&");

		if (publishedBefore != null && !publishedBefore.trim().isEmpty())
		    queryBuilder.append("published-before=").append(publishedBefore.trim()).append("&");

		if (occupationNames != null && !occupationNames.isEmpty())
		    queryBuilder.append("occupation-name=").append(String.join(",", occupationNames)).append("&");

		if (freesearch != null && !freesearch.isEmpty())
		    queryBuilder.append("q=").append(freesearch).append("&");

		queryBuilder.append("limit=100").append("&");
		return queryBuilder.toString();
	}

	private List<JobListing> processJobSearchResponse(String response) {
		List<JobListing> jobListings = new ArrayList<>();
		try {
			JsonNode rootNode = new ObjectMapper().readTree(response);
			JsonNode hits = rootNode.path("hits");

			for (JsonNode hit : hits) {
				JobListing job = new JobListing();
				job.setJobType(hit.path("employment_type").path("label").asText());
				job.setIndustry(hit.path("occupation_field").path("label").asText());
				job.setTimeframe(hit.path("application_deadline").asText());
				job.setSkillsRequired(hit.path("must_have").path("skills").toString());
				job.setOrganizationNumber(hit.path("employer").path("organization_number").toString());
				job.setWebPageUrl(hit.path("webpage_url").toString());

				// Populate contact details
				ContactDetails contactDetails = getContactDetails(hit);
				if (contactDetails != null) {
					job.setContact(contactDetails);
				}

				jobListings.add(job);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return jobListings;
	}

	private ContactDetails getContactDetails(JsonNode hit) {
		JsonNode contactNode = hit.path("application_contacts");
		if (contactNode.isArray() && contactNode.size() > 0) {
			JsonNode contact = contactNode.get(0); // Assuming the first contact is sufficient
			String name = contact.path("description").asText(null); // Default to null if missing
			String email = contact.path("email").asText(null);
			String phone = contact.path("telephone").asText(null);

			return new ContactDetails(name, email, phone);
		}
		return null; // No contact information available
	}
	
	
	@GetMapping("/dashboard")
    public Map<String, Object> getDashboardData(@RequestParam String organizationId, @RequestParam String timeframe) {
      
		System.out.println("JobSearchController.getDashboardData()");
		String publishedAfter = timeframe ; //getDate(timeframe, null);
		
		String query = buildDashBoardQuery(organizationId, publishedAfter);
		System.out.println("JobSearchController.getDashboardData() query : "+query);
		
    	Mono<String> responseMono = webClient.get().uri(uriBuilder -> uriBuilder.scheme("https")
				.host("jobsearch.api.jobtechdev.se").path("/search").query(query).build()).retrieve()
				.bodyToMono(String.class);

        String response = responseMono.block(); // Blocking for simplicity

        // Prepare the combined dashboard data
        Map<String, Object> result = new HashMap<>();
        try {
            result.put("stats", processStatistics(response));
            result.put("currentJobs", processCurrentJobs(response));
            result.put("postingFrequency", processPostingFrequency(response));
        } catch (Exception e) {
            throw new RuntimeException("Error processing API response", e);
        }
        
        return result;
    }

    private String buildDashBoardQuery(String organizationId, String publishedAfter) {
		StringBuilder queryBuilder = new StringBuilder();
		if (organizationId != null)
			queryBuilder.append("employer=").append(organizationId).append("&");
		if (publishedAfter != null && publishedAfter != "")
			queryBuilder.append("published-after=").append(publishedAfter).append("&");
		queryBuilder.append("limit=100").append("&");
		return queryBuilder.toString();
	}

    private Map<String, Object> processStatistics(String response) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPositions", rootNode.path("total").path("value").asInt(0));
        stats.put("queryTimeMillis", rootNode.path("query_time_in_millis").asInt(0));
        stats.put("resultTimeMillis", rootNode.path("result_time_in_millis").asInt(0));

        return stats;
    }

    private List<Map<String, Object>> processCurrentJobs(String response) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response);
        JsonNode hitsNode = rootNode.path("hits");

        if (hitsNode.isArray()) {
            return objectMapper.convertValue(hitsNode, List.class);
        }

        return Collections.emptyList();
    }

    private Map<String, Object> processPostingFrequency(String response) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(response);

        int totalPositions = rootNode.path("total").path("value").asInt(0);
        int queryTime = rootNode.path("query_time_in_millis").asInt(0);

        Map<String, Object> frequency = new HashMap<>();
        frequency.put("totalPostings", totalPositions);
        frequency.put("averageQueryTime", queryTime);

        return frequency;
    }

    
    @GetMapping("/dashboard1")
    public Map<String, Object> getDashboardData2() {
    	
		System.out.println("Start JobSearchController.getDashboardData()");

        String externalApiUrl = "https://jobsearch.api.jobtechdev.se/search?limit=100"; // Replace with actual API URL

        // Fetch data from the external API
        Map<String, Object> response = restTemplate.getForObject(externalApiUrl, Map.class);

        if (response == null || !response.containsKey("hits")) {
            throw new RuntimeException("Error fetching data from Arbetsförmedlingen API");
        }
        System.out.println("End JobSearchController.getDashboardData()");

        return response; // Return the data as JSON
    }
    
    @GetMapping("/dashboard3")
    public Map<String, Object> getDashboardData() {
        // Simulate data if API is unavailable
        return Map.of(
            "hits", List.of(
                Map.of(
                    "employer", Map.of("name", "VIPAS AB"),
                    "headline", "Front End Web Developer - Västerås",
                    "application_deadline", "2025-05-16T23:59:59"
                ),
                Map.of(
                    "employer", Map.of("name", "VIPAS AB"),
                    "headline", "Talent Acquisition Intern",
                    "application_deadline", "2025-05-16T23:59:59"
                )
            )
        );
    }
    
    
}
