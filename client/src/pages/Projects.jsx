import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, cliRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/clients')
      ]);
      setProjects(projRes.data);
      setClients(cliRes.data);
    } catch (err) {
      alert("Error fetching data: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/projects', newProject);
      setProjects([res.data, ...projects]);
      setShowForm(false);
      setNewProject({ title: '', description: '', client_id: '', status: 'active' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (project) => {
    const newStatus = project.status === 'active' ? 'completed' : 'active';
    try {
      const res = await axios.put(`/api/projects/${project.id}`, { ...project, status: newStatus });
      setProjects(projects.map(p => p.id === project.id ? res.data : p));
    } catch (err) {
      console.error(err);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unassigned';
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage client engagements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Create New Project</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-cols-2">
              <div className="input-group">
                <label>Project Title</label>
                <input 
                  required
                  className="input" 
                  value={newProject.title} 
                  onChange={e => setNewProject({...newProject, title: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Assign to Client (Optional)</label>
                <select 
                  className="select" 
                  value={newProject.client_id} 
                  onChange={e => setNewProject({...newProject, client_id: e.target.value})}
                >
                  <option value="">None</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Description</label>
              <input 
                className="input" 
                value={newProject.description} 
                onChange={e => setNewProject({...newProject, description: e.target.value})} 
              />
            </div>
            <div className="flex-between" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Project</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        {projects.map(project => (
          <div key={project.id} className="card flex-between" style={{ padding: '1rem 1.5rem', borderLeft: project.status === 'completed' ? '4px solid #10b981' : '4px solid var(--primary-blue-light)' }}>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{project.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Client: {getClientName(project.client_id)} • {project.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => toggleStatus(project)}
                className="btn btn-outline"
                style={{ color: project.status === 'completed' ? '#10b981' : 'var(--primary-blue-light)', borderColor: project.status === 'completed' ? '#10b981' : 'var(--primary-blue-light)' }}
              >
                {project.status === 'completed' ? <CheckCircle size={16} /> : <Clock size={16} />}
                {project.status === 'completed' ? 'Completed' : 'Active'}
              </button>
              <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleDelete(project.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && !showForm && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No projects found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
};

export default Projects;
