import { supabase } from '../lib/supabase';

export function useBills() {
  const addBill = async (tripId, participantId, item, amount) => {
    const { data, error } = await supabase.from('bills').insert({
      trip_id: tripId,
      participant_id: participantId,
      item,
      amount: parseFloat(amount),
    }).select().single();

    if (error) throw error;
    return data;
  };

  const deleteBill = async (billId) => {
    const { error } = await supabase.from('bills').delete().eq('id', billId);
    if (error) throw error;
  };

  return { addBill, deleteBill };
}
