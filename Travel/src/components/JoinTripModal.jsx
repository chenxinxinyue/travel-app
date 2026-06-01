import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';

export default function JoinTripModal({ open, onClose }) {
  const { joinTrip } = useTrip();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!inviteCode || !nickname) { setError('请填写所有字段'); return; }
    setSubmitting(true);
    try {
      const trip = await joinTrip(inviteCode, nickname);
      onClose();
      navigate(`/trip/${trip._id}`);
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
        <h2 className="text-xl font-bold">加入行程</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="你的昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 text-sm uppercase" placeholder="邀请码" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} maxLength={6} />
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '加入中...' : '加入行程'}
        </button>
      </form>
    </div>
  );
}
