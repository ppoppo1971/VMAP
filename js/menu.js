// 메뉴 관련 기능들

// 메뉴 상태 관리
let menuStates = {
  isLeftMenuOpen: false,
  isRightMenuOpen: false,
  isGoogleMapMenuOpen: false,
  isMapTypeMenuOpen: false,
  isRouteMenuOpen: false,
  isMarkerMenuOpen: false,
  isScheduleMenuOpen: false
};

// 메뉴 초기화
function initMenu() {
  console.log('메뉴 시스템 초기화');
  
  // 모바일에서 메뉴 토글 버튼 표시
  if (isMobile) {
    const leftMenuBtn = getElement('menuToggleBtn');
    const rightMenuBtn = getElement('rightMenuToggleBtn');
    
    if (leftMenuBtn) {
      leftMenuBtn.classList.add('show');
    }
    if (rightMenuBtn) {
      rightMenuBtn.classList.add('show');
    }
  }
  
  // 메뉴 이벤트 리스너 설정
  setupMenuEventListeners();
  
  // 초기 메뉴 상태 설정
  updateMenuVisibility();
}

// 메뉴 이벤트 리스너 설정
function setupMenuEventListeners() {
  // 외부 클릭 시 메뉴 닫기
  document.addEventListener('click', function(event) {
    const leftMenu = getElement('customMapMenu');
    const rightMenu = getElement('mapTypeSelector');
    
    if (leftMenu && !leftMenu.contains(event.target) && !event.target.closest('#menuToggleBtn')) {
      if (menuStates.isLeftMenuOpen) {
        closeLeftMenu();
      }
    }
    
    if (rightMenu && !rightMenu.contains(event.target) && !event.target.closest('#rightMenuToggleBtn')) {
      if (menuStates.isRightMenuOpen) {
        closeRightMenu();
      }
    }
  });
  
  // ESC 키로 메뉴 닫기
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeAllMenus();
    }
  });
  
  // 윈도우 리사이즈 시 메뉴 상태 업데이트
  window.addEventListener('resize', debounce(function() {
    updateMenuVisibility();
  }, 250));
}

// 왼쪽 메뉴 토글
function toggleMenu() {
  if (menuStates.isLeftMenuOpen) {
    closeLeftMenu();
  } else {
    openLeftMenu();
  }
}

// 왼쪽 메뉴 열기
function openLeftMenu() {
  const menu = getElement('customMapMenu');
  if (menu) {
    menu.classList.remove('hide');
    menuStates.isLeftMenuOpen = true;
    updateMenuVisibility();
  }
}

// 왼쪽 메뉴 닫기
function closeLeftMenu() {
  const menu = getElement('customMapMenu');
  if (menu) {
    menu.classList.add('hide');
    menuStates.isLeftMenuOpen = false;
    updateMenuVisibility();
  }
}

// 오른쪽 메뉴 토글
function toggleRightMenu() {
  if (menuStates.isRightMenuOpen) {
    closeRightMenu();
  } else {
    openRightMenu();
  }
}

// 오른쪽 메뉴 열기
function openRightMenu() {
  const menu = getElement('mapTypeSelector');
  if (menu) {
    menu.classList.remove('hide');
    menuStates.isRightMenuOpen = true;
    updateMenuVisibility();
  }
}

// 오른쪽 메뉴 닫기
function closeRightMenu() {
  const menu = getElement('mapTypeSelector');
  if (menu) {
    menu.classList.add('hide');
    menuStates.isRightMenuOpen = false;
    updateMenuVisibility();
  }
}

// 모든 메뉴 닫기
function closeAllMenus() {
  closeLeftMenu();
  closeRightMenu();
  closeAllSubmenus();
}

// 모든 서브메뉴 닫기
function closeAllSubmenus() {
  const submenus = [
    'googleMapMenu',
    'mapTypeMenu',
    'routeMenu',
    'markerMenu',
    'scheduleMenu'
  ];
  
  submenus.forEach(menuId => {
    const menu = getElement(menuId);
    if (menu) {
      menu.style.display = 'none';
    }
  });
  
  // 메뉴 상태 초기화
  menuStates.isGoogleMapMenuOpen = false;
  menuStates.isMapTypeMenuOpen = false;
  menuStates.isRouteMenuOpen = false;
  menuStates.isMarkerMenuOpen = false;
  menuStates.isScheduleMenuOpen = false;
}

// 구글맵 메뉴 토글
function toggleGoogleMapMenu() {
  const menu = getElement('googleMapMenu');
  if (menu) {
    if (menuStates.isGoogleMapMenuOpen) {
      menu.style.display = 'none';
      menuStates.isGoogleMapMenuOpen = false;
    } else {
      closeAllSubmenus();
      menu.style.display = 'block';
      menuStates.isGoogleMapMenuOpen = true;
    }
  }
}

// 지도 타입 메뉴 토글
function toggleMapTypeMenu() {
  const menu = getElement('mapTypeMenu');
  if (menu) {
    if (menuStates.isMapTypeMenuOpen) {
      menu.style.display = 'none';
      menuStates.isMapTypeMenuOpen = false;
    } else {
      closeAllSubmenus();
      menu.style.display = 'block';
      menuStates.isMapTypeMenuOpen = true;
    }
  }
}

// 경로 메뉴 토글
function toggleRouteMenu() {
  const menu = getElement('routeMenu');
  if (menu) {
    if (menuStates.isRouteMenuOpen) {
      menu.style.display = 'none';
      menuStates.isRouteMenuOpen = false;
    } else {
      closeAllSubmenus();
      menu.style.display = 'block';
      menuStates.isRouteMenuOpen = true;
    }
  }
}

// 마커 메뉴 토글
function toggleMarkerMenu() {
  const menu = getElement('markerMenu');
  if (menu) {
    if (menuStates.isMarkerMenuOpen) {
      menu.style.display = 'none';
      menuStates.isMarkerMenuOpen = false;
    } else {
      closeAllSubmenus();
      menu.style.display = 'block';
      menuStates.isMarkerMenuOpen = true;
    }
  }
}

// 일정 메뉴 토글
function toggleScheduleMenu() {
  const menu = getElement('scheduleMenu');
  if (menu) {
    if (menuStates.isScheduleMenuOpen) {
      menu.style.display = 'none';
      menuStates.isScheduleMenuOpen = false;
    } else {
      closeAllSubmenus();
      menu.style.display = 'block';
      menuStates.isScheduleMenuOpen = true;
    }
  }
}

// 메뉴 가시성 업데이트
function updateMenuVisibility() {
  const leftMenuBtn = getElement('menuToggleBtn');
  const rightMenuBtn = getElement('rightMenuToggleBtn');
  
  // 데스크톱에서는 메뉴가 항상 표시
  if (!isMobile) {
    if (leftMenuBtn) {
      leftMenuBtn.style.display = 'none';
    }
    if (rightMenuBtn) {
      rightMenuBtn.style.display = 'none';
    }
    return;
  }
  
  // 모바일에서만 토글 버튼 표시
  if (leftMenuBtn) {
    leftMenuBtn.style.display = menuStates.isLeftMenuOpen ? 'none' : 'flex';
  }
  if (rightMenuBtn) {
    rightMenuBtn.style.display = menuStates.isRightMenuOpen ? 'none' : 'flex';
  }
}

// 구글맵 기능 토글들
function toggleTraffic() {
  if (typeof MapModule !== 'undefined' && MapModule.changeMapStyle) {
    // 교통정보 토글 로직 구현
    showNotification('교통정보 기능을 구현 중입니다.', 'info');
  }
}

function toggleTransit() {
  if (typeof MapModule !== 'undefined' && MapModule.changeMapStyle) {
    // 대중교통 토글 로직 구현
    showNotification('대중교통 기능을 구현 중입니다.', 'info');
  }
}

function toggleBicycling() {
  if (typeof MapModule !== 'undefined' && MapModule.changeMapStyle) {
    // 자전거 토글 로직 구현
    showNotification('자전거 기능을 구현 중입니다.', 'info');
  }
}

// 경로 모드 토글
function toggleRouteMode() {
  if (typeof RouteModule !== 'undefined' && RouteModule.toggleRouteMode) {
    RouteModule.toggleRouteMode();
  } else {
    showNotification('경로 기능을 구현 중입니다.', 'info');
  }
}

function startRouteMode() {
  if (typeof RouteModule !== 'undefined' && RouteModule.startRouteMode) {
    RouteModule.startRouteMode();
  } else {
    showNotification('경로 시작 기능을 구현 중입니다.', 'info');
  }
}

function endRouteMode() {
  if (typeof RouteModule !== 'undefined' && RouteModule.endRouteMode) {
    RouteModule.endRouteMode();
  } else {
    showNotification('경로 종료 기능을 구현 중입니다.', 'info');
  }
}

function clearRoute() {
  if (typeof RouteModule !== 'undefined' && RouteModule.clearRoute) {
    RouteModule.clearRoute();
  } else {
    showNotification('경로 지우기 기능을 구현 중입니다.', 'info');
  }
}

function saveRoute() {
  if (typeof RouteModule !== 'undefined' && RouteModule.saveRoute) {
    RouteModule.saveRoute();
  } else {
    showNotification('경로 저장 기능을 구현 중입니다.', 'info');
  }
}

// 마커 모드 토글
function toggleMarkerMode() {
  if (typeof MarkerModule !== 'undefined' && MarkerModule.toggleMarkerMode) {
    MarkerModule.toggleMarkerMode();
  } else {
    showNotification('마커 기능을 구현 중입니다.', 'info');
  }
}

function startMarkerMode() {
  if (typeof MarkerModule !== 'undefined' && MarkerModule.startMarkerMode) {
    MarkerModule.startMarkerMode();
  } else {
    showNotification('마커 시작 기능을 구현 중입니다.', 'info');
  }
}

function endMarkerMode() {
  if (typeof MarkerModule !== 'undefined' && MarkerModule.endMarkerMode) {
    MarkerModule.endMarkerMode();
  } else {
    showNotification('마커 종료 기능을 구현 중입니다.', 'info');
  }
}

function clearMarkers() {
  if (typeof MarkerModule !== 'undefined' && MarkerModule.clearMarkers) {
    MarkerModule.clearMarkers();
  } else {
    showNotification('마커 지우기 기능을 구현 중입니다.', 'info');
  }
}

function saveMarkers() {
  if (typeof MarkerModule !== 'undefined' && MarkerModule.saveMarkers) {
    MarkerModule.saveMarkers();
  } else {
    showNotification('마커 저장 기능을 구현 중입니다.', 'info');
  }
}

// 일정 관리
function toggleScheduleMenu() {
  if (typeof ScheduleModule !== 'undefined' && ScheduleModule.toggleScheduleMenu) {
    ScheduleModule.toggleScheduleMenu();
  } else {
    showNotification('일정 기능을 구현 중입니다.', 'info');
  }
}

function showSchedule() {
  if (typeof ScheduleModule !== 'undefined' && ScheduleModule.showSchedule) {
    ScheduleModule.showSchedule();
  } else {
    showNotification('일정 보기 기능을 구현 중입니다.', 'info');
  }
}

function addSchedule() {
  if (typeof ScheduleModule !== 'undefined' && ScheduleModule.addSchedule) {
    ScheduleModule.addSchedule();
  } else {
    showNotification('일정 추가 기능을 구현 중입니다.', 'info');
  }
}

function editSchedule() {
  if (typeof ScheduleModule !== 'undefined' && ScheduleModule.editSchedule) {
    ScheduleModule.editSchedule();
  } else {
    showNotification('일정 편집 기능을 구현 중입니다.', 'info');
  }
}

function deleteSchedule() {
  if (typeof ScheduleModule !== 'undefined' && ScheduleModule.deleteSchedule) {
    ScheduleModule.deleteSchedule();
  } else {
    showNotification('일정 삭제 기능을 구현 중입니다.', 'info');
  }
}

// 사전준비 정보 표시
function showPreparationInfo() {
  const info = getElement('preparationInfo');
  if (info) {
    info.style.display = 'flex';
    info.style.left = '50%';
    info.style.top = '50%';
    info.style.transform = 'translate(-50%, -50%)';
  }
}

// 사전준비 정보 숨기기
function hidePreparationInfo() {
  const info = getElement('preparationInfo');
  if (info) {
    info.style.display = 'none';
  }
}

// 가계부 열기
function openBudget() {
  window.open('account_optimized.html', '_blank');
}

// 경로 저장 다이얼로그 표시
function showRouteSaveDialog() {
  const dialog = getElement('routeSaveDialog');
  if (dialog) {
    dialog.style.display = 'flex';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
  }
}

// 경로 저장 다이얼로그 숨기기
function hideRouteSaveDialog() {
  const dialog = getElement('routeSaveDialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
}

// 마커 저장 다이얼로그 표시
function showMarkerSaveDialog() {
  const dialog = getElement('markerSaveDialog');
  if (dialog) {
    dialog.style.display = 'flex';
    dialog.style.left = '50%';
    dialog.style.top = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
  }
}

// 마커 저장 다이얼로그 숨기기
function hideMarkerSaveDialog() {
  const dialog = getElement('markerSaveDialog');
  if (dialog) {
    dialog.style.display = 'none';
  }
}

// 메뉴 상태 가져오기
function getMenuState() {
  return { ...menuStates };
}

// 메뉴 상태 설정
function setMenuState(newState) {
  menuStates = { ...menuStates, ...newState };
  updateMenuVisibility();
}

// 전역으로 내보내기
window.MenuModule = {
  initMenu,
  toggleMenu,
  openLeftMenu,
  closeLeftMenu,
  toggleRightMenu,
  openRightMenu,
  closeRightMenu,
  closeAllMenus,
  closeAllSubmenus,
  toggleGoogleMapMenu,
  toggleMapTypeMenu,
  toggleRouteMenu,
  toggleMarkerMenu,
  toggleScheduleMenu,
  updateMenuVisibility,
  toggleTraffic,
  toggleTransit,
  toggleBicycling,
  toggleRouteMode,
  startRouteMode,
  endRouteMode,
  clearRoute,
  saveRoute,
  toggleMarkerMode,
  startMarkerMode,
  endMarkerMode,
  clearMarkers,
  saveMarkers,
  showSchedule,
  addSchedule,
  editSchedule,
  deleteSchedule,
  showPreparationInfo,
  hidePreparationInfo,
  openBudget,
  showRouteSaveDialog,
  hideRouteSaveDialog,
  showMarkerSaveDialog,
  hideMarkerSaveDialog,
  getMenuState,
  setMenuState
};
