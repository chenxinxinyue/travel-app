import { supabase } from '../lib/supabase';

export function useSpots() {
  const addSpot = async (tripId, spot, dayNumber) => {
    const { data, error } = await supabase.from('spots').insert({
      trip_id: tripId,
      day_number: dayNumber,
      name: spot.name,
      address: spot.address || '',
      lat: spot.location.lat,
      lng: spot.location.lng,
      poi_id: spot.id || null,
    }).select().single();

    if (error) throw error;
    return data;
  };

  const removeSpot = async (spotId) => {
    const { error } = await supabase.from('spots').delete().eq('id', spotId);
    if (error) throw error;
  };

  const loadSpots = async (tripId) => {
    const { data } = await supabase.from('spots').select('*').eq('trip_id', tripId).order('day_number');
    return data || [];
  };

  return { addSpot, removeSpot, loadSpots };
}
