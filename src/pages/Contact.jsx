import { useState } from 'react';
import Navigation from '../components/Navigation';
import ThreeBackground from '../components/ThreeBackground';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        service: '',
        message: ''
      });

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      value: 'hello@nexaai.studio',
      link: 'mailto:hello@nexaai.studio'
    },
    {
      icon: '📱',
      title: 'Phone',
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: '📍',
      title: 'Location',
      value: 'San Francisco, CA',
      link: null
    }
  ];

  const services = [
    'AI Solutions',
    'Web Development',
    'Mobile Apps',
    'Cloud Integration',
    'Consulting',
    'Other'
  ];

  return (
    <div className="contact-page">
      <ThreeBackground />
      <Navigation />

      <div className="contact-content">
        <div className="container">
          {/* Header */}
          <div className="contact-header">
            <h1 className="page-title animate-fade-in">
              Let's Build Something
              <span className="gradient-text"> Amazing Together</span>
            </h1>
            <p className="page-subtitle animate-fade-in">
              Have a project in mind? We'd love to hear about it. Drop us a message and let's start the conversation.
            </p>
          </div>

          {/* Main Content */}
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="info-title">Get in Touch</h2>
              <p className="info-description">
                Feel free to reach out through any of these channels. We're here to help!
              </p>

              <div className="info-cards">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index} 
                    className="info-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="info-icon">{info.icon}</div>
                    <div className="info-content">
                      <h3 className="info-card-title">{info.title}</h3>
                      {info.link ? (
                        <a href={info.link} className="info-value">
                          {info.value}
                        </a>
                      ) : (
                        <p className="info-value">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="office-hours">
                <h3 className="hours-title">Office Hours</h3>
                <p className="hours-text">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                <p className="hours-text">Weekend: By Appointment</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">Service Interested In *</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service, index) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Project Details *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Tell us about your project..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="success-message">
                    ✓ Thank you! We'll get back to you within 24 hours.
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* CTA Back to Home */}
          <div className="back-cta">
            <p>Want to learn more about what we do?</p>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

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

export default Contact;
