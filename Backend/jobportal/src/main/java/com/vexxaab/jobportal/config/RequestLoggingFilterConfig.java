package com.vexxaab.jobportal.config;

import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import static com.vexxaab.jobportal.constants.JobPortalConstants.AUTHORIZATION_HEADER;

@Configuration
public class RequestLoggingFilterConfig {
	@Bean
	public CommonsRequestLoggingFilter logFilter() {
		CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();

		filter.setIncludeClientInfo(true);
		filter.setIncludeQueryString(true);
		filter.setIncludePayload(true);
		filter.setIncludeHeaders(true);
		filter.setMaxPayloadLength(10000);
		filter.setAfterMessagePrefix("After request: ");

		// We don't want to log the authorization header
		filter.setHeaderPredicate(header -> !header.equalsIgnoreCase(AUTHORIZATION_HEADER));

		return filter;
	}
}
