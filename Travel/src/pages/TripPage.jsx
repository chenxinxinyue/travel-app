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
  const [mapReady, setMapReady] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [panelState, setPanelState] = useState('peek');
  const pendingSpotRef = useRef(null);

  useEffect(() => { loadTrip(id); }, [id, loadTrip]);

  // Auto-locate
  useEffect(() => {
    if (mapReady && currentTrip?.destination) {
      mapRef.current?.locateCity(currentTrip.destination);
    }
  }, [mapReady, currentTrip?.destination]);

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

  // Set up "想去" global callback
  useEffect(() => {
    window.__travelWantToGo = () => {
      if (window.__travelPendingSpot) {
        pendingSpotRef.current = window.__travelPendingSpot;
        setSearchResults(prev => [...prev]);
      }
    };
    return () => { delete window.__travelWantToGo; };
  }, []);

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
              const locData = { trip_id: id, participant_id: myInfo.participantId, lat: result.position.lat, lng: result.position.lng, updated_at: new Date().toISOString() };
              if (existing && existing.length > 0) {
                await db.collection('locations').doc(existing[0]._id).update(locData);
              } else {
                await db.collection('locations').add(locData);
              }
              await loadTrip(id);
              // Fit to show all spots + locations
              const { data: locData } = await db.collection('locations').where({ trip_id: id }).get();
              const allPos = spots.map(s => ({ lng: s.lng, lat: s.lat }));
              if (locData) locData.forEach(l => allPos.push({ lng: l.lng, lat: l.lat }));
              if (allPos.length > 0) mapRef.current.fitView(allPos);
            }
          }
          setSharingLocation(false);
        });
      });
    } catch { clearTimeout(timeout); setSharingLocation(false); }
  };

  const myInfo = getMyParticipant(id);

  return (
    <div className="h-full flex flex-col">
      <SpotSearch onResults={(results) => {
        setSearchResults(results);
        if (results.length > 0 && mapRef.current) {
          mapRef.current.showSearchMarkers(results);
        }
      }} city={currentTrip?.destination} mapRef={mapRef} mapReady={mapReady} />
      <div className="px-3 py-1.5 bg-blue-50 border-b flex items-center justify-between">
        <button onClick={shareLocation} disabled={sharingLocation}
          className="text-xs bg-blue-500 text-white rounded-full px-3 py-0.5 disabled:opacity-50">
          {sharingLocation ? '定位中...' : '📍 共享'}
        </button>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {participants.map((p) => (
            <span key={p._id} className="text-xs whitespace-nowrap flex items-center gap-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: p.color}} />
              {p.nickname}{p._id === myInfo?.participantId ? '(我)' : ''}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <MapView spots={spots} participants={participants} locations={locations}
          onMapReady={(api) => { mapRef.current = api; setMapReady(true); }}
          onMapClick={async (pos) => {
            if (!mapRef.current) return;
            const results = await mapRef.current.searchAround(pos.lng, pos.lat);
            setSearchResults(results);
            setTab('list');
            setPanelState('open');
            if (results.length > 0) mapRef.current.showSearchMarkers(results);
          }}
        />
      </div>

      {/* Bottom panel */}
      {panelState !== 'hidden' && (
        <div className="flex flex-col border-t bg-white" style={{ maxHeight: panelState === 'peek' ? '42px' : '45%' }}>
          <div className="flex items-stretch shrink-0" style={{ height: '44px' }}>
            <button onClick={() => setPanelState(panelState === 'open' ? 'peek' : 'open')}
              className="text-gray-400 text-xs px-3 flex items-center shrink-0 border-r">
              {panelState === 'open' ? '▼' : '▲'}
            </button>
            <button onClick={() => {
              if (panelState === 'peek') { setPanelState('open'); setTab('list'); }
              else if (tab === 'list') setPanelState('peek');
              else setTab('list');
            }} className={`flex-1 flex items-center justify-center text-sm ${tab === 'list' ? 'text-blue-500 font-semibold border-b-2 border-blue-500' : 'text-gray-400'}`}>景点列表</button>
            <button onClick={() => {
              if (panelState === 'peek') { setPanelState('open'); setTab('timeline'); }
              else if (tab === 'timeline') setPanelState('peek');
              else setTab('timeline');
            }} className={`flex-1 flex items-center justify-center text-sm ${tab === 'timeline' ? 'text-blue-500 font-semibold border-b-2 border-blue-500' : 'text-gray-400'}`}>时间线</button>
          </div>
          {panelState === 'open' && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {tab === 'list'
                ? <SpotList results={searchResults} tripId={id} spots={spots} currentTrip={currentTrip} onAdd={() => setTab('timeline')} myInfo={myInfo}
                    pendingSpot={pendingSpotRef.current}
                    onFocus={(poi) => {
                      if (mapRef.current) {
                        mapRef.current.map.setZoomAndCenter(16, [poi.location.lng, poi.location.lat]);
                      }
                    }} />
                : <Timeline spots={spots} tripId={id} currentTrip={currentTrip} myParticipantId={myInfo?.participantId}
                    onFocus={(pos) => {
                      if (!mapRef.current) return;
                      mapRef.current.map.stopMove();
                      mapRef.current.map.setZoomAndCenter(16, [pos.lng, pos.lat]);
                    }} />
              }
            </div>
          )}
        </div>
      )}
      {panelState === 'hidden' && (
        <div className="flex items-center shrink-0 border-t bg-white px-2" style={{ height: '44px' }}>
          <button onClick={() => setPanelState('open')} className="text-gray-400 text-xs px-2">▲ 展开列表</button>
        </div>
      )}
    </div>
  );
}
