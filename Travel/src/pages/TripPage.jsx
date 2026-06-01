import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import MapView from '../components/MapView';
import SpotSearch from '../components/SpotSearch';
import SpotList from '../components/SpotList';

export default function TripPage() {
  const { id } = useParams();
  const { loadTrip, spots, participants, currentTrip } = useTrip();
  const mapRef = useRef(null);
  const [tab, setTab] = useState('list');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  return (
    <div className="h-full flex flex-col">
      <SpotSearch onResults={setSearchResults} city={currentTrip?.destination} mapRef={mapRef} />
      <div className="flex-[0.55]">
        <MapView spots={spots} participants={participants} onMapReady={(api) => { mapRef.current = api; }} />
      </div>
      <div className="flex-[0.45] flex flex-col">
        <div className="flex border-b">
          <button onClick={() => setTab('list')}
            className={`flex-1 py-2.5 text-sm ${tab === 'list' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            景点列表
          </button>
          <button onClick={() => setTab('timeline')}
            className={`flex-1 py-2.5 text-sm ${tab === 'timeline' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            时间线
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {tab === 'list'
            ? <SpotList results={searchResults} tripId={id} spots={spots} />
            : <div className="flex items-center justify-center h-full text-gray-300 text-sm">即将实现</div>
          }
        </div>
      </div>
    </div>
  );
}
