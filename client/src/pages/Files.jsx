import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FileText, Image as ImageIcon, UploadCloud, File as FileIcon } from 'lucide-react';

const Files = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileType, setFileType] = useState('Working File');

  useEffect(() => {
    // Fetch clients to populate the dropdown
    const fetchClients = async () => {
      try {
        const res = await axios.get('/api/clients');
        setClients(res.data);
        if (res.data.length > 0) {
          setSelectedClientId(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchFiles(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchFiles = async (clientId) => {
    try {
      const res = await axios.get(`/api/files/${clientId}`);
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedClientId) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('client_id', selectedClientId);
    formData.append('type', fileType);

    try {
      await axios.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      fetchFiles(selectedClientId);
      // reset file input
      document.getElementById('file-upload').value = '';
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.pdf')) return <FileText size={40} color="#ef4444" />;
    if (filename.match(/\.(jpeg|jpg|png|gif)$/)) return <ImageIcon size={40} color="#3b82f6" />;
    return <FileIcon size={40} color="#64748b" />;
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Client File Explorer</h1>
          <p className="page-subtitle">Manage PAN cards, Aadhar cards, returns, and workings.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar / Client Selection */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Select Client</h3>
            <select 
              className="select" 
              value={selectedClientId} 
              onChange={e => setSelectedClientId(e.target.value)}
              style={{ width: '100%', marginBottom: '1.5rem' }}
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
              {clients.length === 0 && <option value="">No clients found</option>}
            </select>

            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Upload Document</h3>
            <form onSubmit={handleUpload}>
              <select className="select" value={fileType} onChange={e => setFileType(e.target.value)} style={{ marginBottom: '0.5rem' }}>
                <option value="PAN Card">PAN Card</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="Bank Statement">Bank Statement</option>
                <option value="Tax Return">Tax Return</option>
                <option value="Working File">Working File</option>
              </select>
              <input 
                type="file" 
                id="file-upload"
                onChange={e => setUploadFile(e.target.files[0])}
                style={{ marginBottom: '1rem', fontSize: '0.75rem', width: '100%' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!uploadFile || !selectedClientId}>
                <UploadCloud size={16} /> Upload File
              </button>
            </form>
          </div>
        </div>

        {/* File Grid */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ minHeight: '500px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Folder size={20} color="var(--primary-blue)" fill="var(--primary-blue)" opacity="0.2" />
              {clients.find(c => c.id == selectedClientId)?.name || 'Client'} Documents
            </h3>

            {files.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                <Folder size={48} opacity="0.2" style={{ marginBottom: '1rem' }} />
                <p>This folder is empty.</p>
              </div>
            ) : (
              <div className="grid-cols-4">
                {files.map(file => (
                  <a 
                    key={file.id} 
                    href={file.filepath}
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      padding: '1.5rem 1rem', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--primary-blue-light)', backgroundColor: 'var(--hover-color)' })}
                    onMouseOut={e => Object.assign(e.currentTarget.style, { borderColor: 'var(--border-color)', backgroundColor: 'transparent' })}
                  >
                    {getFileIcon(file.filename)}
                    <span style={{ 
                      fontSize: '0.75rem', 
                      marginTop: '1rem', 
                      backgroundColor: 'rgba(109, 40, 217, 0.1)', 
                      color: 'var(--primary-purple)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px',
                      fontWeight: '500'
                    }}>
                      {file.type}
                    </span>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500', textAlign: 'center', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {file.filename}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Files;
