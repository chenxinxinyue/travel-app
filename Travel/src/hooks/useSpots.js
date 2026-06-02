import { db } from '../lib/cloudbase';

export function useSpots() {
  const addSpot = async (tripId, spot, dayNumber, addedByNickname, addedById) => {
    const { id, error } = await db.collection('spots').add({
      trip_id: tripId,
      day_number: dayNumber,
      name: spot.name,
      address: spot.address || '',
      lat: spot.location.lat,
      lng: spot.location.lng,
      poi_id: spot.id || null,
      added_by: addedByNickname || '',
      added_by_id: addedById || '',
      created_at: new Date().toISOString(),
    });

    if (error) throw new Error(error);
    return { id, ...spot };
  };

  const removeSpot = async (spotId) => {
    const { error } = await db.collection('spots').doc(spotId).remove();
    if (error) throw new Error(error);
  };

  return { addSpot, removeSpot };
}
