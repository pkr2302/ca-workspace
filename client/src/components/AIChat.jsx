import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send } from 'lucide-react';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi Priyank! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages([...messages, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--primary-purple)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '6.5rem',
          right: '2rem',
          width: '350px',
          height: '500px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-purple))',
            padding: '1rem',
            color: 'white',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MessageSquare size={20} /> Antigravity AI
          </div>
          
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: 'var(--hover-color)'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.sender === 'user' ? 'var(--primary-blue)' : 'var(--bg-card)',
                color: m.sender === 'user' ? 'white' : 'var(--text-primary)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                maxWidth: '85%',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Antigravity is typing...
              </div>
            )}
          </div>
          
          <form onSubmit={sendMessage} style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-card)'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button type="submit" disabled={isLoading} style={{
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;
