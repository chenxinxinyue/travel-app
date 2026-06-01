import { useState } from 'react';

export default function SpotSearch({ onResults, city, mapRef }) {
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim() || !mapRef.current) return;
    setSearching(true);
    const results = await mapRef.current.searchPOI(keyword, city || '全国');
    onResults(results);
    setSearching(false);

    // Show search results on map
    if (results.length > 0) {
      const { AMap } = mapRef.current;
      mapRef.current.clearMarkers();
      results.forEach((poi) => {
        const [lng, lat] = [poi.location.lng, poi.location.lat];
        const marker = new AMap.Marker({
          position: [lng, lat],
          title: poi.name,
        });
        mapRef.current.map.add(marker);
        mapRef.current.markersRef.current.push(marker);
      });
      mapRef.current.fitView(results.map((p) => ({ lng: p.location.lng, lat: p.location.lat })));
    }
  };

  return (
    <div className="px-3 py-2 bg-white border-b flex gap-2">
      <input
        className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
        placeholder={`搜索${city ? city + '的' : ''}景点...`}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={searching}
        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
        {searching ? '搜索中' : '搜索'}
      </button>
    </div>
  );
}
