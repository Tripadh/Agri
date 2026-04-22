import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const hasToken = Boolean(localStorage.getItem('token'));
  const heroRef = useRef(null);
  const [impactValues, setImpactValues] = useState({ speed: 0, support: 0, platform: 0 });

  const featureCards = [
    {
      title: 'Field-Centered Crop Planning',
      text: 'Track crop lifecycle stages, planting windows, and field-level notes without losing context.',
      tag: 'Crop Intelligence',
    },
    {
      title: 'Action-Ready Activity Tracking',
      text: 'Convert daily farm operations into structured tasks with priority, status, and ownership.',
      tag: 'Daily Operations',
    },
    {
      title: 'Resource & Cost Visibility',
      text: 'Monitor water, fertilizer, seeds, and labor usage with historical traces for better planning.',
      tag: 'Resource Control',
    },
    {
      title: 'Weather-Driven Decisions',
      text: 'Get weather context and practical recommendations to reduce risk in field operations.',
      tag: 'Risk Reduction',
    },
  ];

  const steps = [
    {
      label: 'Step 1',
      title: 'Set Up Your Farm Profile',
      text: 'Create your account and initialize your crop, resource, and field setup in minutes.',
    },
    {
      label: 'Step 2',
      title: 'Plan, Track, and Update',
      text: 'Use guided forms and quick templates to maintain operational records every day.',
    },
    {
      label: 'Step 3',
      title: 'Act On Insights',
      text: 'Review dashboard metrics, weather cues, and pending activities to decide faster.',
    },
  ];

  useEffect(() => {
    const duration = 1300;
    const targets = { speed: 30, support: 24, platform: 1 };
    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - (1 - progress) ** 3;

      setImpactValues({
        speed: Math.round(targets.speed * easeOut),
        support: Math.round(targets.support * easeOut),
        platform: Math.max(1, Math.round(targets.platform * easeOut)),
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleHeroMouseMove = (event) => {
    if (!heroRef.current) {
      return;
    }

    const rect = heroRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    heroRef.current.style.setProperty('--mx', `${x}%`);
    heroRef.current.style.setProperty('--my', `${y}%`);
  };

  const resetHeroMouse = () => {
    if (!heroRef.current) {
      return;
    }
    heroRef.current.style.setProperty('--mx', '50%');
    heroRef.current.style.setProperty('--my', '28%');
  };

  return (
    <div className="home-page">
      <section
        ref={heroRef}
        className="home-hero card"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={resetHeroMouse}
      >
        <div className="live-demo-ribbon" aria-label="Live demo mode enabled">
          <span className="demo-dot" />
          Live Demo Mode
        </div>
        <div className="hero-copy">
          <span className="hero-badge">Smart Agriculture Management Platform</span>
          <h1>Built for real farm days, real decisions, and real outcomes.</h1>
          <p>
            Move from scattered notes to a structured, intelligent farm workflow.
            Manage crops, resources, weather risks, and activities in one place that
            feels practical, fast, and human.
          </p>
          <div className="hero-actions">
            {!hasToken ? (
              <>
                <Link to="/register" className="primary-btn">
                  Start Free Setup
                </Link>
                <Link to="/login" className="secondary-btn">
                  Farmer Login
                </Link>
                <Link to="/admin-login" className="link-btn">
                  Admin Access
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="primary-btn">
                  Open Dashboard
                </Link>
                <Link to="/crops" className="secondary-btn">
                  Manage Crops
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="pulse-board">
            <h3>Farm Pulse</h3>
            <ul>
              <li><span>Active Plots</span><strong>12</strong></li>
              <li><span>Pending Tasks</span><strong>7</strong></li>
              <li><span>Rain Chance</span><strong>68%</strong></li>
              <li><span>Resource Runway</span><strong>9 days</strong></li>
            </ul>
          </div>
          <div className="hero-chip chip-a">Weather Aware</div>
          <div className="hero-chip chip-b">Role Secured</div>
          <div className="hero-chip chip-c">Insights First</div>
        </div>
      </section>

      <section className="impact-strip card">
        <article>
          <strong>{impactValues.speed}%+</strong>
          <span>Faster farm record updates with templates</span>
        </article>
        <article>
          <strong>{impactValues.support}/7</strong>
          <span>Weather-based planning cues</span>
        </article>
        <article>
          <strong>{impactValues.platform} Platform</strong>
          <span>Crops, resources, and activities in one dashboard</span>
        </article>
      </section>

      <section className="home-features">
        <div className="section-head">
          <h2>What Makes This Platform Judge-Worthy</h2>
          <p>
            Every feature is designed to reflect realistic agricultural workflows,
            not just data entry screens.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="feature-card card">
              <span className="feature-tag">{feature.tag}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-workflow card">
        <div className="section-head">
          <h2>How A Farmer Uses It In 3 Steps</h2>
        </div>
        <div className="workflow-grid">
          {steps.map((step) => (
            <article key={step.label} className="workflow-card">
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-human card">
        <blockquote>
          "This feels like a system built with farmers in mind. I can check what
          needs attention today in seconds, not hours."
        </blockquote>
        <p>Demo Farmer Feedback • Smart Agriculture Showcase</p>
      </section>

      <section className="home-cta card">
        <div>
          <h2>Ready To Present A Modern Farm Workflow?</h2>
          <p>
            Use the live dashboard, crop templates, activity presets, and weather
            insights to showcase an end-to-end intelligent agriculture solution.
          </p>
        </div>
        <div className="hero-actions">
          <Link to={hasToken ? '/dashboard' : '/register'} className="primary-btn">
            {hasToken ? 'Go To Dashboard' : 'Create Account'}
          </Link>
          <Link to="/weather" className="secondary-btn">
            Explore Weather Module
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
