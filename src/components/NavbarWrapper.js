import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import useAuth from '../hooks/useAuth';
import '../styles/Landing.css';

const NavbarWrapper = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className={`navbar ${isScrolled ? 'scrolled' : ''}`}
      style={{
        ...((!location.pathname === '/' || isScrolled) && {
          backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
          left: 0,
        })
      }}
    >
      <div className="navbar-content" style={!location.pathname === '/' ? {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      } : {}}>
        <Link to="/" className="logo" style={!location.pathname === '/' ? {
          color: isDarkMode ? '#ffffff' : '#000000'
        } : {}}>StartupLens</Link>
        
        <div className="mobile-menu">
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            style={{ color: 'white' }}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} style={!location.pathname === '/' ? {
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        } : {}}>
          <Link to="/" className="nav-link" style={!location.pathname === '/' ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Home</Link>
          <Link to="/pages" className="nav-link" style={!location.pathname === '/' ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Pages</Link>
          <Link to="/forum" className="nav-link" style={!location.pathname === '/' ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Forum</Link>
          <Link to="/blog" className="nav-link" style={!location.pathname === '/' ? {
            color: isDarkMode ? '#ffffff' : '#000000'
          } : {}}>Blog</Link>
          {user && (
            <button 
              className="sign-out-btn"
              onClick={handleSignOut}
              style={!location.pathname === '/' ? {
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarWrapper;
