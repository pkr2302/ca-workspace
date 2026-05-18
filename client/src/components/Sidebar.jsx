import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, FolderOpen } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>CA Workspace</h1>
      </div>
      <nav className="nav-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/clients" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <Users size={20} />
          <span>Clients</span>
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <CalendarDays size={20} />
          <span>Tasks & Calendar</span>
        </NavLink>
        <NavLink 
          to="/files" 
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <FolderOpen size={20} />
          <span>File Explorer</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
