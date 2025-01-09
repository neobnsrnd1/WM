package com.neobns.wiremock_service.api.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.neobns.wiremock_service.api.vo.ApiVO;

public interface ApiService {
	List<ApiVO> getAllApis();
	ApiVO getApi(int id);
	List<ApiVO> getApis(List<Integer> ids);
	void saveNewApi(String apiName, String apiUrl, String apiMappings, String apiFiles);
	void updateCheckedApiInfo(int id, LocalDateTime checkedTime, Integer checkedStatus);
	void toggleResponseStatusById(int id);
	void changeModeById(int id, boolean targetMode/*1:대응답ON,0:대응답OFF(실서버)*/);
	void changeModeByIds(List<Integer> ids, boolean targetMode/*1:대응답ON,0:대응답OFF(실서버)*/);
	ApiVO performHealthCheck(int id);
	void checkAllApiHealthCheck();
	
	void deleteApi(int id);
	void updateApi(int id, String apiName, String apiUrl, String apiMappings, String apiFiles);
	Map<String, Object> loadApi(int id);
}
