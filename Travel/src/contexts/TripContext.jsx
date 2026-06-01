import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [spots, setSpots] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载所有行程
  const loadTrips = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (data) setTrips(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  // 加载单次行程的全部数据
  const loadTrip = useCallback(async (tripId) => {
    setLoading(true);
    const [tripRes, partRes, spotRes, billRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).single(),
      supabase.from('participants').select('*').eq('trip_id', tripId),
      supabase.from('spots').select('*').eq('trip_id', tripId).order('day_number'),
      supabase.from('bills').select('*, participants(nickname)').eq('trip_id', tripId).order('created_at', { ascending: false }),
    ]);
    if (tripRes.data) setCurrentTrip(tripRes.data);
    if (partRes.data) setParticipants(partRes.data);
    if (spotRes.data) setSpots(spotRes.data);
    if (billRes.data) setBills(billRes.data);
    setLoading(false);
  }, []);

  // 创建行程
  const createTrip = async ({ title, destination, startDate, endDate, nickname }) => {
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data: trip } = await supabase.from('trips').insert({
      title, destination,
      start_date: startDate, end_date: endDate,
      invite_code: inviteCode,
    }).select().single();

    if (!trip) throw new Error('创建行程失败');

    const color = COLORS[0];
    const { data: participant } = await supabase.from('participants').insert({
      trip_id: trip.id, nickname, color,
    }).select().single();

    if (participant) {
      storeIdentity(trip.id, participant.id, nickname);
    }

    await loadTrips();
    return trip;
  };

  // 加入行程
  const joinTrip = async (inviteCode, nickname) => {
    const { data: trip } = await supabase.from('trips').select('*').eq('invite_code', inviteCode.toUpperCase()).single();
    if (!trip) throw new Error('邀请码无效');

    const identity = getStoredIdentity();
    if (identity && identity[trip.id]) throw new Error('你已经在这个行程中了');

    const color = COLORS[(trip.id.length + nickname.length) % COLORS.length];
    const { data: participant } = await supabase.from('participants').insert({
      trip_id: trip.id, nickname, color,
    }).select().single();

    if (participant) {
      storeIdentity(trip.id, participant.id, nickname);
    }

    await loadTrips();
    return trip;
  };

  // 获取当前用户在该行程中的 participant 信息
  const getMyParticipant = (tripId) => {
    const identity = getStoredIdentity();
    return identity?.[tripId] || null;
  };

  // 删除行程
  const deleteTrip = async (tripId) => {
    await supabase.from('trips').delete().eq('id', tripId);
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
