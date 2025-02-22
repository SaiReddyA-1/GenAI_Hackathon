import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import xaminLogo from '../assets/xamin-logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={xaminLogo} alt="Xamin Logo" />
        </Link>

        <button 
          className={`navbar-toggle ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-item">Home</Link>
          <Link to="/about" className="nav-item">About Us</Link>
          <Link to="/services" className="nav-item">Services</Link>
          <Link to="/portfolio" className="nav-item">Portfolio</Link>
          <Link to="/blog" className="nav-item">Blog</Link>
          <Link to="/pages" className="nav-item">Pages</Link>
          <Link to="/shop" className="nav-item">Shop</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
