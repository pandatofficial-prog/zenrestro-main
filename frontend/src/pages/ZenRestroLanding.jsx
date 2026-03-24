import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  ChefHat,
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Play,
  Star,
  Users,
  Award,
  Globe,
  Phone,
  Mail,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Shield
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

  const restaurantsCount = useCounter(500);
  const ordersCount = useCounter(1000);
  const uptimeCount = useCounter(99);

  const features = [
    {
      title: 'Smart Online Ordering',
      description: 'Streamline your sales with a seamless digital menu and ordering interface that converts visitors into customers.',
      icon: <ShoppingBag className="w-7 h-7" />
    },
    {
      title: 'WhatsApp Integration',
      description: 'Accept and manage orders directly through WhatsApp with automated responses and notifications.',
      icon: <MessageSquare className="w-7 h-7" />
    },
    {
      title: 'Kitchen Display System',
      description: 'Digitalize your kitchen workflow with our KDS - eliminate paper tickets and reduce errors.',
      icon: <ChefHat className="w-7 h-7" />
    },
    {
      title: 'Table Reservations',
      description: 'Effortless reservation management to maximize your restaurant capacity and reduce no-shows.',
      icon: <Calendar className="w-7 h-7" />
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor every order from preparation to delivery with live tracking and detailed reports.',
      icon: <TrendingUp className="w-7 h-7" />
    },
    {
      title: 'Smart Inventory',
      description: 'AI-powered inventory management that predicts stock needs and reduces waste significantly.',
      icon: <Zap className="w-7 h-7" />
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Customer Places Order',
      description: 'Customers scan QR code or message via WhatsApp to view your digital menu and place orders.'
    },
    {
      step: '02',
      title: 'Kitchen Receives Order',
      description: 'Orders instantly appear on the KDS for the kitchen staff to view and start preparing.'
    },
    {
      step: '03',
      title: 'Food Preparation',
      description: 'Staff updates status as food moves from prep to ready-for-service with one tap.'
    },
    {
      step: '04',
      title: 'Auto Notifications',
      description: 'Customers receive automated WhatsApp updates about their order status in real-time.'
    }
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '₹999',
      period: '/month',
      features: ['Up to 500 orders/mo', 'Digital Menu', 'WhatsApp Integration', 'Basic Analytics', 'Email Support'],
      popular: false
    },
    {
      name: 'Professional',
      price: '₹2,499',
      period: '/month',
      features: ['Unlimited orders', 'Full KDS System', 'Advanced Analytics', '24/7 Priority Support', 'Table Management', 'Inventory System', 'Custom Branding'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '₹4,999',
      period: '/month',
      features: ['Multi-branch Support', 'API Access', 'Dedicated Account Manager', 'Marketing Tools', 'White-label Solution', 'Custom Integrations', 'SLA Guarantee'],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Owner, The Golden Bistro',
      text: 'ZenRestro transformed our operations. WhatsApp orders alone increased our revenue by 35% in just two months. The KDS system eliminated all our order confusion.',
      rating: 5,
      image: null
    },
    {
      name: 'David Chen',
      role: 'Manager, Sakura Sushi',
      text: 'The Kitchen Display System is a lifesaver. No more lost tickets or miscommunication between front and back of house. Our efficiency improved by 50%.',
      rating: 5,
      image: null
    },
    {
      name: 'Priya Sharma',
      role: 'Founder, Spice Garden',
      text: 'Best investment for our restaurant. The automated WhatsApp notifications keep customers informed and reduce follow-up calls by 80%.',
      rating: 5,
      image: null
    }
  ];

  const whyChooseUs = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Sub-second order processing with real-time sync across all devices and terminals.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted with 256-bit SSL. We are PCI-DSS compliant and GDPR ready.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Cloud-Native',
      description: 'Access your restaurant from anywhere. Works offline with automatic sync when online.'
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
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#testimonials">Testimonials</a>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/login" className="btn-primary">Start Free Trial</Link>
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
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            <Link to="/login" className="btn-secondary" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
            <Link to="/login" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Start Free Trial</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
          <div className="hero-glow"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>Next Generation Restaurant SaaS</span>
            </div>

            <h1>
              Automate Your Restaurant with <span className="text-gradient">Smart Ordering</span> & WhatsApp
            </h1>

            <p>
              Elevate your restaurant operations with cutting-edge automation.
              From QR menus to kitchen management, we handle the tech so you can focus on what you do best — serving amazing food.
            </p>

            <div className="hero-btns">
              <Link to="/login" className="btn-primary-large">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/login" className="btn-outline-large">
                Get a Demo
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{restaurantsCount}+</span>
                <span className="stat-label">Restaurants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{ordersCount}K+</span>
                <span className="stat-label">Orders Processed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{uptimeCount}.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why <span className="text-gradient">ZenRestro</span>?</h2>
            <p>Join 500+ restaurants that trust ZenRestro to power their operations.</p>
          </div>

          <div className="features-grid">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="feature-card" style={{ textAlign: 'center' }}>
                <div className="feature-icon" style={{ margin: '0 auto 1.5rem' }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features" style={{ background: 'var(--bg-dark)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for <span className="text-gradient">Modern Restaurants</span></h2>
            <p>Everything you need to scale your restaurant business efficiently.</p>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How <span className="text-gradient">ZenRestro</span> Works</h2>
            <p>A simple 4-step process to automate your entire restaurant workflow.</p>
          </div>

          <div className="steps-container">
            {steps.map((step, idx) => (
              <div key={idx} className="step-item">
                <div className="step-number">{step.step}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="dashboard-preview">
        <div className="container">
          <div className="section-header">
            <h2>Beautiful <span className="text-gradient">Admin Dashboard</span></h2>
            <p>Powerful insights at your fingertips with our intuitive control panel.</p>
          </div>

          <div className="dashboard-container glass">
            <div className="dashboard-header">
              <div className="dots">
                <span></span><span></span><span></span>
              </div>
              <div className="dashboard-title">ZenRestro Admin Console</div>
            </div>
            <div className="dashboard-mockup">
              <div className="mock-sidebar">
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item"></div>
                <div className="mock-sidebar-item"></div>
              </div>
              <div className="mock-main">
                <div className="mock-top">
                  <div className="mock-card"></div>
                  <div className="mock-card"></div>
                  <div className="mock-card"></div>
                </div>
                <div className="mock-content">
                  <div className="mock-chart"></div>
                  <div className="mock-list">
                    <div className="mock-list-item"></div>
                    <div className="mock-list-item"></div>
                    <div className="mock-list-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, <span className="text-gradient">Transparent</span> Pricing</h2>
            <p>Choose the perfect plan for your restaurant's size and needs.</p>
          </div>

          <div className="pricing-grid">
            {pricing.map((plan, idx) => (
              <div key={idx} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}<span>{plan.period}</span></div>
                <ul>
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <CheckCircle2 className="w-5 h-5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={plan.popular ? 'btn-primary' : 'btn-outline'}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Loved by <span className="text-gradient">Restaurant Owners</span></h2>
            <p>See what our customers have to say about ZenRestro.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill="#d4af37" color="#d4af37" />
                  ))}
                </div>
                <p className="quote">"{t.text}"</p>
                <div className="author">
                  <div className="author-img"></div>
                  <div>
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'var(--bg-dark-secondary)', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <h2>Ready to <span className="text-gradient">Transform</span> Your Restaurant?</h2>
            <p>Start your 14-day free trial today. No credit card required.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn-primary-large">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="btn-outline-large">
              Schedule Demo Call
            </Link>
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
              <p>Revolutionizing the restaurant industry with cutting-edge SaaS automation. Build, Scale, and Grow with confidence.</p>
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
              <a href="#">Integrations</a>
              <a href="#">API Docs</a>
            </div>

            <div className="footer-links">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press Kit</a>
            </div>

            <div className="footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 ZenRestro. All rights reserved.</p>
            <p>Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ZenRestroLanding;
