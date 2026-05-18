import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const Settings = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark') {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSignOut = async () => {
    // We need to import supabase at the top
    const { supabase } = await import('../supabaseClient');
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your dashboard preferences</p>
      
      <div className="card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Appearance</h3>
        
        <div className="flex-between" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Theme Mode</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Switch between Light and Dark mode</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{ minWidth: '140px' }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#ef4444' }}>Danger Zone</h3>
        <div className="flex-between" style={{ padding: '1rem', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <div>
            <h4 style={{ color: '#ef4444', marginBottom: '0.25rem' }}>Sign Out</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Log out of your account on this device</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="btn btn-primary"
            style={{ backgroundColor: '#ef4444' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
