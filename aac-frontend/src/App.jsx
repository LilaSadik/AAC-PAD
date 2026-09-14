import PictureMode from './PictureMode';
import DialogueMode from './DialogueMode';
import TranscriberMode from './TranscriberMode';
import Settings from './Settings';
import { SettingsProvider } from './SettingsContext'; 
// Notice BrowserRouter is removed from this import!
import { Routes, Route, NavLink } from 'react-router-dom';

function App() {
  return (
    <SettingsProvider>
      {/* We removed <BrowserRouter> from here so it doesn't double-up with main.jsx */}
      
      {/* Main Device Container */}
      <div className="app-container" dir="rtl">
        
        {/* The Blue Topbar */}
        <div className="topbar">
          <i className="ti ti-message-2" style={{ color: '#fff', fontSize: '18px' }} aria-hidden="true"></i>
          <span className="topbar-title">وصلة</span>
        </div>

        {/* The Scrollable Content Area */}
        <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<PictureMode />} />
            <Route path="/dialogue" element={<DialogueMode />} />
            <Route path="/transcriber" element={<TranscriberMode />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Bottom Nav using NavLink */}
        <nav className="bottom-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} 
            style={{ textDecoration: 'none' }}
          >
            <i className="ti ti-layout-grid" aria-hidden="true"></i>
            <span>الصور</span>
          </NavLink>
          
          <NavLink 
            to="/dialogue" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} 
            style={{ textDecoration: 'none' }}
          >
            <i className="ti ti-message-dots" aria-hidden="true"></i>
            <span>الحوار</span>
          </NavLink>
          
          <NavLink 
            to="/transcriber" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} 
            style={{ textDecoration: 'none' }}
          >
            <i className="ti ti-microphone" aria-hidden="true"></i>
            <span>النسخ</span>
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} 
            style={{ textDecoration: 'none' }}
          >
            <i className="ti ti-settings" aria-hidden="true"></i>
            <span>الإعدادات</span>
          </NavLink>
        </nav>
        
      </div>
    </SettingsProvider>
  );
}

export default App;
