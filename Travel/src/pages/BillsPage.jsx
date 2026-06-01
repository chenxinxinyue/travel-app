import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import BillItem from '../components/BillItem';
import AddBillModal from '../components/AddBillModal';
import { useBills } from '../hooks/useBills';

export default function BillsPage() {
  const { id } = useParams();
  const { bills, loadTrip, currentTrip } = useTrip();
  const { deleteBill } = useBills();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { if (id) loadTrip(id); }, [id, loadTrip]);

  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  const handleDelete = async (billId) => {
    try {
      await deleteBill(billId);
      await loadTrip(id);
    } catch (err) {
      alert('删除失败: ' + (err.message || '请重试'));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white px-4 py-4 border-b flex justify-between items-center">
        <h1 className="font-bold text-lg">{currentTrip?.title || '账单'}</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
          +
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        {bills.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 text-sm">还没有记账</div>
        ) : (
          <div className="bg-white mt-2 divide-y">
            {bills.map((bill) => (
              <BillItem key={bill._id} bill={bill} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {bills.length > 0 && (
        <div className="bg-white border-t px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">总花销</span>
          <span className="text-lg font-bold text-orange-500">¥{total.toFixed(2)}</span>
        </div>
      )}

      <AddBillModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
