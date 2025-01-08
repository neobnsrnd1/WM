package com.neobns.wiremock_service.api.vo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiVO {
	
	/* id(순번) */
	private int id;
	
	/* API 이름 */
	private String apiName;
	
	/* API 주소 */
	private String apiUrl;
	
	/* 마지막 서버 동작 확인 시간 */
	private LocalDateTime lastCheckedTime;
	
	/* 마지막 서버 동작 상태(0:정상,1:장애,2:다운,3:지연,null:미확인) */
	private Integer lastCheckedStatus;
	
	/* 응답 상태(0:OFF/대응답,1:ON/실서버) */
	private Boolean responseStatus;
	
}
