import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const quotes = [
  "Success usually comes to those who are too busy to be looking for it.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "Opportunities don't happen, you create them.",
  "It is not the mountain we conquer, but ourselves."
];

const Dashboard = () => {
  const [quote, setQuote] = useState("");
  const [stats, setStats] = useState({ clients: 0, pendingTasks: 0 });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Select random quote on load
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Fetch Data
    const fetchData = async () => {
      try {
        const [clientsRes, tasksRes] = await Promise.all([
          axios.get('/api/clients'),
          axios.get('/api/tasks')
        ]);
        
        const pendingTasksCount = tasksRes.data.filter(t => t.status === 'pending').length;
        setStats({
          clients: clientsRes.data.length,
          pendingTasks: pendingTasksCount
        });

        const calendarEvents = tasksRes.data.map(task => ({
          title: task.title,
          start: new Date(task.date || new Date()),
          end: new Date(task.date || new Date()),
          allDay: true
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching data for dashboard", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Hello Priyank Rajpopat 👋</h1>
          <p className="page-subtitle" style={{ fontStyle: 'italic', color: 'var(--primary-purple)' }}>
            "{quote}"
          </p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-blue-light)' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Clients</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>{stats.clients}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-purple-light)' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Pending Tasks</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-purple)' }}>{stats.pendingTasks}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Upcoming Tasks & Filings</h3>
        <div style={{ height: '400px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', fontFamily: 'inherit' }}
            views={['month', 'agenda']}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
