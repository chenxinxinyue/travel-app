import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copyInvite = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}${window.location.pathname}#/`;
    const text = `来一起规划旅行吧！\n链接：${link}\n邀请码：${trip.invite_code}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border p-4 mb-3 active:bg-gray-50"
      onClick={() => navigate(`/trip/${trip._id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{trip.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{trip.destination}</p>
          <p className="text-gray-300 text-xs mt-0.5">
            {trip.start_date} ~ {trip.end_date}
          </p>
        </div>
        {confirmDelete ? (
          <span className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { onDelete(trip._id); setConfirmDelete(false); }}
              className="text-xs bg-red-400 text-white rounded px-2 py-0.5">确认删除</button>
            <button onClick={() => setConfirmDelete(false)}
              className="text-xs bg-gray-200 rounded px-2 py-0.5">取消</button>
          </span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="text-gray-300 text-xs active:text-red-400">删除</button>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">
          邀请码: <span className="font-mono text-blue-400">{trip.invite_code}</span>
        </span>
        <button onClick={copyInvite}
          className="text-xs bg-gray-100 rounded px-2 py-0.5 active:bg-gray-200">
          {copied ? '已复制' : '复制链接+邀请码'}
        </button>
      </div>
    </div>
  );
}
