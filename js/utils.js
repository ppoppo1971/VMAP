// 공통 유틸리티 함수들

// 전역 변수들
let map;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let currentLocationMarker = null; // 현재 위치 마커 전역 변수
let geocoder = null; // 주소 변환용 Geocoder
let addressMarker = null; // 주소 검색 마커 (기존 호환성용)
let addressMarkers = []; // 주소 검색 마커들 (여러 마커 지원)
let currentInfoWindow = null; // 현재 열린 정보창
let addressSearchCandidates = []; // 주소 검색 후보들

// 항로와 마커 관련 전역 변수들
let flightPath = null;
let dottedPath = null;
let planeMarker = null;
let incheonMarker = null;
let chitoseMarker = null;

// 사용자 경로 관련 전역 변수들
let userRouteMarkers = []; // 사용자가 추가한 위치 마커들 (임시)
let userRoutePath = null; // 사용자 경로 폴리라인
let userRouteDottedPath = null; // 사용자 경로 점선 효과
let isRouteMode = false; // 경로 생성 모드

// 마커생성 모드 관련 전역 변수들
let isMarkerMode = false; // 마커생성 모드
let customMarkers = []; // 사용자가 생성한 마커들

// 저장된 사용자 경로들
let savedUserRoutes = []; // Firebase 동기화

// 마커 정보 저장소 (제목, 내용, 링크)
let markerInfoData = {}; // 형식: { "markerGroupName-index": { title: "", content: "", link: "" } }

// 경로 정보 저장소 (내용, 링크)
let routeInfoData = {}; // 형식: { routeId: { content: "", link: "" } }

// 최적화된 DOM 캐시
let cachedElements = {};
function getElement(id) {
  if (!cachedElements[id]) {
    cachedElements[id] = document.getElementById(id);
  }
  return cachedElements[id];
}

// 캐시 무효화 함수 (동적 요소 추가 시 사용)
function invalidateCache(key) {
  if (key) {
    delete cachedElements[key];
  } else {
    cachedElements = {}; // 전체 캐시 클리어
  }
}

// 모바일 최적화 함수
function optimizeForMobile() {
  if (isMobile) {
    // 모바일에서 더블탭 줌 방지
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // 모바일에서 지도 영역의 터치 이벤트 최적화
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.addEventListener('touchstart', function(event) {
        // 한 손가락 터치만 허용
        if (event.touches.length === 1) {
          event.stopPropagation();
        }
      }, { passive: true });
      
      mapElement.addEventListener('touchmove', function(event) {
        // 한 손가락 드래그 허용
        if (event.touches.length === 1) {
          event.stopPropagation();
        }
      }, { passive: true });
      
      // 모바일에서 핀치 줌 최적화
      mapElement.addEventListener('gesturestart', function(event) {
        event.preventDefault();
      }, { passive: false });
      
      mapElement.addEventListener('gesturechange', function(event) {
        event.preventDefault();
      }, { passive: false });
      
      mapElement.addEventListener('gestureend', function(event) {
        event.preventDefault();
      }, { passive: false });
    }
  }
}

// 좌표 유효성 검사 함수
function isValidCoordinate(lat, lng) {
  return typeof lat === 'number' && typeof lng === 'number' && 
         !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

// 거리 계산 함수 (하버사인 공식)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 날짜 포맷팅 함수
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 시간 포맷팅 함수
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 로컬 스토리지 헬퍼 함수들
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('로컬 스토리지 저장 실패:', error);
    return false;
  }
}

function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('로컬 스토리지 로드 실패:', error);
    return null;
  }
}

function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('로컬 스토리지 삭제 실패:', error);
    return false;
  }
}

// 디바운스 함수
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 스로틀 함수
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 에러 핸들링 함수
function handleError(error, context = '') {
  console.error(`에러 발생 ${context}:`, error);
  
  // 사용자에게 에러 메시지 표시
  if (typeof showNotification === 'function') {
    showNotification(`오류가 발생했습니다: ${error.message || error}`, 'error');
  } else {
    alert(`오류가 발생했습니다: ${error.message || error}`);
  }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
  // 간단한 알림 시스템 구현
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(notification);
  
  // 3초 후 자동 제거
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// URL 파라미터 파싱 함수
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// URL 파라미터 설정 함수
function setUrlParameter(name, value) {
  const url = new URL(window.location);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url);
}

// 디바이스 타입 감지
function getDeviceType() {
  if (isMobile) {
    return 'mobile';
  } else if (window.innerWidth <= 768) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// 뷰포트 크기 감지
function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// 브라우저 지원 여부 확인
function checkBrowserSupport() {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    geolocation: 'geolocation' in navigator,
    webGL: !!window.WebGLRenderingContext,
    canvas: !!document.createElement('canvas').getContext,
    fetch: typeof fetch !== 'undefined'
  };
  
  return features;
}

// 성능 측정 함수
function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} 실행 시간: ${end - start}ms`);
  return result;
}

// 메모리 사용량 확인 (개발용)
function checkMemoryUsage() {
  if (performance.memory) {
    const memory = performance.memory;
    console.log('메모리 사용량:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
}

// 객체 깊은 복사 함수
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// 배열 중복 제거 함수
function removeDuplicates(array, key) {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  } else {
    return [...new Set(array)];
  }
}

// 숫자 포맷팅 함수
function formatNumber(num, decimals = 0) {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// 통화 포맷팅 함수
function formatCurrency(amount, currency = 'KRW') {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// 날짜 범위 유효성 검사
function isValidDateRange(startDate, endDate) {
  return startDate instanceof Date && endDate instanceof Date && startDate <= endDate;
}

// 파일 다운로드 함수
function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// CSV 데이터 생성 함수
function createCSV(data, headers) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  return csvContent;
}

// JSON 데이터 검증 함수
function validateJSON(data) {
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

// 비동기 함수 재시도 함수
async function retryAsync(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// 이벤트 리스너 정리 함수
function cleanupEventListeners(element, eventType) {
  if (element && eventType) {
    element.removeEventListener(eventType, arguments.callee);
  }
}

// 전역 변수 초기화 함수
function initializeGlobals() {
  // 모든 전역 변수를 초기 상태로 리셋
  map = null;
  currentLocationMarker = null;
  geocoder = null;
  addressMarker = null;
  addressMarkers = [];
  currentInfoWindow = null;
  addressSearchCandidates = [];
  
  flightPath = null;
  dottedPath = null;
  planeMarker = null;
  incheonMarker = null;
  chitoseMarker = null;
  
  userRouteMarkers = [];
  userRoutePath = null;
  userRouteDottedPath = null;
  isRouteMode = false;
  
  isMarkerMode = false;
  customMarkers = [];
  
  savedUserRoutes = [];
  markerInfoData = {};
  routeInfoData = {};
  
  cachedElements = {};
}

// 페이지 언로드 시 정리 함수
function cleanupOnUnload() {
  // 이벤트 리스너 정리
  window.removeEventListener('beforeunload', cleanupOnUnload);
  
  // 전역 변수 정리
  initializeGlobals();
  
  // 메모리 정리
  if (typeof gc === 'function') {
    gc();
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 모바일 최적화 적용
  optimizeForMobile();
  
  // 브라우저 지원 확인
  const support = checkBrowserSupport();
  if (!support.localStorage) {
    showNotification('로컬 스토리지를 지원하지 않는 브라우저입니다.', 'error');
  }
  
  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', cleanupOnUnload);
});

// 전역으로 내보내기
window.Utils = {
  getElement,
  invalidateCache,
  optimizeForMobile,
  isValidCoordinate,
  calculateDistance,
  formatDate,
  formatTime,
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  debounce,
  throttle,
  handleError,
  showNotification,
  getUrlParameter,
  setUrlParameter,
  getDeviceType,
  getViewportSize,
  checkBrowserSupport,
  measurePerformance,
  checkMemoryUsage,
  deepClone,
  removeDuplicates,
  formatNumber,
  formatCurrency,
  isValidDateRange,
  downloadFile,
  createCSV,
  validateJSON,
  retryAsync,
  cleanupEventListeners,
  initializeGlobals,
  cleanupOnUnload
};
