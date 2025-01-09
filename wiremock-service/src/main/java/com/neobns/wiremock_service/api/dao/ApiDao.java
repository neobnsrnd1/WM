package com.neobns.wiremock_service.api.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.neobns.wiremock_service.api.vo.ApiVO;

@Mapper
public interface ApiDao {
	List<ApiVO> findAll();
	ApiVO findById(int id);
	List<ApiVO> findByIds(List<Integer> ids);
	int saveApi(ApiVO apiVO);
	void updateCheckedStatus(ApiVO apiVO);
	void changeResponseStatusById(ApiVO apiVO);
	void toggleResponseStatusById(int id);
	void toggleResponseStatusByIds(List<Integer> ids);
	
	void deleteById(int id);
	void updateApi(ApiVO apiVO);
}
