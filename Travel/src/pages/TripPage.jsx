import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import MapView from '../components/MapView';

export default function TripPage() {
  const { id } = useParams();
  const { loadTrip, spots, participants } = useTrip();
  const mapRef = useRef(null);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-[0.55]">
        <MapView spots={spots} participants={participants} onMapReady={(api) => { mapRef.current = api; }} />
      </div>
      <div className="flex-[0.45] flex items-center justify-center text-gray-300 text-sm">
        景点搜索和时间线（即将实现）
      </div>
    </div>
  );
}
