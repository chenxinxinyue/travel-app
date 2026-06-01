import { useState } from 'react';
import { useTrip } from '../contexts/TripContext';

export default function CreateTripModal({ open, onClose }) {
  const { createTrip } = useTrip();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !destination || !startDate || !endDate || !nickname) {
      setError('请填写所有字段'); return;
    }
    setSubmitting(true);
    try {
      await createTrip({ title, destination, startDate, endDate, nickname });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <form
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold">创建行程</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="我的昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="行程标题，如「火锅特种兵」" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="目的地，如「成都」" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <div className="flex gap-3">
          <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '创建中...' : '创建行程'}
        </button>
      </form>
    </div>
  );
}
