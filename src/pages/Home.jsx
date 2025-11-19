import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import ThreeBackground from '../components/ThreeBackground';
import MarkdownConverter from '../components/MarkdownConverter';
import ImageColorExtractor from '../components/ImageColorExtractor';
import JSONFormatter from '../components/JSONFormatter';
import Modal from '../components/Modal';
import PasswordGenerator from '../components/PasswordGenerator';
import QRCodeGenerator from '../components/QRCodeGenerator';
import TextCaseConverter from '../components/TextCaseConverter';
import UnitConverter from '../components/UnitConverter';
import ColorPaletteGenerator from '../components/ColorPaletteGenerator';
import LoremGenerator from '../components/LoremGenerator';
import SmartAssistant from '../components/SmartAssistant';
import VirtualTryOn from '../components/VirtualTryOn';
import EyeBlinkShooter from '../components/EyeBlinkShooter';
import AIImageEditor from '../components/AIImageEditor';
import { Link } from 'react-router-dom';
import './Home.css';
import HandShootShooter from '../components/HandShootShooter';
import BackgroundRemover from '../components/BackgroundRemover';
import SmartInventoryAI from '../components/Smartinventoryai';

const Home = () => {
  const [isVisible, setIsVisible] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', component: null });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const openModal = (title, component) => {
    setModalContent({ title, component });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setModalContent({ title: '', component: null }), 300);
  };

  const tools = [
    {
      icon: '🤖',
      title: 'Smart Shopping Assistant',
      description: 'AI chatbot that recommends best sites to buy products - no API needed!',
      component: <SmartAssistant />,
      category: 'ai'
    },
    {
      icon: '👓',
      title: 'Virtual Try-On AR',
      description: 'Try glasses and caps in real-time using your camera',
      component: <VirtualTryOn />,
      category: 'ai'
    },
    // {
    //   icon: '👁️',
    //   title: 'Eye-Blink Shooter',
    //   description: 'Fun shooting game controlled by blinking your eyes!',
    //   component: <EyeBlinkShooter />,
    //   category: 'ai'
    // },
      {
      icon: '👁️',
      title: 'HandShoot Shooter',
      description: 'Fun shooting game controlled by Shoot from your Hands!',
      component: <HandShootShooter />,
      category: 'ai'
    },
    //   {
    //   icon: '🎨',
    //   title: 'AI Inventory Management',
    //   description: 'Inventory Management',
    //   component: <SmartInventoryAI />,
    //   category: 'ai'
    // },
    {
      icon: '🎨',
      title: 'AI Image Editor',
      description: 'Apply AI-powered filters and effects to your photos',
      component: <AIImageEditor />,
      category: 'ai'
    },
    {
      icon: '🔐',
      title: 'Password Generator',
      description: 'Create strong, secure passwords with customizable options',
      component: <PasswordGenerator />,
      category: 'utility'
    },
    {
      icon: '📱',
      title: 'QR Code Generator',
      description: 'Generate QR codes for URLs, text, or any data instantly',
      component: <QRCodeGenerator />,
      category: 'utility'
    },
    {
      icon: '🔤',
      title: 'Text Case Converter',
      description: 'Convert text between different cases (upper, lower, camel, etc.)',
      component: <TextCaseConverter />,
      category: 'utility'
    },
    {
      icon: '⚖️',
      title: 'Unit Converter',
      description: 'Convert between different units (length, weight, temperature, etc.)',
      component: <UnitConverter />,
      category: 'utility'
    },
    {
      icon: '🌈',
      title: 'Color Palette Generator',
      description: 'Generate beautiful color palettes from a base color',
      component: <ColorPaletteGenerator />,
      category: 'utility'
    },
    {
      icon: '📝',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for your design mockups',
      component: <LoremGenerator />,
      category: 'utility'
    },
    // {
    //   icon: '📋',
    //   title: 'Markdown Converter',
    //   description: 'Convert Markdown to HTML and preview in real-time',
    //   component: <MarkdownConverter />,
    //   category: 'utility'
    // },
    // {
    //   icon: '🖼️',
    //   title: 'Image Color Extractor',
    //   description: 'Extract color palettes from your images',
    //   component: <ImageColorExtractor />,
    //   category: 'utility'
    // },
    // {
    //   icon: '{ }',
    //   title: 'JSON Formatter',
    //   description: 'Format, validate and beautify JSON data',
    //   component: <JSONFormatter />,
    //   category: 'utility'
    // }
  ];

  const services = [
    {
      icon: '🤖',
      title: 'AI Solutions',
      description: 'Custom AI models and machine learning solutions tailored to your business needs.'
    },
    {
      icon: '🌐',
      title: 'Web Development',
      description: 'Cutting-edge websites and web applications built with modern technologies.'
    },
    {
      icon: '📱',
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications that deliver exceptional user experiences.'
    },
    {
      icon: '☁️',
      title: 'Cloud Integration',
      description: 'Scalable cloud solutions and seamless integration with existing systems.'
    }
  ];

  const technologies = [
    'React', 'Node.js', 'Python', 'TensorFlow', 'PyTorch', 'Three.js',
    'TypeScript', 'Next.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'
  ];

  const stats = [
    { number: '150+', label: 'Projects Completed' },
    { number: '50+', label: 'Happy Clients' },
    { number: '15+', label: 'Team Members' },
    { number: '99%', label: 'Client Satisfaction' }
  ];

  return (
    <div className="home">
      <ThreeBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text animate-fade-in">
            <h1 className="hero-title">
              Building the Future with
              <span className="gradient-text"> AI & Innovation</span>
            </h1>
            <p className="hero-subtitle">
              We transform ideas into intelligent digital solutions that drive growth and innovation
            </p>
            <div className="hero-buttons">
              <Link to="/contact" className="btn btn-primary">
                Get Started
              </Link>
              <button className="btn btn-secondary" onClick={() => {
                document.getElementById('ai-demos').scrollIntoView({ behavior: 'smooth' });
              }}>
                Try Free Tools
              </button>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-cube"></div>
          <div className="floating-cube"></div>
          <div className="floating-cube"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-home">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">
              Comprehensive solutions for your digital transformation
            </p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`service-card ${isVisible['services'] ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Products Section */}
      <section id="ai-products" className="ai-demos-section animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🤖 AI-Powered Products</h2>
            <p className="section-subtitle">
              Interactive AI experiences - Smart assistant, AR try-on, eye-controlled games & more!
            </p>
          </div>
          <div className={`tools-grid ${isVisible['ai-products'] ? 'visible' : ''}`}>
            {tools.filter(tool => tool.category === 'ai').map((tool, index) => (
              <div 
                key={index} 
                className="tool-card ai-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openModal(tool.title, tool.component)}
              >
                <div className="tool-icon">{tool.icon}</div>
                <h3 className="tool-title">{tool.title}</h3>
                <p className="tool-description">{tool.description}</p>
                <div className="tool-action">
                  <span>Try It →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Utility Tools Section */}
      <section id="ai-demos" className="ai-demos-section animate-on-scroll">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🛠️ Free Web Tools</h2>
            <p className="section-subtitle">
              Professional tools for developers and creators - 100% free, no signup required, all client-side
            </p>
          </div>
          <div className={`tools-grid ${isVisible['ai-demos'] ? 'visible' : ''}`}>
            {tools.filter(tool => tool.category === 'utility').map((tool, index) => (
              <div 
                key={index} 
                className="tool-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openModal(tool.title, tool.component)}
              >
                <div className="tool-icon">{tool.icon}</div>
                <h3 className="tool-title">{tool.title}</h3>
                <p className="tool-description">{tool.description}</p>
                <div className="tool-action">
                  <span>Open Tool →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Tools */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={modalContent.title}>
        {modalContent.component}
      </Modal>

      {/* Technologies Section */}
      <section className="technologies-section animate-on-scroll" id="technologies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Technologies We Master</h2>
            <p className="section-subtitle">
              Leveraging cutting-edge tools to build exceptional products
            </p>
          </div>
          <div className={`tech-grid ${isVisible['technologies'] ? 'visible' : ''}`}>
            {technologies.map((tech, index) => (
              <div 
                key={index} 
                className="tech-badge"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Project?</h2>
            <p className="cta-subtitle">
              Let's discuss how we can help bring your vision to life
            </p>
            <Link to="/contact" className="btn btn-primary btn-large">
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-text">
                <span className="logo-main">NexaAI</span>
                <span className="logo-sub">Studio</span>
              </div>
              <p className="footer-tagline">Building tomorrow's solutions today</p>
            </div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 NexaAI Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
