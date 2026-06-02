import { useState, useEffect, useRef } from 'react';

export default function SpotSearch({ onResults, city, mapRef, mapReady }) {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const doSearch = async (kw) => {
    if (!kw.trim()) { onResults([]); return; }
    if (!mapRef.current) { setError('地图还在加载中...'); return; }
    setError('');
    setSearching(true);
    try {
      const results = await mapRef.current.searchPOI(kw, city || '全国');
      onResults(results);
      if (results.length === 0) {
        setError('未找到相关景点');
      } else {
        mapRef.current.showSearchMarkers(results);
      }
    } catch { setError('搜索失败，请重试'); }
    finally { setSearching(false); }
  };

  const handleClear = () => {
    setKeyword('');
    onResults([]);
    setError('');
    if (mapRef.current) mapRef.current.clearSearchMarkers();
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setKeyword(v);
    setError('');
    clearTimeout(timerRef.current);
    if (!v.trim()) { onResults([]); mapRef.current?.clearSearchMarkers(); return; }
    timerRef.current = setTimeout(() => doSearch(v), 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current);
      if (!keyword.trim()) { handleClear(); return; }
      doSearch(keyword);
    }
  };

  return (
    <div className="px-3 py-2 bg-white border-b">
      <div className="flex gap-2 relative">
        <input
          className="flex-1 border rounded-lg pl-3 pr-8 py-2 text-sm bg-gray-50"
          placeholder={mapReady ? (city ? `搜索${city}的景点...` : '搜索景点...') : '地图加载中...'}
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!mapReady}
        />
        {keyword && (
          <button onClick={handleClear}
            className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm px-1 z-10">
            ✕
          </button>
        )}
        <button onClick={() => doSearch(keyword)} disabled={searching || !mapReady}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {searching ? '搜索中' : '搜索'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
