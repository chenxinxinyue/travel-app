import { useNavigate } from 'react-router-dom';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-sm border p-4 mb-3 active:bg-gray-50"
      onClick={() => navigate(`/trip/${trip._id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{trip.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{trip.destination}</p>
          <p className="text-gray-300 text-xs mt-0.5">
            {trip.start_date} ~ {trip.end_date}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(trip._id); }}
          className="text-gray-300 text-xs active:text-red-400"
        >
          删除
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        邀请码: <span className="font-mono text-blue-400">{trip.invite_code}</span>
      </div>
    </div>
  );
}
