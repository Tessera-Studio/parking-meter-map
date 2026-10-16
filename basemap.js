/* 地図の下地（ベクトル地図）。OpenFreeMap の OpenMapTiles を、このアプリ用の色で描く。
   鍵は要らない。ラベルは地名・駅名・道路名だけにし、区間の線とPマークが主役になるよう色を抑える。
   いつも明るい配色。detail：「詳しい地図」（建物・施設名・細い道の名前も出す） */
(function () {
  const ATTR = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';

  const PALETTE = {
    light: {
      land: '#F2F1EE', park: '#E2E9DC', water: '#CBDBE6', building: '#E7E5E0', buildingLine: '#DCD9D3',
      minor: '#FFFFFF', major: '#FFFFFF', motorway: '#FFFFFF', casing: '#DEDBD5', rail: '#D2CFC9',
      label: '#6B6F75', labelStrong: '#3E4146', road: '#8C9096', waterLabel: '#6E8CA3', halo: '#F2F1EE',
    },
  };

  const NAME = ['coalesce', ['get', 'name:ja'], ['get', 'name']];
  const FONT = ['Noto Sans Regular'];
  const BOLD = ['Noto Sans Bold'];
  // ズームで太さを変える（z12 → z20）
  const width = (a, b) => ['interpolate', ['exponential', 1.6], ['zoom'], 12, a, 20, b];
  const notTunnel = ['!=', ['get', 'brunnel'], 'tunnel'];
  const roadClass = list => ['all', ['match', ['get', 'class'], list, true, false], notTunnel];

  function style(detail) {
    const c = PALETTE.light;
    const text = (color, size) => ({ 'text-color': color, 'text-halo-color': c.halo, 'text-halo-width': 1.4 });
    const layers = [
      { id: 'land', type: 'background', paint: { 'background-color': c.land } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': c.park } },
      { id: 'green', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['match', ['get', 'class'], ['grass', 'wood'], true, false], paint: { 'fill-color': c.park, 'fill-opacity': .7 } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': c.water } },
      { id: 'river', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 12, paint: { 'line-color': c.water, 'line-width': width(1, 6) } },
      { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: detail ? 14 : 15,
        paint: { 'fill-color': c.building, 'fill-outline-color': c.buildingLine, 'fill-opacity': detail ? 1 : .7 } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 11,
        filter: ['all', ['match', ['get', 'class'], ['rail', 'transit'], true, false], notTunnel],
        paint: { 'line-color': c.rail, 'line-width': width(1, 3) } },
      // 道路：細い道 → 幹線 → 高速の順に重ねる。縁は高速・幹線だけ
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 13,
        filter: roadClass(['minor', 'service']), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.minor, 'line-width': width(.5, 12) } },
      { id: 'road-major-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 10,
        filter: roadClass(['primary', 'secondary', 'tertiary', 'trunk', 'motorway']), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.casing, 'line-width': width(2, 22) } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 8,
        filter: roadClass(['primary', 'secondary', 'tertiary']), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.major, 'line-width': width(1.2, 19) } },
      { id: 'road-motorway', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 6,
        filter: roadClass(['motorway', 'trunk']), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.motorway, 'line-width': width(1.6, 20) } },
      { id: 'water-name', type: 'symbol', source: 'omt', 'source-layer': 'water_name',
        layout: { 'text-field': NAME, 'text-font': FONT, 'text-size': 12 }, paint: text(c.waterLabel) },
      { id: 'road-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: detail ? 14 : 15,
        filter: detail ? ['has', 'name'] : ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], true, false],
        layout: { 'symbol-placement': 'line', 'text-field': NAME, 'text-font': FONT, 'text-size': 11, 'symbol-spacing': 400 },
        paint: text(c.road) },
      { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place',
        filter: ['match', ['get', 'class'], ['city', 'town', 'village', 'suburb', 'quarter', 'neighbourhood'], true, false],
        layout: {
          'text-field': NAME, 'text-font': FONT, 'text-max-width': 8,
          'text-size': ['match', ['get', 'class'], 'city', 16, 'town', 14, 'suburb', 13, 12],
        },
        paint: text(c.label) },
      // 駅名は場所の手がかりなので、いつも出す
      { id: 'station', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 12,
        filter: ['all', ['==', ['get', 'class'], 'railway'], ['match', ['get', 'subclass'], ['station', 'halt'], true, false]],
        layout: { 'text-field': NAME, 'text-font': BOLD, 'text-size': 12, 'text-max-width': 8 },
        paint: text(c.labelStrong) },
      // 大きな施設の名前（詳しい地図では施設名を広く出す）
      { id: 'poi', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: detail ? 15 : 16,
        filter: ['all', ['!=', ['get', 'class'], 'railway'], ['<=', ['get', 'rank'], detail ? 40 : 6]],
        layout: { 'text-field': NAME, 'text-font': FONT, 'text-size': 11, 'text-max-width': 7 },
        paint: text(c.label) },
    ];
    return {
      version: 8,
      sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: ATTR } },
      glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      layers,
    };
  }

  // WebGL が使えるか（使えなければ画像の地図に切り替える）
  function supported() {
    try {
      const cv = document.createElement('canvas');
      return !!(window.maplibregl && L.maplibreGL && (cv.getContext('webgl2') || cv.getContext('webgl')));
    } catch (e) { return false; }
  }

  window.Basemap = { style, supported, ATTR };
})();
