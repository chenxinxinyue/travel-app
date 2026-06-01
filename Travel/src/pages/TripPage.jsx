import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { db } from '../lib/cloudbase';
import MapView from '../components/MapView';
import SpotSearch from '../components/SpotSearch';
import SpotList from '../components/SpotList';
import Timeline from '../components/Timeline';

export default function TripPage() {
  const { id } = useParams();
  const { loadTrip, spots, participants, currentTrip, getMyParticipant } = useTrip();
  const mapRef = useRef(null);
  const [tab, setTab] = useState('list');
  const [searchResults, setSearchResults] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  // Load friend locations periodically
  useEffect(() => {
    if (!id || !participants.length) return;
    const loadLocations = async () => {
      const { data } = await db.collection('locations').where({ trip_id: id }).get();
      if (data) setLocations(data);
    };
    loadLocations();
    const interval = setInterval(loadLocations, 30000);
    return () => clearInterval(interval);
  }, [id, participants.length]);

  const shareLocation = async () => {
    if (!mapRef.current) return;
    setSharingLocation(true);
    const timeout = setTimeout(() => setSharingLocation(false), 15000);
    try {
      const { AMap } = mapRef.current;
      AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({ enableHighAccuracy: true, timeout: 10000 });
        geolocation.getCurrentPosition(async (status, result) => {
          clearTimeout(timeout);
          if (status === 'complete') {
            const myInfo = getMyParticipant(id);
            if (myInfo) {
              const { data: existing } = await db.collection('locations')
                .where({ trip_id: id, participant_id: myInfo.participantId }).get();
              const locData = {
                trip_id: id,
                participant_id: myInfo.participantId,
                lat: result.position.lat,
                lng: result.position.lng,
                updated_at: new Date().toISOString(),
              };
              if (existing && existing.length > 0) {
                await db.collection('locations').doc(existing[0]._id).update(locData);
              } else {
                await db.collection('locations').add(locData);
              }
              await loadTrip(id);
            }
          }
          setSharingLocation(false);
        });
      });
    } catch { clearTimeout(timeout); setSharingLocation(false); }
  };

  return (
    <div className="h-full flex flex-col">
      <SpotSearch onResults={setSearchResults} city={currentTrip?.destination} mapRef={mapRef} />
      <div className="px-3 py-1.5 bg-blue-50 border-b flex justify-center">
        <button onClick={shareLocation} disabled={sharingLocation}
          className="text-xs bg-blue-500 text-white rounded-full px-4 py-1 disabled:opacity-50">
          {sharingLocation ? '定位中...' : '📍 共享我的位置'}
        </button>
      </div>
      <div className="flex-[0.55]">
        <MapView spots={spots} participants={participants} locations={locations} onMapReady={(api) => { mapRef.current = api; }} />
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
            : <Timeline spots={spots} tripId={id} currentTrip={currentTrip} />
          }
        </div>
      </div>
    </div>
  );
}
