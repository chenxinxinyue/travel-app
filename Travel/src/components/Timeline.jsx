import { useState } from 'react';
import { useSpots } from '../hooks/useSpots';
import { useTrip } from '../contexts/TripContext';

export default function Timeline({ spots, tripId, currentTrip, myParticipantId, onFocus }) {
  const { removeSpot } = useSpots();
  const { loadTrip } = useTrip();
  const [confirming, setConfirming] = useState(null);

  if (!currentTrip) return null;

  const start = new Date(currentTrip.start_date);
  const end = new Date(currentTrip.end_date);
  const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const grouped = {};
  for (let d = 1; d <= dayCount; d++) {
    grouped[d] = spots.filter((s) => s.day_number === d);
  }

  const handleRemoveRequest = (spotId) => {
    setConfirming(spotId);
  };

  const handleRemove = async (spotId) => {
    await removeSpot(spotId);
    await loadTrip(tripId);
    setConfirming(null);
  };

  return (
    <div className="divide-y">
      {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
        <div key={day} className="px-4 py-3">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Day {day}</h4>
          {grouped[day]?.length === 0 && (
            <p className="text-xs text-gray-300 pl-2">暂无安排</p>
          )}
          {grouped[day]?.map((spot) => {
            const isMine = myParticipantId && spot.added_by_id === myParticipantId;
            return (
            <div key={spot._id} className="flex items-center gap-2 pl-2 py-1.5 group active:bg-gray-50"
              onClick={() => onFocus?.({ lng: spot.lng, lat: spot.lat })}>
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{spot.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {spot.address && <span>{spot.address}</span>}
                  {spot.added_by && <span> · {spot.added_by}添加</span>}
                </p>
              </div>
              {isMine && confirming !== spot._id && (
                <button onClick={() => handleRemoveRequest(spot._id)}
                  className="text-xs text-gray-300 active:text-red-400 shrink-0 opacity-0 group-hover:opacity-100">
                  删除
                </button>
              )}
              {isMine && confirming === spot._id && (
                <span className="flex gap-1 shrink-0">
                  <button onClick={() => handleRemove(spot._id)}
                    className="text-xs bg-red-400 text-white rounded px-2 py-0.5">确认</button>
                  <button onClick={() => setConfirming(null)}
                    className="text-xs bg-gray-200 rounded px-2 py-0.5">取消</button>
                </span>
              )}
            </div>
          )})}
        </div>
      ))}
    </div>
  );
}
