import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';
import TripCard from '../components/TripCard';
import CreateTripModal from '../components/CreateTripModal';
import JoinTripModal from '../components/JoinTripModal';

export default function HomePage() {
  const { trips, deleteTrip } = useTrip();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white px-4 py-4 border-b">
        <h1 className="text-xl font-bold text-center">旅行小助手</h1>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {trips.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">还没有行程</p>
            <p className="text-sm">创建一个行程，邀请朋友一起规划吧</p>
          </div>
        )}
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} onDelete={deleteTrip} />
        ))}
      </div>

      <div className="p-4 flex gap-3 bg-white border-t">
        <button onClick={() => setShowCreate(true)}
          className="flex-1 bg-blue-500 text-white rounded-lg py-3 font-semibold">
          创建行程
        </button>
        <button onClick={() => setShowJoin(true)}
          className="flex-1 border border-blue-500 text-blue-500 rounded-lg py-3 font-semibold">
          加入行程
        </button>
      </div>

      <CreateTripModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinTripModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
