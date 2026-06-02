import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';

export default function Layout() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <nav className="flex items-center border-t bg-white">
        <button onClick={() => navigate('/')}
          className="px-3 py-3 text-sm text-gray-400 active:text-gray-600 border-r">
          ← 首页
        </button>
        <NavLink to={`/trip/${id}`} end className={({ isActive }) =>
          `flex-1 text-center py-3 text-sm ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-400'}`
        }>地图</NavLink>
        <NavLink to={`/trip/${id}/bills`} className={({ isActive }) =>
          `flex-1 text-center py-3 text-sm ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-400'}`
        }>账单</NavLink>
      </nav>
    </div>
  );
}
