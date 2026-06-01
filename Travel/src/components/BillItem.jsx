export default function BillItem({ bill, onDelete }) {
  const payer = bill.participants?.nickname || '未知';

  return (
    <div className="flex items-center px-4 py-3 gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{bill.item}</p>
        <p className="text-xs text-gray-400">{payer} 支付</p>
      </div>
      <p className="text-sm font-semibold text-orange-500 shrink-0">¥{bill.amount.toFixed(2)}</p>
      <button onClick={() => onDelete(bill.id)}
        className="text-xs text-gray-300 active:text-red-400 shrink-0">删除</button>
    </div>
  );
}
