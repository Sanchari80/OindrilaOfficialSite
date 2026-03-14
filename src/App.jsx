import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import ManageUpdates from './pages/Admin/ManageUpdates';
import CineplexLayout from './components/UI/CineplexLayout';
import FanAuth from './components/Fan/FanAuth';
import FanCommunity from './components/Fan/FanCommunity';
import FanNotifications from './components/Fan/FanNotifications';
import FanNavbar from './components/Fan/FanNavbar';
import FanEvent from './components/Fan/FanEvent';

/* ── Footer ── */
const Footer = () => (
  <footer style={{
    position: 'relative', zIndex: 10,
    borderTop: '1px solid rgba(201,168,76,0.12)',
    background: 'rgba(6,6,4,0.85)',
    backdropFilter: 'blur(10px)',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 18,
  }}>
    <img
      src="/SKT logo.jpg"
      alt="SKT"
      style={{
        width: 22, height: 22,
        objectFit: 'contain',
        borderRadius: 2,
        border: '1px solid rgba(201,168,76,0.3)',
        opacity: 0.75,
      }}
    />
    <span style={{
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: '0.65rem',
      letterSpacing: '0.3em',
      color: 'rgba(201,168,76,0.4)',
      textTransform: 'uppercase',
    }}>
      Oindrila Sen · SKT
    </span>
    <span style={{
      fontFamily: 'monospace',
      fontSize: '0.5rem',
      letterSpacing: '0.2em',
      color: 'rgba(201,168,76,0.2)',
    }}>
      © {new Date().getFullYear()}
    </span>
  </footer>
);

/* ── AppContent ── */
const AppContent = () => {
  const location = useLocation();

  return (
    <CineplexLayout>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#141410',
          color: '#f2ead8',
          border: '1px solid rgba(201,168,76,0.3)',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
        }
      }} />

      {/*
        key={location.pathname} এখানে দেওয়া হয়েছে।
        FanNavbar ভেতরে রাখা হয়েছে যাতে route বদলালে
        navbar সহ সব component fresh re-mount হয়।
        এতে /community তে community, /events এ events দেখাবে।
      */}
      <div key={location.pathname}>
        <FanNavbar />

        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/profile"             element={<ProfilePage />} />
          <Route path="/admin-oindrila-1234" element={<ManageUpdates />} />
          <Route path="/fan-zone"            element={<FanAuth />} />
          <Route path="/community"           element={<FanCommunity />} />
          <Route path="/notifications"       element={<FanNotifications />} />
          <Route path="/events"              element={<FanEvent />} />
        </Routes>

        <Footer />
      </div>
    </CineplexLayout>
  );
};

/* ── App ── */
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;