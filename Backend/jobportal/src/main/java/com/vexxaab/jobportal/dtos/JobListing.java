package com.vexxaab.jobportal.dtos;

@lombok.Data
public class JobListing {
    private String jobType;
    private String industry;
    private String timeframe;
    private String skillsRequired;
    private ContactDetails contact;
    private String organizationNumber;
    private String webPageUrl;

    // Getters and setters
}

