import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  ChefHat,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Shield,
  Clock,
  AlertCircle,
  Database
} from 'lucide-react';
import './ZenRestroLanding.css';

const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

const ZenRestroLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featureCards = [
    {
      title: 'Billing POS',
      description: 'Bill customers in seconds. Supports GST, discounts, and multiple payment modes (UPI, Cash, Card).',
      icon: <ShoppingBag className="w-7 h-7" />
    },
    {
      title: 'Order Management',
      description: 'Digital KOTs. Track every table status on one screen. No more paper slips lost in the wind.',
      icon: <Clock className="w-7 h-7" />
    },
    {
      title: 'Kitchen Display (KDS)',
      description: 'Kitchen staff sees orders instantly. Reduce noise, reduce confusion, serve food faster.',
      icon: <ChefHat className="w-7 h-7" />
    },
    {
      title: 'Smart Inventory',
      description: 'Know your stock before it runs out. Get automated alerts when specific ingredients are low.',
      icon: <Database className="w-7 h-7" />
    },
    {
      title: 'Real-time Reports',
      description: 'Get daily sales summaries directly on your WhatsApp. No need to open the laptop.',
      icon: <TrendingUp className="w-7 h-7" />
    },
    {
      title: 'Lightning Performance',
      description: 'Sub-second processing. Works from anywhere, even on mobile or tablets.',
      icon: <Zap className="w-7 h-7" />
    }
  ];

  const problems = [
    {
      title: 'Billing delays during rush hour?',
      solution: 'Generate bills in just 2 clicks with our optimized interface.',
      icon: <AlertCircle className="w-6 h-6 text-accent" />
    },
    {
      title: 'Orders getting lost between staff?',
      solution: 'Instant sync from table to kitchen via digital display.',
      icon: <AlertCircle className="w-6 h-6 text-accent" />
    },
    {
      title: 'End-of-day math taking hours?',
      solution: 'Automated daily reports delivered straight to your WhatsApp.',
      icon: <AlertCircle className="w-6 h-6 text-accent" />
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Owner, The Golden Bistro',
      text: 'ZenRestro transformed our operations. WhatsApp reports alone save me 2 hours every night. The billing is actually fast enough for our weekend rush.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Manager, Sakura Sushi',
      text: 'The KDS system is a lifesaver. No more lost tickets or miscommunication. Our kitchen efficiency improved by 50% in the first week.',
      rating: 5
    }
  ];

  return (
    <div className="zen-landing">
      {/* WhatsApp Button */}
      <a href="https://wa.me/919999999999" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Contact">
        <MessageSquare className="w-6 h-6" />
      </a>

      {/* Nav */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">ZR</span>
              <span className="logo-text">ZenRestro</span>
            </div>

            <div className="nav-links desktop-only">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/login" className="btn-primary">Get Started</Link>
            </div>

            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <Link to="/login" className="btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            <Link to="/login" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-particles">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </div>
          <div className="hero-glow"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>Simple • Fast • Reliable</span>
            </div>

            <h1>
              Stop Billing Mistakes. <span className="text-gradient">Start Serving Faster.</span>
            </h1>

            <p>
              ZenRestro is the easy POS software built for busy Indian restaurants. 
              Manage everything from billing to inventory in one place—no technical skills needed.
            </p>

            <div className="hero-btns">
              <Link to="/login" className="btn-primary-large">
                Start 14-Day Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn-outline-large">
                Book a Live Demo
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Restaurants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Bills Generated</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solver Section */}
      <section className="problem-section" style={{ background: '#1E293B' }}>
        <div className="container">
          <div className="section-header">
            <h2>Running a restaurant is hard. <span className="text-gradient">Your software shouldn’t be.</span></h2>
            <p>We solved the messiest parts of daily operations so you can focus on your food.</p>
          </div>

          <div className="features-grid">
            {problems.map((p, idx) => (
              <div key={idx} className="feature-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '0.25rem' }}>{p.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.title}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: '500' }}>→ {p.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need, <span className="text-gradient">Nothing You Don't.</span></h2>
            <p>Powerful features designed for utility and speed, not complexity.</p>
          </div>

          <div className="features-grid">
            {featureCards.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Overlay - Simplified Mockup */}
      <section className="dashboard-preview">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Insights <span className="text-gradient">On Any Device</span></h2>
            <p>From large tablets to your own phone—ZenRestro adapts to your workflow.</p>
          </div>

          <div className="dashboard-container glass">
            <div className="dashboard-header">
              <div className="dots">
                <span></span><span></span><span></span>
              </div>
              <div className="dashboard-title">ZenRestro Admin Dashboard</div>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
               <div style={{ background: 'var(--bg-dark)', height: '400px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp className="w-16 h-16 text-primary opacity-20" />
                  <span style={{ position: 'absolute', color: 'var(--text-gray)', fontWeight: '600' }}>Interface Mockup: Fast & Clean Billing Screen</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div className="section-header">
            <h2>One Simple Plan. <span className="text-gradient">No Hidden Charges.</span></h2>
            <p>Get everything ZenRestro has to offer with one transparent price.</p>
          </div>

          <div style={{ maxWidth: '450px', margin: '0 auto' }}>
            <div className="pricing-card popular" style={{ textAlign: 'center' }}>
              <div className="popular-badge">Full Featured Plan</div>
              <h3>Ultimate POS</h3>
              <div className="price">₹5,999<span>/year</span></div>
              <div style={{ margin: '1rem 0', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                + ₹20,000 One-time Setup Feed
              </div>
              <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
                <li><CheckCircle2 className="w-5 h-5" /> Unlimited Orders & Tokens</li>
                <li><CheckCircle2 className="w-5 h-5" /> WhatsApp Billing & Reports</li>
                <li><CheckCircle2 className="w-5 h-5" /> Full KDS & Inventory System</li>
                <li><CheckCircle2 className="w-5 h-5" /> 24/7 Priority Support</li>
                <li><CheckCircle2 className="w-5 h-5" /> On-site Setup & Staff Training</li>
              </ul>
              <Link to="/login" className="btn-primary" style={{ width: '100%', display: 'block' }}>
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-info">
              <div className="logo">
                <span className="logo-icon">ZR</span>
                <span className="logo-text">ZenRestro</span>
              </div>
              <p>The simplest POS software for modern Indian restaurants. Built for speed, designed for stability.</p>
              <div className="social-links" style={{ marginTop: '1.5rem' }}>
                <a href="#"><Twitter className="w-5 h-5" /></a>
                <a href="#"><Instagram className="w-5 h-5" /></a>
                <a href="#"><Facebook className="w-5 h-5" /></a>
                <a href="#"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Security</a>
            </div>

            <div className="footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 ZenRestro. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ZenRestroLanding;
