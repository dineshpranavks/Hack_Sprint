import { useNavigate, useLocation } from 'react-router-dom';
import { CHAT_HISTORY } from '../data/problems';

export default function Sidebar({ isOpen, onClose, onNewChat }) {
  const navigate = useNavigate();
  const location = useLocation();

  const grouped = {
    Today:     CHAT_HISTORY.filter(c => c.time.includes('h ago')),
    Yesterday: CHAT_HISTORY.filter(c => c.time === 'Yesterday'),
    Earlier:   CHAT_HISTORY.filter(c => c.time.includes('days ago')),
  };

  const handleChatClick = (query) => {
    navigate(`/results?q=${encodeURIComponent(query)}`);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-head">
        <span className="sidebar-head-label">Chat History</span>
        <button className="new-chat-btn" title="New Chat" onClick={onNewChat}>+</button>
      </div>
      <div className="sidebar-body">
        {Object.entries(grouped).map(([label, chats]) =>
          chats.length > 0 ? (
            <div key={label}>
              <div className="sidebar-section-title">{label}</div>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`sidebar-item ${location.search.includes(encodeURIComponent(chat.query)) ? 'active' : ''}`}
                  onClick={() => handleChatClick(chat.query)}
                >
                  <span className="sidebar-item-icon">💬</span>
                  <div className="sidebar-item-body">
                    <div className="sidebar-item-title">{chat.title}</div>
                    <div className="sidebar-item-time">{chat.time}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        )}
      </div>
    </aside>
  );
}
