package com.neobns.wiremock_service.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.neobns.wiremock_service.api.service.ApiService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApiHealthCheckScheduler {

	private final ApiService apiService;
	
	@Scheduled(fixedRate = 300000)//5분 간격
	public synchronized void performScheduledHealthCheck() {
		apiService.checkAllApiHealthCheck();
	}
	
}
