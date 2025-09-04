// 지도 관련 기능들

// 지도 초기화 함수
function initMap() {
  try {
    // 지도 생성
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: { lat: 43.0642, lng: 141.3469 }, // 홋카이도 중심
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      gestureHandling: 'greedy',
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Geocoder 초기화
    geocoder = new google.maps.Geocoder();

    // 지도 로드 완료 이벤트
    google.maps.event.addListenerOnce(map, 'idle', function() {
      console.log('지도 로드 완료');
      
      // 기본 항로 표시
      showFlightRoute();
      
      // 모바일 최적화
      if (isMobile) {
        optimizeMapForMobile();
      }
      
      // 지도 타입 변경 이벤트 리스너
      setupMapTypeListeners();
      
      // 지도 클릭 이벤트 리스너
      setupMapClickListeners();
    });

    // 지도 크기 변경 이벤트
    google.maps.event.addListener(map, 'resize', function() {
      // 지도 크기 변경 시 필요한 작업
      if (currentInfoWindow) {
        currentInfoWindow.open(map);
      }
    });

    // 지도 드래그 이벤트
    google.maps.event.addListener(map, 'dragend', function() {
      // 지도 드래그 완료 시 필요한 작업
      console.log('지도 드래그 완료');
    });

    // 지도 줌 이벤트
    google.maps.event.addListener(map, 'zoom_changed', function() {
      // 지도 줌 변경 시 필요한 작업
      console.log('지도 줌 레벨:', map.getZoom());
    });

  } catch (error) {
    handleError(error, '지도 초기화');
  }
}

// 모바일용 지도 최적화
function optimizeMapForMobile() {
  if (!map || !isMobile) return;

  // 모바일에서 지도 컨트롤 최적화
  map.setOptions({
    gestureHandling: 'cooperative',
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });

  // 모바일에서 터치 이벤트 최적화
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.touchAction = 'manipulation';
  }
}

// 지도 타입 변경 리스너 설정
function setupMapTypeListeners() {
  if (!map) return;

  // 지도 타입 변경 이벤트
  google.maps.event.addListener(map, 'maptypeid_changed', function() {
    const mapType = map.getMapTypeId();
    console.log('지도 타입 변경:', mapType);
    
    // 지도 타입에 따른 추가 설정
    switch (mapType) {
      case google.maps.MapTypeId.SATELLITE:
        // 위성 지도일 때 추가 설정
        break;
      case google.maps.MapTypeId.TERRAIN:
        // 지형 지도일 때 추가 설정
        break;
      default:
        // 기본 지도일 때 추가 설정
        break;
    }
  });
}

// 지도 클릭 이벤트 리스너 설정
function setupMapClickListeners() {
  if (!map) return;

  // 지도 클릭 이벤트
  map.addListener('click', function(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    console.log('지도 클릭:', lat, lng);
    
    // 경로 생성 모드일 때
    if (isRouteMode) {
      addRoutePoint(lat, lng);
    }
    
    // 마커 생성 모드일 때
    if (isMarkerMode) {
      addCustomMarker(lat, lng);
    }
  });
}

// 항로 표시 함수
function showFlightRoute() {
  if (!map) return;

  try {
    // 인천공항 좌표
    const incheon = { lat: 37.4602, lng: 126.4407 };
    // 치토세공항 좌표
    const chitose = { lat: 42.7752, lng: 141.6923 };

    // 항로 경로 생성
    const flightCoordinates = [
      incheon,
      { lat: 38.5, lng: 130.0 }, // 중간 지점 1
      { lat: 40.0, lng: 135.0 }, // 중간 지점 2
      chitose
    ];

    // 항로 폴리라인 생성
    flightPath = new google.maps.Polyline({
      path: flightCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3
    });

    // 점선 효과를 위한 추가 폴리라인
    dottedPath = new google.maps.Polyline({
      path: flightCoordinates,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 2,
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          fillOpacity: 1
        },
        offset: '0%',
        repeat: '20px'
      }]
    });

    // 항로를 지도에 추가
    flightPath.setMap(map);
    dottedPath.setMap(map);

    // 공항 마커 생성
    createAirportMarkers(incheon, chitose);

    // 항로 정보 표시
    showFlightInfo();

  } catch (error) {
    handleError(error, '항로 표시');
  }
}

// 공항 마커 생성
function createAirportMarkers(incheon, chitose) {
  if (!map) return;

  // 인천공항 마커
  incheonMarker = new google.maps.Marker({
    position: incheon,
    map: map,
    title: '인천국제공항',
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#2563eb"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12)
    }
  });

  // 치토세공항 마커
  chitoseMarker = new google.maps.Marker({
    position: chitose,
    map: map,
    title: '신치토세공항',
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#dc2626"/>
        </svg>
      `),
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12)
    }
  });

  // 마커 클릭 이벤트
  incheonMarker.addListener('click', function() {
    showAirportInfo(incheonMarker, '인천국제공항', '대한민국 인천광역시');
  });

  chitoseMarker.addListener('click', function() {
    showAirportInfo(chitoseMarker, '신치토세공항', '일본 홋카이도 치토세시');
  });
}

// 공항 정보 표시
function showAirportInfo(marker, title, description) {
  if (!map) return;

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${title}</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${description}</p>
      </div>
    `
  });

  infoWindow.open(map, marker);
  currentInfoWindow = infoWindow;
}

// 항로 정보 표시
function showFlightInfo() {
  if (!map) return;

  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">✈️ 홋카이도 항로</h3>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">인천국제공항 → 신치토세공항</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">예상 비행시간: 약 2시간 30분</p>
      </div>
    `,
    position: { lat: 40.0, lng: 135.0 }
  });

  infoWindow.open(map);
  currentInfoWindow = infoWindow;
}

// 현재 위치 표시
function showCurrentLocation() {
  if (!navigator.geolocation) {
    showNotification('이 브라우저는 위치 서비스를 지원하지 않습니다.', 'error');
    return;
  }

  const locationBtn = getElement('locationBtn');
  if (locationBtn) {
    locationBtn.classList.add('loading');
    locationBtn.disabled = true;
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (!isValidCoordinate(lat, lng)) {
        showNotification('유효하지 않은 위치 정보입니다.', 'error');
        return;
      }

      // 기존 현재 위치 마커 제거
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }

      // 현재 위치 마커 생성
      currentLocationMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: '현재 위치',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="white" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      });

      // 지도 중심을 현재 위치로 이동
      map.setCenter({ lat, lng });
      map.setZoom(15);

      // 현재 위치 정보 표시
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">📍 현재 위치</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">위도: ${lat.toFixed(6)}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">경도: ${lng.toFixed(6)}</p>
          </div>
        `
      });

      infoWindow.open(map, currentLocationMarker);
      currentInfoWindow = infoWindow;

      showNotification('현재 위치를 표시했습니다.', 'success');

    },
    function(error) {
      let errorMessage = '위치를 가져올 수 없습니다.';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '위치 접근이 거부되었습니다.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '위치 정보를 사용할 수 없습니다.';
          break;
        case error.TIMEOUT:
          errorMessage = '위치 요청이 시간 초과되었습니다.';
          break;
      }
      
      showNotification(errorMessage, 'error');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );

  // 로딩 상태 해제
  setTimeout(() => {
    if (locationBtn) {
      locationBtn.classList.remove('loading');
      locationBtn.disabled = false;
    }
  }, 2000);
}

// 지도 타입 변경
function changeMapType(mapType) {
  if (!map) return;

  const mapTypeId = google.maps.MapTypeId[mapType.toUpperCase()];
  if (mapTypeId) {
    map.setMapTypeId(mapTypeId);
    showNotification(`${mapType} 지도로 변경했습니다.`, 'success');
  } else {
    showNotification('지원하지 않는 지도 타입입니다.', 'error');
  }
}

// 지도 줌 레벨 변경
function setZoomLevel(level) {
  if (!map) return;

  const zoom = parseInt(level);
  if (zoom >= 1 && zoom <= 20) {
    map.setZoom(zoom);
    showNotification(`줌 레벨을 ${zoom}로 변경했습니다.`, 'success');
  } else {
    showNotification('유효하지 않은 줌 레벨입니다. (1-20)', 'error');
  }
}

// 지도 중심 이동
function panToLocation(lat, lng) {
  if (!map) return;

  if (!isValidCoordinate(lat, lng)) {
    showNotification('유효하지 않은 좌표입니다.', 'error');
    return;
  }

  map.panTo({ lat, lng });
  showNotification(`지도를 해당 위치로 이동했습니다.`, 'success');
}

// 지도 범위 설정
function fitBounds(bounds) {
  if (!map || !bounds) return;

  map.fitBounds(bounds);
  showNotification('지도 범위를 조정했습니다.', 'success');
}

// 지도 스타일 변경
function changeMapStyle(style) {
  if (!map) return;

  const styles = {
    default: [],
    night: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
    ],
    minimal: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ]
  };

  if (styles[style]) {
    map.setOptions({ styles: styles[style] });
    showNotification(`${style} 스타일로 변경했습니다.`, 'success');
  } else {
    showNotification('지원하지 않는 스타일입니다.', 'error');
  }
}

// 지도 컨트롤 표시/숨김
function toggleMapControls(show) {
  if (!map) return;

  map.setOptions({
    zoomControl: show,
    mapTypeControl: show,
    scaleControl: show,
    streetViewControl: show,
    rotateControl: show,
    fullscreenControl: show
  });
}

// 지도 정보 가져오기
function getMapInfo() {
  if (!map) return null;

  const center = map.getCenter();
  const zoom = map.getZoom();
  const mapType = map.getMapTypeId();
  const bounds = map.getBounds();

  return {
    center: {
      lat: center.lat(),
      lng: center.lng()
    },
    zoom: zoom,
    mapType: mapType,
    bounds: bounds ? {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng()
    } : null
  };
}

// 지도 상태 저장
function saveMapState() {
  const mapInfo = getMapInfo();
  if (mapInfo) {
    saveToLocalStorage('mapState', mapInfo);
    showNotification('지도 상태를 저장했습니다.', 'success');
  }
}

// 지도 상태 복원
function restoreMapState() {
  const mapInfo = loadFromLocalStorage('mapState');
  if (mapInfo && map) {
    map.setCenter(mapInfo.center);
    map.setZoom(mapInfo.zoom);
    if (mapInfo.mapType) {
      map.setMapTypeId(mapInfo.mapType);
    }
    showNotification('지도 상태를 복원했습니다.', 'success');
  }
}

// 지도 초기화
function resetMap() {
  if (!map) return;

  map.setCenter({ lat: 43.0642, lng: 141.3469 });
  map.setZoom(6);
  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  
  // 모든 마커 제거
  clearAllMarkers();
  
  showNotification('지도를 초기화했습니다.', 'success');
}

// 모든 마커 제거
function clearAllMarkers() {
  // 사용자 경로 마커들 제거
  userRouteMarkers.forEach(marker => marker.setMap(null));
  userRouteMarkers = [];

  // 커스텀 마커들 제거
  customMarkers.forEach(marker => marker.setMap(null));
  customMarkers = [];

  // 주소 검색 마커들 제거
  addressMarkers.forEach(marker => marker.setMap(null));
  addressMarkers = [];

  // 현재 위치 마커 제거
  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
    currentLocationMarker = null;
  }

  // 경로 제거
  if (userRoutePath) {
    userRoutePath.setMap(null);
    userRoutePath = null;
  }

  if (userRouteDottedPath) {
    userRouteDottedPath.setMap(null);
    userRouteDottedPath = null;
  }

  // 정보창 닫기
  if (currentInfoWindow) {
    currentInfoWindow.close();
    currentInfoWindow = null;
  }
}

// 전역으로 내보내기
window.MapModule = {
  initMap,
  optimizeMapForMobile,
  setupMapTypeListeners,
  setupMapClickListeners,
  showFlightRoute,
  createAirportMarkers,
  showAirportInfo,
  showFlightInfo,
  showCurrentLocation,
  changeMapType,
  setZoomLevel,
  panToLocation,
  fitBounds,
  changeMapStyle,
  toggleMapControls,
  getMapInfo,
  saveMapState,
  restoreMapState,
  resetMap,
  clearAllMarkers
};
