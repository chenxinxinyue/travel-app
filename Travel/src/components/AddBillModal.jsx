import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';
import { useBills } from '../hooks/useBills';

export default function AddBillModal({ open, onClose }) {
  const { currentTrip, participants, loadTrip, getMyParticipant } = useTrip();
  const { addBill } = useBills();
  const tripId = currentTrip?._id;
  const myInfo = getMyParticipant(tripId);

  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(myInfo?.participantId || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || !amount || !payerId) { setError('请填写所有字段'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payer = participants.find((p) => p._id === payerId);
      await addBill(currentTrip._id, payerId, item, amount, payer?.nickname || '未知');
      await loadTrip(currentTrip._id);
      setItem(''); setAmount(''); onClose();
    } catch (err) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold">添加开销</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="花在什么地方" value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="金额" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" />
        <select className="w-full border rounded-lg px-3 py-2 text-sm" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
          <option value="">谁付的</option>
          {participants.map((p) => (
            <option key={p._id} value={p._id}>{p.nickname}</option>
          ))}
        </select>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '添加中...' : '添加'}
        </button>
      </form>
    </div>
  );
}
