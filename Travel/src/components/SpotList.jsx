import { useState } from 'react';
import { useSpots } from '../hooks/useSpots';
import { useTrip } from '../contexts/TripContext';

export default function SpotList({ results, tripId, spots }) {
  const { addSpot } = useSpots();
  const { loadTrip } = useTrip();
  const [dayPicker, setDayPicker] = useState(null);
  const [adding, setAdding] = useState(false);

  const spotPoiIds = new Set(spots.map((s) => s.poi_id));

  const handleAdd = async (dayNumber) => {
    if (!dayPicker) return;
    setAdding(true);
    try {
      await addSpot(tripId, dayPicker, dayNumber);
      await loadTrip(tripId);
      setDayPicker(null);
    } finally {
      setAdding(false);
    }
  };

  if (results.length === 0) {
    return <div className="p-6 text-center text-gray-400 text-sm">搜索景点来添加</div>;
  }

  return (
    <div className="divide-y">
      {results.map((poi, i) => {
        const added = spotPoiIds.has(poi.id);
        return (
          <div key={poi.id || i} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{poi.name}</p>
              <p className="text-xs text-gray-400 truncate">{poi.address || poi.pname}</p>
            </div>
            {added ? (
              <span className="text-xs text-green-400 shrink-0">已添加</span>
            ) : (
              <button onClick={() => setDayPicker(poi)}
                className="text-xs bg-blue-500 text-white rounded-full px-3 py-1 shrink-0">
                想去
              </button>
            )}
          </div>
        );
      })}

      {/* Day picker modal */}
      {dayPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setDayPicker(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xs p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-semibold mb-1">{dayPicker.name}</p>
            <p className="text-xs text-gray-400 mb-4">添加到哪一天？</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <button key={d} onClick={() => handleAdd(d)} disabled={adding}
                  className="border rounded-lg py-2 text-sm font-medium active:bg-blue-50 disabled:opacity-50">
                  Day {d}
                </button>
              ))}
            </div>
            <button onClick={() => setDayPicker(null)}
              className="w-full mt-3 text-gray-400 text-sm py-2">取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
