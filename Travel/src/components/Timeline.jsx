import { useSpots } from '../hooks/useSpots';
import { useTrip } from '../contexts/TripContext';

export default function Timeline({ spots, tripId, currentTrip }) {
  const { removeSpot } = useSpots();
  const { loadTrip } = useTrip();

  if (!currentTrip) return null;

  const start = new Date(currentTrip.start_date);
  const end = new Date(currentTrip.end_date);
  const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

  const grouped = {};
  for (let d = 1; d <= dayCount; d++) {
    grouped[d] = spots.filter((s) => s.day_number === d);
  }

  const handleRemove = async (spotId) => {
    await removeSpot(spotId);
    await loadTrip(tripId);
  };

  return (
    <div className="divide-y">
      {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
        <div key={day} className="px-4 py-3">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Day {day}</h4>
          {grouped[day]?.length === 0 && (
            <p className="text-xs text-gray-300 pl-2">暂无安排</p>
          )}
          {grouped[day]?.map((spot) => (
            <div key={spot.id} className="flex items-center gap-2 pl-2 py-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{spot.name}</p>
                {spot.address && <p className="text-xs text-gray-400 truncate">{spot.address}</p>}
              </div>
              <button onClick={() => handleRemove(spot.id)}
                className="text-xs text-gray-300 active:text-red-400 shrink-0">移除</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
