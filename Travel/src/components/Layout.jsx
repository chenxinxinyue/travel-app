import { Outlet, NavLink, useParams } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `flex-1 text-center py-3 text-sm ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-400'}`;

export default function Layout() {
  const { id } = useParams();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <nav className="flex border-t bg-white">
        <NavLink to={`/trip/${id}`} end className={linkClass}>地图</NavLink>
        <NavLink to={`/trip/${id}/bills`} className={linkClass}>账单</NavLink>
      </nav>
    </div>
  );
}
