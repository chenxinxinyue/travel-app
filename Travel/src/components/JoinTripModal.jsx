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
        <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="邀请码（6位字母数字）" value={inviteCode} onChange={(e) => {
            const v = e.target.value;
            // Find any 6-character alphanumeric sequence
            const match = v.match(/[A-Za-z0-9]{6}/g);
            if (match) {
              // Take the last match (most likely the invite code, not random chars)
              setInviteCode(match[match.length - 1].toUpperCase());
            } else {
              setInviteCode(v.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase());
            }
          }} />
        <button type="submit" disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50">
          {submitting ? '加入中...' : '加入行程'}
        </button>
      </form>
    </div>
  );
}
