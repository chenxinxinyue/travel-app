import { db } from '../lib/cloudbase';

export function useBills() {
  const addBill = async (tripId, participantId, item, amount, payerNickname) => {
    const { id, error } = await db.collection('bills').add({
      trip_id: tripId,
      participant_id: participantId,
      item,
      amount: parseFloat(amount),
      payer_nickname: payerNickname,
      created_at: new Date().toISOString(),
    });

    if (error) throw new Error(error);
    return { id };
  };

  const deleteBill = async (billId) => {
    const { error } = await db.collection('bills').doc(billId).remove();
    if (error) throw new Error(error);
  };

  return { addBill, deleteBill };
}
