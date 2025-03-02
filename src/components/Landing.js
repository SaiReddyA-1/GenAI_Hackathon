import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun, FaArrowRight, FaCheck, FaRocket, FaChartLine, FaRobot, FaSignOutAlt, FaLinkedin, FaGithub, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';
import StarRating from './StarRating';
import '../styles/Landing.css';
import heroIllustration from '../assets/hero-illustration.svg';
import aboutIllustration from '../assets/about-illustration.svg';
import dataIcon from '../assets/data-icon.svg';
import aiIcon from '../assets/ai-icon.svg';
import analyticsIcon from '../assets/analytics-icon.svg';
import serviceIcons from '../assets/service-icons.svg';

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    message: '',
    isError: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Refs for smooth scrolling
  const aboutRef = useRef(null);
  const howItWorksRef = useRef(null);
  const servicesRef = useRef(null);
  const testimonialsRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => (e) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add typing animation effect to search placeholder
  useEffect(() => {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    const placeholders = [
      'Enter your startup idea here...',
      'AI-powered food delivery app...',
      'Educational platform for coding...',
      'Health and fitness tracker...',
      'Sustainable fashion marketplace...'
    ];
    
    let currentPlaceholder = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    const typeEffect = () => {
      const currentText = placeholders[currentPlaceholder];
      
      if (isDeleting) {
        charIndex--;
        typingSpeed = 50;
      } else {
        charIndex++;
        typingSpeed = 100;
      }
      
      searchInput.placeholder = currentText.substring(0, charIndex);
      
      if (!isDeleting && charIndex === currentText.length) {
        // Pause at the end of typing
        isDeleting = true;
        typingSpeed = 1500;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        typingSpeed = 500;
      }
      
      setTimeout(typeEffect, typingSpeed);
    };
    
    // Start the typing effect
    setTimeout(typeEffect, 1500);
    
    // Clean up on component unmount
    return () => {
      // Clear all timeouts
      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = () => {
    if (!user) {
      // Store search query in session storage before redirecting
      sessionStorage.setItem('pendingSearch', searchQuery);
      navigate('/login');
    } else {
      // Navigate to dashboard with the search query
      navigate('/dashboard', { state: { startupIdea: searchQuery } });
    }
  };

  const handleSearchButtonHover = (e) => {
    const button = e.currentTarget;
    
    // Create ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('button-ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ isSubmitting: true, message: '', isError: false });

    try {
      // Add to Firebase
      const contactsRef = collection(db, 'contacts');
      await addDoc(contactsRef, {
        ...contactForm,
        timestamp: serverTimestamp()
      });

      // Show success message
      setSubmitStatus({
        isSubmitting: false,
        message: 'Thank you for your message! We will get back to you soon.',
        isError: false
      });

      // Reset form
      setContactForm({ name: '', email: '', message: '' });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        isSubmitting: false,
        message: 'Sorry, there was an error sending your message. Please try again.',
        isError: true
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = (ref) => (e) => {
    scrollToSection(ref)(e);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="landing">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
            StartupLens
          </Link>
          
          <div className="mobile-menu">
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <a href="#about" onClick={handleNavLinkClick(aboutRef)} className="nav-link">About</a>
            <a href="#how-it-works" onClick={handleNavLinkClick(howItWorksRef)} className="nav-link">How It Works</a>
            <a href="#services" onClick={handleNavLinkClick(servicesRef)} className="nav-link">Services</a>
            <a href="#testimonials" onClick={handleNavLinkClick(testimonialsRef)} className="nav-link">Testimonials</a>
            <a href="#contact" onClick={handleNavLinkClick(contactRef)} className="nav-link">Contact</a>
            {user ? (
              <button 
                className="sign-out-btn" 
                onClick={(e) => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/login" className="sign-in-btn" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero" id="main-content">
        <div className="hero-particles" id="particles-js"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Transform Your Startup Idea<br />
              Into Actionable Insights
            </h1>
            <p>
              Get comprehensive startup analysis powered by AI. Enter your idea and receive detailed market research, competitor analysis, and strategic recommendations in minutes.
            </p>
          </div>
          <div className="hero-visual">
            <img src={heroIllustration} alt="AI-powered startup analysis" className="hero-illustration" />
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
          </div>
        </div>
        <div className="wave-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      <section className="analyzer-section">
        <div className="analyzer-decoration decoration-1"></div>
        <div className="analyzer-decoration decoration-2"></div>
        <div className="analyzer-container">
          <div className="analyzer-content">
            <h2>Ready to Analyze Your Startup Idea?</h2>
            <p>Enter your startup concept below and our AI will generate comprehensive insights to help you evaluate market potential, identify competitors, and develop successful strategies.</p>
            <div className="search-container">
              <input 
                type="text" 
                className="search-input"
                placeholder="Enter your startup idea here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                aria-label="Startup idea input"
              />
              <button 
                className="search-button" 
                onClick={handleSearch} 
                onMouseDown={handleSearchButtonHover}
                aria-label="Analyze startup idea"
              >
                Analyze Now
              </button>
            </div>
            <div className="social-proof">
              Trusted by 500+ entrepreneurs and startup founders
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" ref={aboutRef} id="about">
        <div className="about-content">
          <div className="about-illustration">
            <img src={aboutIllustration} alt="Smart City Analytics" />
          </div>
          <div className="about-text">
            <div className="section-label">ABOUT US</div>
            <h2>AI-Powered Startup Analysis Platform</h2>
            <p>
              Our platform combines the power of GPT-4, market data, and industry insights to provide you with comprehensive startup analysis. Make informed decisions with real-time market intelligence and competitor insights.
            </p>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon nature"></div>
                <div className="stat-info">
                  <div className="stat-value">Real-time</div>
                  <div className="stat-label">Market Analysis</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon world"></div>
                <div className="stat-info">
                  <div className="stat-value">AI-Driven</div>
                  <div className="stat-label">Insights</div>
                </div>
              </div>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <FaCheck className="check-icon" />
                <span>Dynamic Question Flow</span>
              </div>
              <div className="feature-item">
                <FaCheck className="check-icon" />
                <span>Market & Competitor Analysis</span>
              </div>
              <div className="feature-item">
                <FaCheck className="check-icon" />
                <span>Interactive Data Visualization</span>
              </div>
              <div className="feature-item">
                <FaCheck className="check-icon" />
                <span>AI-Powered Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" ref={howItWorksRef} id="how-it-works">
        <div className="how-it-works-content">
          <div className="section-label">HOW DOES IT WORK</div>
          <h2>Your Journey to Startup Success</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <img src={dataIcon} alt="Input Icon" />
              </div>
              <h3>Share Your Idea</h3>
              <p>Start with your startup idea, and our AI will guide you through relevant follow-up questions.</p>
            </div>
            <div className="step-arrow">
              <FaArrowRight />
            </div>
            <div className="step">
              <div className="step-icon">
                <img src={aiIcon} alt="Analysis Icon" />
              </div>
              <h3>AI Analysis</h3>
              <p>Our AI processes your input using market data, trends, and competitor insights.</p>
            </div>
            <div className="step-arrow">
              <FaArrowRight />
            </div>
            <div className="step">
              <div className="step-icon">
                <img src={analyticsIcon} alt="Results Icon" />
              </div>
              <h3>Interactive Results</h3>
              <p>Get detailed analysis with interactive charts, insights, and actionable recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" ref={servicesRef} id="services">
        <div className="services-content">
          <div className="section-label">OUR SERVICES</div>
          <h2>Explore Our Data Services</h2>
          <div className="services-tabs">
            <div 
              className={`service-tab ${activeService === 'machine-learning' ? 'active' : ''}`}
              onClick={() => setActiveService('machine-learning')}
            >
              <div className="service-icon machine-learning"></div>
              <span>Machine Learning</span>
            </div>
            <div 
              className={`service-tab ${activeService === 'analytical-ai' ? 'active' : ''}`}
              onClick={() => setActiveService('analytical-ai')}
            >
              <div className="service-icon analytical-ai"></div>
              <span>Analytical AI</span>
            </div>
            <div 
              className={`service-tab ${activeService === 'computer-vision' ? 'active' : ''}`}
              onClick={() => setActiveService('computer-vision')}
            >
              <div className="service-icon computer-vision"></div>
              <span>Computer Vision</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" ref={testimonialsRef} id="testimonials">
        <div className="testimonials-content">
          <div className="section-label">TESTIMONIALS</div>
          <h2>What Founders Say</h2>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img 
                  src="https://lh3.googleusercontent.com/a/ACg8ocIotm0TQM_loC-vbRZTR5QjHwAqsSXAGzWtOYAMkzBcklLDNeb8Mg=s1008-c-no" 
                  alt="Suresh Timma" 
                  className="client-image" 
                />
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                StartupLens helped me validate my SaaS idea with real market data. The AI-driven insights saved me months of research and helped identify key opportunities.
              </p>
              <div className="client-info">
                <h4>Suresh Timma</h4>
                <span>Head Tech Team and Research</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <img 
                  src="https://res.cloudinary.com/dudjdf428/image/upload/v1730537985/WhatsApp_Image_2024-11-02_at_1.23.02_PM_nrk44s.jpg" 
                  alt="Hrushikesh Gangusetty" 
                  className="client-image" 
                />
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                The interactive charts and competitor analysis gave me a clear picture of my market position. I now have a solid strategy backed by data.
              </p>
              <div className="client-info">
                <h4>Hrushikesh Gangusetty</h4>
                <span>Outreach and Ideation</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <img 
                  src="https://res.cloudinary.com/dbcmqdoxa/image/upload/v1740277176/1732688467296_b8flmh.jpg" 
                  alt="Prasanth Velaga" 
                  className="client-image" 
                />
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                As a first-time founder, StartupLens was invaluable. The AI recommendations helped me pivot my business model and find the perfect market fit. Highly recommended!
              </p>
              <div className="client-info">
                <h4>Prasanth Velaga</h4>
                <span>Design and Ideation and Research</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" ref={contactRef} id="contact">
        <div className="contact-content">
          <div className="section-label">GET IN TOUCH</div>
          <h2>Contact Us</h2>
          
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-card">
                <div className="contact-icon">
                  <FaEnvelope />
                </div>
                <div className="contact-details">
                  <h3>Email Us</h3>
                  <p>info@startuplens.com</p>
                </div>
              </div>
              
              <div className="contact-card">
                <div className="contact-icon">
                  <FaLinkedin />
                </div>
                <div className="contact-details">
                  <h3>Connect on LinkedIn</h3>
                  <p>linkedin.com/company/startuplens</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your Name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Your Email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-input"
                    placeholder="Your Message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitStatus.isSubmitting}
                >
                  {submitStatus.isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {submitStatus.message && (
                  <div className={`submit-status ${submitStatus.isError ? 'error' : 'success'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>StartupLens</h4>
            <p>AI-powered startup analysis and validation platform</p>
            <div className="social-links">
              <a href="#linkedin" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="#github" aria-label="GitHub"><FaGithub /></a>
              <a href="mailto:contact@startuplens.com" aria-label="Email"><FaEnvelope /></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><a href="#about" onClick={scrollToSection(aboutRef)}>About</a></li>
              <li><a href="#how-it-works" onClick={scrollToSection(howItWorksRef)}>How It Works</a></li>
              <li><a href="#services" onClick={scrollToSection(servicesRef)}>Services</a></li>
              <li><a href="#testimonials" onClick={scrollToSection(testimonialsRef)}>Testimonials</a></li>
              <li><a href="#contact" onClick={scrollToSection(contactRef)}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li><a href="mailto:contact@startuplens.com">contact@startuplens.com</a></li>
              <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
              <li><a href="#help">Help Center</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
