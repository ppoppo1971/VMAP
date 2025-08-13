// 브이월드 WFS 데모. 참고: https://just-joat.tistory.com/12

/* 구성
 - 베이스맵: 브이월드 WMTS(회색 기반)
 - WFS 레이어 1: 연속지적도(예: L2_LCTZC_BS - 지적도 경계; 공공데이터 포털 명칭과 다를 수 있음)
 - WFS 레이어 2: 샘플 레이어(lt_c_uq111 예시)
 - 현재 화면 범위(BBOX)에 대해서만 GetFeature 수행
*/

// 사용자 설정
const VWORLD_API_KEY = '46F4304E-84DC-3F56-92F1-6A98A0370A31';
const REGISTERED_DOMAIN = 'https://ppoppo1971.github.io';

// 좌표계 참고: EPSG:3857 (Web Mercator)

// 지도 생성
const baseLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
    crossOrigin: 'anonymous'
  })
});

const map = new ol.Map({
  target: 'map',
  layers: [baseLayer],
  view: new ol.View({
    center: ol.proj.fromLonLat([127.0, 37.5]),
    zoom: 7,
    minZoom: 6,
    maxZoom: 19
  }),
  controls: ol.control.defaults().extend([new ol.control.ScaleLine()])
});

// WFS 레이어 컨테이너
const cadastralLayerGroup = new ol.layer.Group({ layers: [] });
const sampleLayerGroup = new ol.layer.Group({ layers: [] });
map.addLayer(cadastralLayerGroup);
map.addLayer(sampleLayerGroup);

// 유틸: 현재 뷰 BBOX(EPSG:3857) 계산
function getCurrentBBOX() {
  const extent = map.getView().calculateExtent(map.getSize());
  return extent.join(',');
}

// 유틸: 디바운스
function debounce(func, wait) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

// WFS 요청 URL 생성기
function buildVWorldWfsUrl(params) {
  const defaultParams = {
    SERVICE: 'WFS',
    REQUEST: 'GetFeature',
    VERSION: '1.1.0',
    OUTPUT: 'application/json',
    SRSNAME: 'EPSG:900913',
    EXCEPTIONS: 'text/xml',
    MAXFEATURES: '500',
    KEY: VWORLD_API_KEY,
    DOMAIN: REGISTERED_DOMAIN
  };
  const merged = { ...defaultParams, ...params };
  const query = Object.entries(merged)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `https://api.vworld.kr/req/wfs?${query}`;
}

// 피처를 벡터 레이어로 만들어 그룹에 추가
function addFeaturesToGroup(features, group, style) {
  if (!features || features.length === 0) return;
  const vectorSource = new ol.source.Vector({ features });
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style
  });
  group.getLayers().push(vectorLayer);
}

// 그룹 레이어 초기화
function clearGroup(group) {
  group.getLayers().clear();
}

// GeoJSON 피처 변환
function toOlFeatures(geojson) {
  const format = new ol.format.GeoJSON();
  return format.readFeatures(geojson, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
}

// 연속지적도 스타일(경계선 강조)
const cadastralStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ color: 'rgba(231, 76, 60, 0.9)', width: 2 }),
  fill: new ol.style.Fill({ color: 'rgba(231, 76, 60, 0.05)' })
});

// 샘플 레이어 스타일
const sampleStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ color: 'rgba(41, 128, 185, 0.9)', width: 2 }),
  fill: new ol.style.Fill({ color: 'rgba(41, 128, 185, 0.05)' })
});

// 연속지적도 로드
async function loadCadastral() {
  const bbox = getCurrentBBOX();
  // TYPENAME은 브이월드 제공 레이어명을 사용해야 합니다. 예시로 지적도 경계형 레이어 식별자를 사용합니다.
  // 실제 서비스에서 사용 중인 이름으로 교체가 필요할 수 있습니다.
  const url = buildVWorldWfsUrl({
    TYPENAME: 'lp_pa_cbnd',
    BBOX: bbox
  });
  const res = await fetch(url);
  if (!res.ok) return;
  const data = await res.json();
  const features = toOlFeatures(data);
  clearGroup(cadastralLayerGroup);
  addFeaturesToGroup(features, cadastralLayerGroup, cadastralStyle);
}

// 샘플 레이어 로드 (참고글의 예시 TYPENAME 사용)
async function loadSample() {
  const bbox = getCurrentBBOX();
  const url = buildVWorldWfsUrl({
    TYPENAME: 'lt_c_uq111',
    BBOX: bbox
  });
  const res = await fetch(url);
  if (!res.ok) return;
  const data = await res.json();
  const features = toOlFeatures(data);
  clearGroup(sampleLayerGroup);
  addFeaturesToGroup(features, sampleLayerGroup, sampleStyle);
}

// 토글 핸들러
document.getElementById('toggleCadastral').addEventListener('change', (e) => {
  cadastralLayerGroup.setVisible(e.target.checked);
});
document.getElementById('toggleSample').addEventListener('change', (e) => {
  sampleLayerGroup.setVisible(e.target.checked);
  if (e.target.checked && sampleLayerGroup.getLayers().getLength() === 0) {
    debouncedReload();
  }
});

// 뷰 변경 시 재요청 (디바운스)
const debouncedReload = debounce(() => {
  if (document.getElementById('toggleCadastral').checked) loadCadastral();
  if (document.getElementById('toggleSample').checked) loadSample();
}, 400);

map.getView().on('change:center', debouncedReload);
map.getView().on('change:resolution', debouncedReload);

// 수동 새로고침 버튼
document.getElementById('refreshBtn').addEventListener('click', () => debouncedReload());

// 초기 로드
debouncedReload();


