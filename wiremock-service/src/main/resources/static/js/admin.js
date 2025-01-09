//전역 상태 플래그
let isRequestInProgress = false;

document.addEventListener("DOMContentLoaded", function () {
	
	// "API 추가" 버튼 클릭 시 팝업 열기
    const apiAddButton = document.querySelector(".btn-api-add");
    apiAddButton.addEventListener("click", function () {
        const apiAddModal = new bootstrap.Modal(document.getElementById("apiAddModal"));
        apiAddModal.show();
    });
	
	// "수정" 버튼 클릭 시 팝업 열기
    const editButtons = document.querySelectorAll(".btn-edit");
    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            const apiEditModal = new bootstrap.Modal(document.getElementById("apiEditModal"));
            
            // API ID 가져오기
            const apiId = button.getAttribute("data-id");

            // API 데이터를 가져와 모달에 채우기
            fetch(`/api/get/${apiId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("API 데이터를 가져오는 데 실패했습니다.");
                    }
                    return response.json();
                })
                .then(api => {
                    // 모달 입력 필드에 데이터 설정
                    document.getElementById("editApiName").value = api.apiName;
                    document.getElementById("editApiUrl").value = api.apiUrl;
                    document.getElementById("editApiMappings").value = api.apiMappings || "{}";
                    document.getElementById("editApiFiles").value = api.apiFiles || "{}";

                    // 모달 열기
                    apiEditModal.show();

                    // 저장 버튼 이벤트 설정
                    document.getElementById("saveEditApiButton").onclick = () => saveEditApi(apiId);
                })
                .catch(error => {
                    console.error("Error fetching API data:", error);
                    alert("API 데이터를 가져오는 중 오류가 발생했습니다.");
                });
        });
    });


    // "저장" 버튼 클릭 시 API 추가
    const saveApiButton = document.getElementById("saveApiButton");
    saveApiButton.addEventListener("click", function () {
        addNewApi();
    });
	
	// 삭제 버튼 이벤트
	const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            deleteApi(button);
        });
    });

	/* 체크 박스 이벤트 부여 */
    const selectAllCheckbox = document.getElementById("select-all");	//전체
    const rowCheckboxes = document.querySelectorAll(".row-checkbox");	//개별
	
	//1. 전체 선택/해제
    selectAllCheckbox.addEventListener("change", function () {
        const isChecked = selectAllCheckbox.checked;
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
	//2. 개별 상태 변경 시, 전체 체크 박스 상태 변경
	rowCheckboxes.forEach(checkbox => {
		checkbox.addEventListener("change", function() {
			const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
			const noneChecked = Array.from(rowCheckboxes).every(cb => !cb.checked);
			if (allChecked) {
				selectAllCheckbox.checked = true;
				selectAllCheckbox.indeterminate = false;
			} else if(noneChecked) {
				selectAllCheckbox.checked = false;
				selectAllCheckbox.indeterminate = false;
			} else {
				selectAllCheckbox.indeterminate = true;
			}
		});
	});
	/* end of 체크 박스 이벤트 부여 */
	
	//모드 단일 토글 이벤트 부여
	const modeButtons = document.querySelectorAll(".btn-toggle-mode");
	modeButtons.forEach(button => {
		button.addEventListener("click", function() {
			toggleMode(button);
		});
	});
	
	//모드 전체 전환 이벤트 부여
	const mockButton = document.querySelector(".btn-api-mock");
	const realButton = document.querySelector(".btn-api-real");
	mockButton.addEventListener("click", function() { changeApiMode(false); });
	realButton.addEventListener("click", function() { changeApiMode(true); });
	
	//헬스 체크 이벤트 부여
	const healthButtons = document.querySelectorAll(".btn-healthcheck");
	healthButtons.forEach(button => {
		button.addEventListener("click", function() {
			performHealthCheck(button);
		});
	})
	
	//실행 이벤트 부여
	const executeButtons = document.querySelectorAll(".btn-execute");
	executeButtons.forEach(button => {
		button.addEventListener("click", function() {
			executeApi(button);
		});
	})
	
});

// API 추가 함수
const addNewApi = () => {
    const apiName = document.getElementById("apiName").value;
    const apiUrl = document.getElementById("apiUrl").value;
	const apiMappings = document.getElementById("apiMappings").value;
    const apiFiles = document.getElementById("apiFiles").value;

    if (!apiName || !apiUrl) {
        alert("API 이름과 주소를 입력해주세요.");
        return;
    }
	
	if (!isValidJson(apiMappings)) {
	        alert("mappings 필드에 올바른 JSON 형식을 입력해주세요.");
	        return;
    }

    if (!isValidJson(apiFiles)) {
        alert("__files 필드에 올바른 JSON 형식을 입력해주세요.");
        return;
    }
	
	// 고정 값 정의
    const fixedUrl = '"url": "/mock/api/{id}"';
    const fixedBodyFileName = '"bodyFileName": "{apiName}-response.json"';
	
	// 고정 값 검증 및 복원
    if (!apiMappings.includes(fixedUrl)) {
        apiMappings = apiMappings.replace(/"url":\s*".*?"/, fixedUrl);
    }
    if (!apiMappings.includes(fixedBodyFileName)) {
        apiMappings = apiMappings.replace(/"bodyFileName":\s*".*?"/, fixedBodyFileName);
    }

    fetch('/api/add', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ apiName, apiUrl, apiMappings, apiFiles })
    })
    .then(response => {
        if (response.status === 201) {
            alert("API가 성공적으로 추가되었습니다.");
            window.location.reload();
        } else {
            alert("API 추가 중 문제가 발생했습니다.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("네트워크 오류가 발생했습니다.");
    });
};


// JSON 검증 함수
const isValidJson = (input) => {
    try {
        JSON.parse(input); // JSON 파싱 시도
        return true; // 유효한 JSON 형식
    } catch (error) {
        return false; // JSON 파싱 실패
    }
};

// API Edit
const saveEditApi = (id) => {
    let apiName = document.getElementById("editApiName").value;
    let apiUrl = document.getElementById("editApiUrl").value;
    let apiMappings = document.getElementById("editApiMappings").value;
    let apiFiles = document.getElementById("editApiFiles").value;
	
	if (!isValidJson(apiMappings)) {
		    alert("mappings 필드에 올바른 JSON 형식을 입력해주세요.");
		    return;
		}

	if (!isValidJson(apiFiles)) {
	    alert("__files 필드에 올바른 JSON 형식을 입력해주세요.");
	    return;
	}
	
	// 고정 값 정의
    const fixedUrl = '"url": "/mock/api/{id}"';
    const fixedBodyFileName = '"bodyFileName": "{apiName}-response.json"';
	
	// 고정 값 검증 및 복원
    if (!apiMappings.includes(fixedUrl)) {
        apiMappings = apiMappings.replace(/"url":\s*".*?"/, fixedUrl);
    }
    if (!apiMappings.includes(fixedBodyFileName)) {
        apiMappings = apiMappings.replace(/"bodyFileName":\s*".*?"/, fixedBodyFileName);
    }

    fetch(`/api/edit/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiName, apiUrl, apiMappings, apiFiles }),
    })
        .then(response => {
            if (response.ok) {
                alert("API가 성공적으로 수정되었습니다.");
                window.location.reload();
            } else {
                alert("API 수정 중 문제가 발생했습니다.");
            }
        })
        .catch(error => {
            console.error("Error updating API:", error);
            alert("네트워크 오류가 발생했습니다.");
        });
};

// API Mappings 입력 시 실시간 검증
const apiMappingsField = document.getElementById("apiMappings");
apiMappingsField.addEventListener("input", () => {
    const fixedUrl = '"url": "/mock/api/{id}"';
    const fixedBodyFileName = '"bodyFileName": "{apiName}-response.json"';
    let currentValue = apiMappingsField.value;

    // url 부분 고정
    if (!currentValue.includes(fixedUrl)) {
        currentValue = currentValue.replace(/"url":\s*".*?"/, fixedUrl);
    }

    // bodyFileName 부분 고정
    if (!currentValue.includes(fixedBodyFileName)) {
        currentValue = currentValue.replace(/"bodyFileName":\s*".*?"/, fixedBodyFileName);
    }

    // 수정된 텍스트 필드 값 반영
    apiMappingsField.value = currentValue;
});

// API 삭제
const deleteApi = (button) => {
    const id = button.getAttribute("data-id");

    if (!confirm(`${id}번 API를 삭제하시겠습니까?`)) {
        return;
    }

    fetch(`/api/delete/${id}`, {
        method: "DELETE"
    })
    .then(response => {
        if (response.status === 200) {
            alert("API가 성공적으로 삭제되었습니다.");
            window.location.reload();
        } else {
            alert("API 삭제 중 오류가 발생했습니다.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("네트워크 오류가 발생했습니다.");
    });
};

const toggleMode = (button) => {
	const id = button.getAttribute("data-id");
	
	fetch('/api/toggle-mode', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: id
	})
	.then(response => {
		if(response.status === 200) {
		    window.location.reload();
		} else {
		    alert("시스템 오류가 발생하였습니다.");
		}
	})
	.catch(error => {
		console.error("Error:", error);
		alert("네트워크 오류가 발생했습니다.");
	});
}

const changeApiMode = (targetMode) => {
	const checkboxes = document.querySelectorAll(".row-checkbox");
	const ids = getSelectedIdsFromCheckbox(checkboxes);
	
	if(ids.length === 0) {
		alert("전환할 API를 선택해주세요.");
		return;
	}
	
	fetch('/api/change-mode-selected', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			ids: ids,
			targetMode
		})
	})
	.then(response => {
		if(response.status === 200) {
			if(targetMode === false) alert("선택한 API의 모드를 대응답으로 전환했습니다.");
			else alert("선택한 API 모드를 실서버로 전환했습니다.");
			window.location.reload();
		} else {
			alert("시스템 오류가 발생하였습니다.");
		}
	})
	.catch(error => {
		console.error("Error:", error);
		alert("네트워크 오류가 발생했습니다.");
	});
}

const performHealthCheck = (button) => {
	if (isRequestInProgress) {
        alert("Health Check가 진행 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

	const id = button.getAttribute("data-id");
	isRequestInProgress = true;//요청 상태 플래그 설정
		
	fetch('/api/health-check', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: id
	})
	.then(response => {
		if(response.status === 200) {
			alert(`${id}번 API의 Health Check가 성공적으로 완료되었습니다.`);
		    window.location.reload();
		} else {
		    alert(`${id}번 API의 Health Check 진행 중 오류가 발생했습니다.`);
		}
	})
	.catch(error => {
		console.error("Error:", error);
		alert("네트워크 오류가 발생했습니다.");
	})
	.finally(() => {
		isRequestInProgress = false;//요청 상태 플래그 해제
	})
}

const executeApi = (button) => {
	const id = button.getAttribute("data-id");
	
	const newWindow = window.open("", "_blank");

    fetch(`/api/execute/${id}`, {
        method: "GET",
        redirect: "follow"
    })
    .then(response => {
        if(response.redirected) {
			newWindow.location.href = response.url;
			window.location.reload();
		} else throw new Error("API 실행 중 리디렉션이 발생하지 않았습니다.");
    })
    .catch(error => {
        console.error("Error:", error);
        newWindow.close();
        alert("API 실행 중 오류가 발생했습니다. 다시 시도해주세요.");
    });
}

const getSelectedIdsFromCheckbox = (checkboxes) => {
	const selectedIds = [];
	checkboxes.forEach(checkbox => {
		if(checkbox.checked) {
			const id = checkbox.getAttribute("data-id");
			selectedIds.push(parseInt(id, 10));
		}
	});
	return selectedIds;
}
