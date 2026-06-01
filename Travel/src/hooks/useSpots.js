import { db } from '../lib/cloudbase';

export function useSpots() {
  const addSpot = async (tripId, spot, dayNumber) => {
    const { id, error } = await db.collection('spots').add({
      trip_id: tripId,
      day_number: dayNumber,
      name: spot.name,
      address: spot.address || '',
      lat: spot.location.lat,
      lng: spot.location.lng,
      poi_id: spot.id || null,
      created_at: new Date().toISOString(),
    });

    if (error) throw new Error(error);
    return { id, ...spot };
  };

  const removeSpot = async (spotId) => {
    const { error } = await db.collection('spots').doc(spotId).remove();
    if (error) throw new Error(error);
  };

  const loadSpots = async (tripId) => {
    const { data } = await db.collection('spots').where({ trip_id: tripId }).orderBy('day_number', 'asc').get();
    return data || [];
  };

  return { addSpot, removeSpot, loadSpots };
}
