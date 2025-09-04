# 홋카이도 여행플랜 웹 애플리케이션

홋카이도 여행을 위한 종합적인 웹 애플리케이션으로, 지도 기반 여행 계획, 가계부 관리, 일정 관리 등의 기능을 제공합니다.

## 📁 프로젝트 구조

```
travelplan2/
├── css/                          # CSS 스타일 파일들
│   ├── main.css                  # 메인 스타일 (지도, 메뉴, 공통 요소)
│   ├── dialogs.css               # 다이얼로그 및 모달 스타일
│   └── account.css               # 가계부 페이지 전용 스타일
├── js/                           # JavaScript 모듈들
│   ├── utils.js                  # 공통 유틸리티 함수들
│   ├── map.js                    # 지도 관련 기능
│   ├── menu.js                   # 메뉴 시스템
│   ├── markers.js                # 마커 관리 (예정)
│   ├── routes.js                 # 경로 관리 (예정)
│   ├── schedule.js               # 일정 관리 (예정)
│   ├── firebase.js               # Firebase 연동 (예정)
│   └── account.js                # 가계부 기능
├── components/                    # 재사용 가능한 컴포넌트들
│   └── base.html                 # 공통 베이스 HTML 템플릿
├── assets/                        # 이미지, 아이콘 등 정적 자원
├── index.html                     # 원본 메인 페이지
├── index_optimized.html           # 모듈화된 메인 페이지
├── account.html                   # 원본 가계부 페이지
├── account_optimized.html         # 모듈화된 가계부 페이지
└── README.md                      # 프로젝트 문서
```

## 🚀 주요 기능

### 1. 지도 기반 여행 계획
- 구글 맵 API를 활용한 인터랙티브 지도
- 홋카이도 주요 관광지 마커 표시
- 사용자 정의 경로 생성 및 저장
- 실시간 위치 추적

### 2. 가계부 관리
- 여행 경비 체계적 관리
- 카테고리별 지출 분류
- 다중 통화 지원 (KRW, JPY)
- CSV 내보내기 기능

### 3. 일정 관리
- 여행 일정 생성 및 편집
- 체크리스트 기능
- 사전준비 항목 관리

### 4. 모바일 최적화
- 반응형 디자인
- 터치 친화적 인터페이스
- 모바일 전용 제스처 지원

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Google Maps API
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth

## 📦 모듈 구조

### CSS 모듈화
- **main.css**: 기본 레이아웃, 지도 스타일, 메뉴 시스템
- **dialogs.css**: 모달, 다이얼로그, 정보창 스타일
- **account.css**: 가계부 전용 스타일

### JavaScript 모듈화
- **utils.js**: 공통 유틸리티 함수, 전역 변수 관리
- **map.js**: 지도 초기화, 마커 관리, 경로 표시
- **menu.js**: 메뉴 시스템, 네비게이션
- **account.js**: 가계부 CRUD, 통계, 내보내기

## 🔧 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone [repository-url]
   cd travelplan2
   ```

2. **웹 서버 실행**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # 또는 Live Server 확장 프로그램 사용
   ```

3. **브라우저에서 접속**
   ```
   http://localhost:8000/index_optimized.html
   ```

## 🔑 API 키 설정

Google Maps API 키를 설정해야 합니다:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Maps JavaScript API 활성화
3. API 키 생성 및 제한 설정
4. `index_optimized.html`에서 API 키 교체

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry,directions,places&callback=initMap" async defer></script>
```

## 📱 모바일 지원

- iOS Safari, Android Chrome 최적화
- 터치 제스처 지원
- 반응형 레이아웃
- PWA 준비 (Service Worker 추가 가능)

## 🔄 데이터 동기화

- **로컬 스토리지**: 오프라인 데이터 저장
- **Firebase**: 클라우드 동기화
- **오프라인 지원**: 네트워크 연결 없이도 기본 기능 사용 가능

## 🎨 커스터마이징

### 스타일 수정
각 CSS 파일을 수정하여 디자인을 변경할 수 있습니다:

```css
/* css/main.css에서 색상 테마 변경 */
:root {
  --primary-color: #1d4ed8;
  --secondary-color: #3b82f6;
  --accent-color: #10b981;
}
```

### 기능 추가
새로운 JavaScript 모듈을 추가하여 기능을 확장할 수 있습니다:

```javascript
// js/new-feature.js
window.NewFeatureModule = {
  init: function() {
    // 초기화 로직
  },
  // 기타 함수들
};
```

## 🐛 문제 해결

### 일반적인 문제들

1. **지도가 표시되지 않음**
   - API 키가 올바른지 확인
   - 도메인 제한 설정 확인
   - 브라우저 콘솔에서 에러 메시지 확인

2. **데이터가 저장되지 않음**
   - 로컬 스토리지 지원 여부 확인
   - Firebase 연결 상태 확인

3. **모바일에서 레이아웃 깨짐**
   - 뷰포트 메타 태그 확인
   - CSS 미디어 쿼리 확인

## 📈 성능 최적화

- **이미지 최적화**: WebP 형식 사용 권장
- **코드 분할**: 필요에 따라 모듈 로딩
- **캐싱**: Service Worker로 정적 자원 캐싱
- **압축**: Gzip/Brotli 압축 사용

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.

---

**개발자**: 홋카이도 여행플랜 팀  
**버전**: 2.0.0  
**최종 업데이트**: 2024년 9월
