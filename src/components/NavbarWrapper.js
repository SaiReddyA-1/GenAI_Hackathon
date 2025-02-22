import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import '../styles/Landing.css';

const NavbarWrapper = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't apply special styling on landing page
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav 
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      style={!isLandingPage ? {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        left: 0,
      } : {}}
    >
      <div className="navbar-content" style={!isLandingPage ? {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      } : {}}>
        <Link to="/" className="logo" style={!isLandingPage ? {
          color: isDarkMode ? '#ffffff' : '#000000'
        } : {}}>
          StartupLens
        </Link>
        <div className="nav-links" style={!isLandingPage ? {
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        } : {}}>
          <Link to="/" className="nav-link" style={!isLandingPage ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Home</Link>
          <Link to="/pages" className="nav-link" style={!isLandingPage ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Pages</Link>
          <Link to="/forum" className="nav-link" style={!isLandingPage ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Forum</Link>
          <Link to="/blog" className="nav-link" style={!isLandingPage ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Blog</Link>
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={!isLandingPage ? {
              color: isDarkMode ? '#ffffff' : '#000000',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            } : {}}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          {user ? (
            <>
              <span className="user-name" style={!isLandingPage ? {
                color: isDarkMode ? '#ffffff' : '#000000'
              } : {}}>
                {user.email}
              </span>
              <button 
                className="sign-out-btn" 
                onClick={handleSignOut}
                style={!isLandingPage ? {
                  color: isDarkMode ? '#ffffff' : '#000000',
                  border: isDarkMode ? '1px solid #ffffff' : '1px solid #000000',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                } : {}}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="nav-link"
              style={!isLandingPage ? {
                color: isDarkMode ? '#ffffff' : '#000000'
              } : {}}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarWrapper;
