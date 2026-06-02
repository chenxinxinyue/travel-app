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
          <div className="text-center text-gray-400 mt-12">
            <p className="text-5xl mb-4">🗺</p>
            <p className="text-lg font-semibold text-gray-500 mb-2">开始规划旅行吧</p>
            <p className="text-sm mb-6">创建新行程，或输入朋友分享的邀请码加入</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={() => setShowCreate(true)}
                className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-lg">
                + 创建行程
              </button>
              <button onClick={() => setShowJoin(true)}
                className="w-full border-2 border-blue-500 text-blue-500 rounded-xl py-3 font-semibold text-lg">
                邀请码加入
              </button>
            </div>
          </div>
        )}
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} onDelete={deleteTrip} />
        ))}
      </div>

      {trips.length > 0 && (
        <div className="p-3 bg-white border-t">
          <p className="text-xs text-gray-400 text-center mb-2">邀请朋友用邀请码加入</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(true)}
              className="flex-1 bg-blue-500 text-white rounded-lg py-2.5 font-semibold">
              创建行程
            </button>
            <button onClick={() => setShowJoin(true)}
              className="flex-1 border-2 border-blue-500 text-blue-500 rounded-lg py-2.5 font-semibold">
              邀请码加入
            </button>
          </div>
        </div>
      )}

      <CreateTripModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinTripModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
