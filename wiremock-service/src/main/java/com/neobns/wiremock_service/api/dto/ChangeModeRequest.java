package com.neobns.wiremock_service.api.dto;

import java.util.List;

import lombok.Data;

@Data
public class ChangeModeRequest {
	
	private List<Integer> ids; 
	private boolean targetMode;
	
}
