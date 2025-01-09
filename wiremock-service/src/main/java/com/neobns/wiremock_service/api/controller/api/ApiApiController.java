package com.neobns.wiremock_service.api.controller.api;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.neobns.wiremock_service.api.dto.ChangeModeRequest;
import com.neobns.wiremock_service.api.service.ApiService;
import com.neobns.wiremock_service.api.vo.ApiVO;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ApiApiController {
	
	private final ApiService apiService;
	
	private final WireMockServer wireMockServer;
	
	@PostMapping("/add")
	public ResponseEntity<String> addApi(@RequestBody Map<String, String> apiData) {
	    try {
	    	String apiName = apiData.get("apiName");
	    	String apiUrl = apiData.get("apiUrl");
	        String apiMappings = apiData.get("apiMappings");
	        String apiFiles = apiData.get("apiFiles");
	    	
	        apiService.saveNewApi(apiName, apiUrl, apiMappings, apiFiles);
	        return ResponseEntity.status(HttpStatus.CREATED).body("API successfully added.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add API.");
	    }
	}
	
	@PostMapping("/toggle-mode")
	public ResponseEntity<String> toggleApiMode(@RequestBody Integer id) {
		try {
			apiService.toggleResponseStatusById(id);
	        return ResponseEntity.status(HttpStatus.OK).body("Successfully updated the response status.");
	    } catch (Exception e) {
	    	e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update response status.");
	    }
	}
	
	@PostMapping("/change-mode-selected")
	public ResponseEntity<String> changeMode(@RequestBody ChangeModeRequest request) {
		try {
			apiService.changeModeByIds(request.getIds(), request.isTargetMode());
	        return ResponseEntity.status(HttpStatus.OK).body("Successfully updated the response status.");
	    } catch (Exception e) {
	    	e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update response status.");
	    }
	}
	
	@PostMapping("/health-check")
	public ResponseEntity<String> healthCheck(@RequestBody Integer id) {
		try {
			apiService.performHealthCheck(id);
	        return ResponseEntity.status(HttpStatus.OK).body("Successfully performed Health Check.");
	    } catch (Exception e) {
	    	e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to perform Health Check.");
	    }
	}
	
	@GetMapping("/execute/{id}")
	public void executeApi(@PathVariable int id, HttpServletResponse response) throws IOException {
		ApiVO apiVO = apiService.getApi(id);
		if(apiVO == null) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND);
	        response.setContentType("application/json");
	        response.getWriter().write("{\"error\": \"API 정보가 없습니다.\"}");
	        return;
		}
		
		apiVO = apiService.performHealthCheck(id);
		String apiUrl = apiVO.getApiUrl();
		boolean isHealthy = apiVO.getLastCheckedStatus() == 0;
		boolean isMockMode = !apiVO.getResponseStatus();
		
		String redirectUrl;
		
		if(isHealthy) {	//서버 정상 시 실서버/대응답 DB 상태에 따라 처리
			if(isMockMode) redirectUrl = "http://localhost:" + wireMockServer.port() + "/mock/api/" + id;	//대응답
			else redirectUrl = apiUrl;																		//실서버
		} else {		//서버 장애 시 공통 Stub 처리
			switch(apiVO.getLastCheckedStatus()) {
				case 1:	//장애
				case 2:	//다운
					redirectUrl = "http://localhost:" + wireMockServer.port() + "/mock/stub/bad";
					break;
				case 3:	//지연
					redirectUrl = "http://localhost:" + wireMockServer.port() + "/mock/stub/delay";
					break;
				default:
					response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	                response.setContentType("application/json");
	                response.getWriter().write("{\"error\": \"서버 장애 상태를 처리할 수 없습니다.\"}");
	                return;
			}
		}
		
		response.sendRedirect(redirectUrl);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteApi(@PathVariable int  id){
		
		try {
			apiService.deleteApi(id);
	        return ResponseEntity.status(HttpStatus.OK).body("API successfully deleted.");
	    } catch (Exception e) {
	    	e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete API");
	    }
		
	}
	
	@PostMapping("/edit/{id}")
	public ResponseEntity<String> editApi(@PathVariable int id, @RequestBody Map<String, String> apiData) {
	    try {
	        String apiName = apiData.get("apiName");
	        String apiUrl = apiData.get("apiUrl");
	        String apiMappings = apiData.get("apiMappings");
	        String apiFiles = apiData.get("apiFiles");

	        apiService.updateApi(id, apiName, apiUrl, apiMappings, apiFiles);

	        return ResponseEntity.status(HttpStatus.OK).body("API successfully updated.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update API.");
	    }
	}
	
	@GetMapping("/get/{id}")
	public ResponseEntity<Map<String, Object>> getApiById(@PathVariable int id) {
	    Map<String, Object> loadApiInfo = apiService.loadApi(id);

        if (loadApiInfo == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(loadApiInfo);
	
	}
}
