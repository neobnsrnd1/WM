package com.neobns.wiremock_service.admin.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.neobns.wiremock_service.api.service.ApiService;
import com.neobns.wiremock_service.api.vo.ApiVO;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class AdminController {

	private final ApiService apiService;
	
	@GetMapping("/admin")
	public String showAdmin(Model model) {
		List<ApiVO> apiList = apiService.getAllApis();
		model.addAttribute("apiList", apiList);
		return "admin";
	}
	
}
