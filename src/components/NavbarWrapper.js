import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes, FaHome, FaChartLine, FaRocket, FaClipboardList, FaHistory } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import '../styles/Landing.css';

const NavbarWrapper = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the current page
  const isLandingPage = location.pathname === '/';
  const isDashboardPage = location.pathname.includes('/dashboard');
  const isMarketChartsPage = location.pathname.includes('/market-charts');
  const isLoginPage = location.pathname.includes('/login');

  // Determine if we should show the navbar (hide only on landing page)
  const shouldShowNavbar = !isLandingPage;

  // Function to handle showing the history in the dashboard
  const handleHistoryClick = () => {
    // If already on dashboard, just trigger the history function
    if (isDashboardPage) {
      // Store a flag in localStorage that the dashboard should show history on load
      localStorage.setItem('showHistoryOnLoad', 'true');
      // If we're already on the dashboard, refresh to trigger the history display
      window.location.reload();
    } else {
      // If not on dashboard, navigate there with a flag to show history
      localStorage.setItem('showHistoryOnLoad', 'true');
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!shouldShowNavbar) {
    return null; // Don't render anything on landing page
  }

  return (
    <nav 
      className="global-navbar"
      style={{
        backgroundColor: '#1a202c',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '15px 0',
        height: 'auto',
        minHeight: '60px',
        marginBottom: '30px' // Increased margin bottom
      }}
    >
      <div className="navbar-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '50px'
      }}>
        <Link to="/dashboard" className="logo" style={{
          color: '#ffffff',
          fontSize: '26px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaRocket size={24} /> StartupLens
        </Link>
        
        <div className="mobile-menu">
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            style={{ 
              color: 'white',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} style={{
          display: isMobileMenuOpen ? 'flex' : 'flex',
          flexDirection: isMobileMenuOpen ? 'column' : 'row',
          alignItems: 'center',
          gap: '20px',
          '@media (max-width: 768px)': {
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            backgroundColor: '#1a202c',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: isMobileMenuOpen ? 'flex' : 'none',
          }
        }}>
          {/* Home link - Always visible */}
          <Link to="/" className="nav-link" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaHome size={18} /> Home
          </Link>

          {/* Dashboard link - Always visible */}
          <Link to="/dashboard" className="nav-link" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: isDashboardPage ? 'bold' : 'normal' // Bold if current page
          }}>
            <FaClipboardList size={18} /> Dashboard
          </Link>

          {/* Market Charts link - Only show from Dashboard or after generating a report */}
          {(!isLoginPage) && (
            <Link to="/market-charts" className="nav-link" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: isMarketChartsPage ? 'bold' : 'normal' // Bold if current page
            }}>
              <FaChartLine size={18} /> Market Charts
            </Link>
          )}

          {/* History button - Always visible for dashboard interaction */}
          <button 
            onClick={handleHistoryClick}
            className="nav-link"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FaHistory size={18} /> History
          </button>

          {user && (
            <button onClick={handleSignOut} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '16px'
            }}>
              <FaSignOutAlt size={16} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarWrapper;
