import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded text-sm ${isActive ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`;

  return (
    <aside className="w-64 bg-white border-r h-full">
      <div className="p-4 text-lg font-semibold">GRC</div>
      <nav className="px-2 space-y-1">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/audits" className={linkClass}>Audits</NavLink>
        <NavLink to="/controls" className={linkClass}>Controls</NavLink>
        <NavLink to="/risks" className={linkClass}>Risks</NavLink>
        {/* New Findings entry */}
        <NavLink to="/findings" className={linkClass}>Findings</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;