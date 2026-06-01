import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { db, auth } from '../lib/cloudbase';

const TripContext = createContext(null);

const COLORS = ['#4C8BF5', '#F5A623', '#7ED321', '#E94F4F', '#9B59B6', '#1ABC9C'];

function getStoredIdentity() {
  try {
    return JSON.parse(localStorage.getItem('travel_identity') || 'null');
  } catch { return null; }
}

function storeIdentity(tripId, participantId, nickname) {
  const identity = getStoredIdentity() || {};
  identity[tripId] = { participantId, nickname };
  localStorage.setItem('travel_identity', JSON.stringify(identity));
}

let authReady = false;

async function ensureAuth() {
  if (authReady) return;
  const loginState = await auth.getLoginState();
  if (!loginState) {
    await auth.anonymousAuthProvider().signIn();
  }
  authReady = true;
}

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [spots, setSpots] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      await ensureAuth();
      const { data } = await db.collection('trips').orderBy('created_at', 'desc').get();
      if (data) setTrips(data);
    } catch (e) {
      console.error('loadTrips error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const loadTrip = useCallback(async (tripId) => {
    if (!tripId) return;
    setLoading(true);
    try {
      await ensureAuth();
      const [tripRes, partRes, spotRes, billRes] = await Promise.all([
        db.collection('trips').doc(tripId).get(),
        db.collection('participants').where({ trip_id: tripId }).get(),
        db.collection('spots').where({ trip_id: tripId }).orderBy('day_number', 'asc').get(),
        db.collection('bills').where({ trip_id: tripId }).orderBy('created_at', 'desc').get(),
      ]);
      if (tripRes.data && tripRes.data.length > 0) setCurrentTrip(tripRes.data[0]);
      if (partRes.data) setParticipants(partRes.data);
      if (spotRes.data) setSpots(spotRes.data);
      if (billRes.data) setBills(billRes.data);
    } catch (e) {
      console.error('loadTrip error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = async ({ title, destination, startDate, endDate, nickname }) => {
    await ensureAuth();
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { id: tripId } = await db.collection('trips').add({
      title, destination,
      start_date: startDate, end_date: endDate,
      invite_code: inviteCode,
      created_at: new Date().toISOString(),
    });

    if (!tripId) throw new Error('创建行程失败');

    const color = COLORS[0];
    const { id: participantId } = await db.collection('participants').add({
      trip_id: tripId, nickname, color,
    });

    if (participantId) {
      storeIdentity(tripId, participantId, nickname);
    }

    await loadTrips();
    return { id: tripId, title, destination, start_date: startDate, end_date: endDate, invite_code: inviteCode };
  };

  const joinTrip = async (inviteCode, nickname) => {
    await ensureAuth();
    const { data } = await db.collection('trips').where({ invite_code: inviteCode.toUpperCase() }).get();
    if (!data || data.length === 0) throw new Error('邀请码无效');
    const trip = data[0];

    const identity = getStoredIdentity();
    if (identity && identity[trip._id]) throw new Error('你已经在这个行程中了');

    const color = COLORS[(trip._id.length + nickname.length) % COLORS.length];
    const { id: participantId } = await db.collection('participants').add({
      trip_id: trip._id, nickname, color,
    });

    if (participantId) {
      storeIdentity(trip._id, participantId, nickname);
    }

    await loadTrips();
    return trip;
  };

  const getMyParticipant = (tripId) => {
    const identity = getStoredIdentity();
    return identity?.[tripId] || null;
  };

  const deleteTrip = async (tripId) => {
    await ensureAuth();
    // Delete related data
    const collections = ['participants', 'spots', 'locations', 'bills'];
    for (const col of collections) {
      const { data } = await db.collection(col).where({ trip_id: tripId }).get();
      if (data) {
        for (const doc of data) {
          await db.collection(col).doc(doc._id).remove();
        }
      }
    }
    await db.collection('trips').doc(tripId).remove();
    await loadTrips();
  };

  const value = {
    trips, currentTrip, participants, spots, bills, loading,
    loadTrips, loadTrip, createTrip, joinTrip, deleteTrip, getMyParticipant,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
}
