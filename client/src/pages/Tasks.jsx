import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', reminder: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', formData);
      setIsModalOpen(false);
      setFormData({ title: '', date: '', reminder: 0 });
      fetchTasks();
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await axios.put(`/api/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.date || new Date()),
    end: new Date(task.date || new Date()),
    allDay: true,
    resource: task
  }));

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Tasks & Reminders</h1>
          <p className="page-subtitle">Schedule filings and manage your daily tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Task / Reminder
        </button>
      </div>

      <div className="grid-cols-3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: '1rem' }}>Calendar</h3>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', fontFamily: 'inherit' }}
              eventPropGetter={(event) => {
                const backgroundColor = event.resource.status === 'completed' ? '#10b981' : 'var(--primary-blue)';
                return { style: { backgroundColor, border: 'none', borderRadius: '4px' } };
              }}
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Pending Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                <button onClick={() => toggleTaskStatus(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <Circle size={18} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>{task.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {task.date ? moment(task.date).format('MMM Do, YYYY') : 'No date'}
                  </p>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>All caught up!</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Task / Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Task Title / Filing Name</label>
                <input 
                  type="text" 
                  className="input" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., File GST Returns"
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  className="input" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
