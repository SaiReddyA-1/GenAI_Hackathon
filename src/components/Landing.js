import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun, FaArrowRight, FaCheck, FaRocket, FaChartLine, FaRobot, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
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
  const [activeService, setActiveService] = useState('big-data');

  const services = {
    'big-data': {
      title: 'At Vero Eos Et Accusamus Et Iusto Odi',
      description: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable.'
    },
    'machine-learning': {
      title: 'Machine Learning Excellence',
      description: 'Advanced algorithms and neural networks that learn and adapt from data patterns, providing intelligent solutions for complex problems.'
    },
    'analytical-ai': {
      title: 'Analytical AI Solutions',
      description: 'Cutting-edge artificial intelligence systems that analyze and interpret data, delivering actionable insights for your business.'
    },
    'computer-vision': {
      title: 'Et Harum Quidem Rerum Facilis',
      description: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable.'
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing">
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
          <Link to="/" className="logo">
            StartupLens
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/pages" className="nav-link">Pages</Link>
            <Link to="/forum" className="nav-link">Forum</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <button 
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <Link to="/signin" className="sign-in-btn">Sign In</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
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
          <div className="search-container">
            <input 
              type="text" 
              className="search-input"
              placeholder="Enter your startup idea here..."
            />
            <button className="search-button">Analyze Now</button>
          </div>
          
        </div>
      </section>

      {/* About Section */}
      <section className="about">
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
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
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
      <section className="services">
        <div className="services-content">
          <div className="section-label">OUR SERVICES</div>
          <h2>Explore Our Data Services</h2>
          
          <div className="services-tabs">
            <div 
              className={`service-tab ${activeService === 'big-data' ? 'active' : ''}`}
              onClick={() => setActiveService('big-data')}
            >
              <div className="service-icon big-data"></div>
              <span>Big Data</span>
            </div>
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

          <div className="service-content">
            <div className="service-info">
              <h3>{services[activeService].title}</h3>
              <p>{services[activeService].description}</p>
              <div className="service-features">
                <div className="feature">
                  <FaCheck className="check-icon" />
                  <span>Advance Advisory Team</span>
                </div>
                <div className="feature">
                  <FaCheck className="check-icon" />
                  <span>24/7 Support Help Center</span>
                </div>
                <div className="feature">
                  <FaCheck className="check-icon" />
                  <span>Professional Consulting Services</span>
                </div>
                <div className="feature">
                  <FaCheck className="check-icon" />
                  <span>Customer Service Operations</span>
                </div>
              </div>
              <button className="all-services-btn">ALL SERVICES</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose StartupLens</h2>
          <p>Make data-driven decisions with our comprehensive startup analysis tools</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <FaRocket className="feature-icon" />
            <h3>Smart Analysis</h3>
            <p>Dynamic question flow adapts to your startup idea for targeted insights</p>
          </div>
          <div className="feature-card">
            <FaChartLine className="feature-icon" />
            <h3>Market Intelligence</h3>
            <p>Real-time market trends, competitor analysis, and funding insights</p>
          </div>
          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>AI Assistant</h3>
            <p>Get personalized recommendations and answers to your questions</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonials-content">
          <div className="section-label">TESTIMONIALS</div>
          <h2>What Founders Say</h2>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="David Chen" className="client-image" />
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                StartupLens helped me validate my SaaS idea with real market data. The AI-driven insights saved me months of research and helped identify key opportunities.
              </p>
              <div className="client-info">
                <h4>David Chen</h4>
                <span>Tech Founder</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Sarah Williams" className="client-image" />
                <StarRating rating={5} />
              </div>
              <p className="testimonial-text">
                The interactive charts and competitor analysis gave me a clear picture of my market position. I now have a solid strategy backed by data.
              </p>
              <div className="client-info">
                <h4>Sarah Williams</h4>
                <span>Startup Founder</span>
              </div>
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
            <h4>Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
