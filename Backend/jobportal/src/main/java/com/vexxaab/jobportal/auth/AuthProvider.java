package com.vexxaab.jobportal.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class AuthProvider {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	    http
	        .authorizeHttpRequests(auth -> auth
	            .anyRequest().permitAll()
	        )
	        .csrf().disable();
	    return http.build();
	}
}
