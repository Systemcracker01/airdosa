'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Navigation,
  Zap,
  Rocket,
  Cpu,
  Menu,
  X,
  CheckCircle2,
  XCircle,
  Twitter,
  Github,
  Instagram,
  ArrowRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Layers,
  Flame,
  Target,
} from 'lucide-react';

export default function Home() {
  /* ---- Nav state ---- */
  const [navScrolled, setNavScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [floatingVisible, setFloatingVisible] = useState(true);

  /* ---- Modal state ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = configurator, 2 = telemetry

  /* ---- Configurator state ---- */
  const [selectedProfile, setSelectedProfile] = useState({ type: 'classic', price: 110 });
  const [crispValue, setCrispValue] = useState(5);
  const [crispLabel, setCrispLabel] = useState('Golden Classic Crisp (Lv. 5)');
  const [chutneys, setChutneys] = useState(['Coconut Chutney', 'Spicy Tomato']);
  const [deliveryTarget, setDeliveryTarget] = useState('HSR');

  /* ---- Telemetry sim state ---- */
  const [destLabel, setDestLabel] = useState('YOUR BALCONY');
  const [simAlt, setSimAlt] = useState('0 M');
  const [simTemp, setSimTemp] = useState('78.4°C');
  const [simEta, setSimEta] = useState('12s');
  const [progress, setProgress] = useState(0);
  const [consoleLines, setConsoleLines] = useState([]);
  const [showReturn, setShowReturn] = useState(false);

  /* ---- Refs ---- */
  const simIntervalRef = useRef(null);
  const flightPathRef = useRef(null);
  const simDroneRef = useRef(null);
  const consoleLogRef = useRef(null);
  const progressBarRef = useRef(null);

  /* ---- Derived price ---- */
  const totalPrice = selectedProfile.price + (chutneys.length > 2 ? (chutneys.length - 2) * 15 : 0);

  /* ---- Scroll effects ---- */
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      setFloatingVisible(window.scrollY + clientHeight <= scrollHeight - 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ---- Scroll reveal ---- */
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ---- Feature card mouse glow ---- */
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    const handlers = [];
    cards.forEach((card) => {
      const handler = (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      };
      card.addEventListener('mousemove', handler);
      handlers.push({ card, handler });
    });
    return () => handlers.forEach(({ card, handler }) => card.removeEventListener('mousemove', handler));
  }, []);

  /* ---- Body scroll lock when modal open ---- */
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
  }, [modalOpen]);

  /* ---- Helpers ---- */
  const openModal = (e) => {
    e?.preventDefault();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(resetConfigurator, 400);
  };

  const updateCrispLevel = (value) => {
    const level = parseInt(value);
    let text = '';
    if (level <= 2) text = 'Soft & Spongy (Davangere Style)';
    else if (level <= 4) text = 'Medium Soft';
    else if (level <= 6) text = 'Golden Classic Crisp';
    else if (level <= 8) text = 'Extra Crunchy (Ghee Loaded)';
    else text = 'Shatter-Crisp (Goggles Recommended!)';
    setCrispValue(level);
    setCrispLabel(`${text} (Lv. ${level})`);
  };

  const toggleChutney = (name) => {
    setChutneys((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const selectProfile = (type, price) => setSelectedProfile({ type, price });

  const addConsoleLine = useCallback((text, type) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setConsoleLines((prev) => [...prev, { timeStr, text, type }]);
    setTimeout(() => {
      if (consoleLogRef.current)
        consoleLogRef.current.scrollTop = consoleLogRef.current.scrollHeight;
    }, 10);
  }, []);

  const resetConfigurator = () => {
    clearInterval(simIntervalRef.current);
    setStep(1);
    setProgress(0);
    setConsoleLines([]);
    setShowReturn(false);
    if (simDroneRef.current) simDroneRef.current.style.display = 'none';
  };

  const initiateFlight = (e) => {
    e.preventDefault();
    setDestLabel(`TARGET-${deliveryTarget.toUpperCase()}`);
    setStep(2);
    setConsoleLines([]);
    setShowReturn(false);

    // Let step-2 DOM mount before animating
    setTimeout(() => {
      const flightPath = flightPathRef.current;
      const simDrone = simDroneRef.current;
      if (!flightPath || !simDrone) return;

      simDrone.style.display = 'block';

      const srcX = 120, srcY = 200, dstX = 450, dstY = 62;
      const pathData = `M ${srcX} ${srcY} C ${srcX + 150} ${srcY}, ${dstX - 150} ${dstY}, ${dstX} ${dstY}`;
      flightPath.setAttribute('d', pathData);

      const pathLength = flightPath.getTotalLength();
      flightPath.style.strokeDasharray = pathLength;
      flightPath.style.strokeDashoffset = pathLength;

      addConsoleLine('Initializing batter thermal profiles...', 'info');

      const duration = 8000;
      const startTime = Date.now();
      const logTimes = {
        5: 'Batter injected into mid-air baking chamber.',
        15: 'Propulsion armed. HAL Airport ATC cleared flight corridor.',
        30: 'Quadcopter lift-off completed. Alt: 12m. Speed: 25 km/h.',
        50: 'Thermal Pod active: internal chamber cooking at 78.4°C.',
        70: 'Descending towards target balcony beacon. Wind correction active.',
        85: 'LIDAR mapping active. Clear of tree lines and wires.',
        96: 'Drop-off valve opened. Sambar container secured.',
        100: 'Delivery complete! Ghee Crisp optimization successful.',
      };
      const logFired = {};

      simIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const prog = Math.min((elapsed / duration) * 100, 100);

        setProgress(prog);
        if (progressBarRef.current)
          progressBarRef.current.style.width = `${prog}%`;

        const drawOffset = pathLength - pathLength * (prog / 100);
        flightPath.style.strokeDashoffset = drawOffset;

        const point = flightPath.getPointAtLength(pathLength * (prog / 100));
        simDrone.style.left = `${(point.x / 600) * 100}%`;
        simDrone.style.top = `${(point.y / 250) * 100}%`;

        if (prog < 99) {
          const nextPoint = flightPath.getPointAtLength(pathLength * ((prog + 1) / 100));
          const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
          simDrone.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        }

        // Telemetry numbers
        let currentAlt = 0;
        if (prog < 15) currentAlt = (prog / 15) * 45;
        else if (prog < 80) currentAlt = 45 + Math.sin(prog / 10) * 3;
        else currentAlt = Math.max(0, 45 - ((prog - 80) / 20) * 45);

        let currentTemp = 25 + (Math.min(prog, 50) / 50) * 53.4;
        if (prog >= 50) currentTemp = 78.4 + Math.sin(prog) * 0.2;

        const currentEta = Math.ceil((duration - elapsed) / 1000);

        setSimAlt(`${currentAlt.toFixed(1)} M`);
        setSimTemp(`${currentTemp.toFixed(1)}°C`);
        setSimEta(prog >= 100 ? 'Arrived' : `${currentEta}s`);

        // Console log lines
        const progInt = Math.floor(prog);
        Object.keys(logTimes).forEach((pct) => {
          if (progInt >= parseInt(pct) && !logFired[pct]) {
            logFired[pct] = true;
            addConsoleLine(logTimes[pct], pct === '100' ? 'success' : 'info');
          }
        });

        if (prog >= 100) {
          clearInterval(simIntervalRef.current);
          setShowReturn(true);
        }
      }, 50);
    }, 50);
  };

  /* ------------------------------------------------------------------ */
  return (
    <>
      {/* FLOATING NAVBAR */}
      <header className={`header${navScrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          <a href="#" className="logo">
            <Navigation className="logo-icon" size={22} />
            <span>AirDosa</span>
          </a>
          <nav className={`nav-links${navOpen ? ' active' : ''}`} id="navLinks">
            <a href="#features" className="nav-link" onClick={() => setNavOpen(false)}>Technology</a>
            <a href="#pricing" className="nav-link" onClick={() => setNavOpen(false)}>Subscription</a>
            <a href="#" className="nav-link" onClick={(e) => { setNavOpen(false); openModal(e); }}>Live Launcher</a>
            <a href="#" className="btn nav-cta" onClick={(e) => { setNavOpen(false); openModal(e); }}>Launch App</a>
          </nav>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content reveal">
            <div className="hero-badge">
              <Zap size={14} />
              100% Ghee, 0% Lag — Delivering Live in Bengaluru
            </div>
            <h1 className="hero-title">
              Hot, Crispy Dosas.<br />Delivered from the <span>Clouds</span>.
            </h1>
            <p className="hero-description">
              Experience breakfast at hypersonic speeds. Our autonomous drones use AI-optimized thermal pods to bake your custom-crisp dosas mid-flight, dropping them onto your balcony in under 4 minutes.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={openModal}>
                <Rocket size={16} /> Launch Dosa
              </button>
              <a href="#features" className="btn btn-secondary">
                <Cpu size={16} /> Telemetry &amp; Specs
              </a>
            </div>
          </div>

          {/* Animated Drone Visualizer */}
          <div className="hero-graphic reveal delay-2">
            <div className="radar-circle radar-circle-1"></div>
            <div className="radar-circle radar-circle-2"></div>
            <div className="radar-circle radar-circle-3"></div>
            <div className="radar-sweep"></div>

            <div className="drone-wrapper">
              <svg className="drone-svg" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M70 60 L140 90" stroke="#1F2833" strokeWidth="8" strokeLinecap="round"/>
                <path d="M250 60 L180 90" stroke="#1F2833" strokeWidth="8" strokeLinecap="round"/>
                <path d="M90 120 L140 100" stroke="#1F2833" strokeWidth="6" strokeLinecap="round"/>
                <path d="M230 120 L180 100" stroke="#1F2833" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="70" cy="60" r="10" fill="#00F2FE" />
                <circle cx="250" cy="60" r="10" fill="#00F2FE" />
                <circle cx="90" cy="120" r="8" fill="#00F2FE" />
                <circle cx="230" cy="120" r="8" fill="#00F2FE" />
                <ellipse className="propeller prop-left" cx="70" cy="42" rx="40" ry="6" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" fill="rgba(0, 242, 254, 0.05)"/>
                <ellipse className="propeller prop-right" cx="250" cy="42" rx="40" ry="6" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="2" fill="rgba(0, 242, 254, 0.05)"/>
                <ellipse className="propeller prop-rear-left" cx="90" cy="110" rx="30" ry="4" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="1.5" fill="rgba(0, 242, 254, 0.05)"/>
                <ellipse className="propeller prop-rear-right" cx="230" cy="110" rx="30" ry="4" stroke="rgba(0, 242, 254, 0.3)" strokeWidth="1.5" fill="rgba(0, 242, 254, 0.05)"/>
                <path d="M120 70 L200 70 L210 105 L160 125 L110 105 Z" fill="#0F111A" stroke="#2C3347" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M140 70 L180 70 L190 95 L160 110 L130 95 Z" fill="#1F2438"/>
                <rect x="150" y="80" width="20" height="8" rx="4" fill="#00F2FE" />
                <circle cx="160" cy="84" r="2" fill="#fff" />
                <rect x="130" y="125" width="60" height="35" rx="8" fill="#1F1510" stroke="#FF9F1C" strokeWidth="2"/>
                <rect x="138" y="132" width="44" height="21" rx="4" fill="rgba(255, 159, 28, 0.15)" stroke="rgba(255, 159, 28, 0.4)" strokeWidth="1"/>
                <path d="M145 146 L175 146 L160 136 Z" fill="#FF9F1C" opacity="0.9"/>
                <path className="steam-line" d="M142 120 Q147 110 142 100" stroke="#FF9F1C" strokeWidth="1.5" fill="none" opacity="0.7"/>
                <path className="steam-line" d="M160 120 Q165 110 160 100" stroke="#FF9F1C" strokeWidth="1.5" fill="none" opacity="0.7"/>
                <path className="steam-line" d="M178 120 Q183 110 178 100" stroke="#FF9F1C" strokeWidth="1.5" fill="none" opacity="0.7"/>
              </svg>
            </div>

            {/* Telemetry Display panel */}
            <div className="telemetry-overlay">
              <div className="telemetry-row">
                <span>DRONE ID</span>
                <span className="telemetry-val">AD-909</span>
              </div>
              <div className="telemetry-row">
                <span>ALTITUDE</span>
                <span className="telemetry-val">42.8 M</span>
              </div>
              <div className="telemetry-row">
                <span>POD TEMP</span>
                <span className="telemetry-val">78.4°C</span>
              </div>
              <div className="telemetry-row">
                <span>STATUS</span>
                <span className="telemetry-val" style={{ color: 'var(--accent-green)' }}>
                  <span className="pulsing-indicator"></span>Baking Mid-Air
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES / TECHNOLOGY SECTION */}
      <section className="section" id="features" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="section-header reveal">
          <span className="section-badge">Autonomous Ghee Logistics</span>
          <h2 className="section-title">The Physics of Crispiness</h2>
          <p className="section-subtitle">We solved the moisture problem. Standard delivery makes dosas soggy. AirDosa launches custom drones optimized to deliver the perfect golden crunch.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal delay-1">
            <div className="card-icon-wrapper"><Cpu size={24} /></div>
            <h3>Batter AI™ Modeling</h3>
            <p>Our machine learning models constantly analyze ambient pressure, wind shear, and relative humidity across Bengaluru to alter battery temperature and active yeast kinetics during drone transit.</p>
          </div>
          <div className="feature-card reveal delay-2">
            <div className="card-icon-wrapper"><Flame size={24} /></div>
            <h3>Active Jetstream Baking</h3>
            <p>Dosas are cooked mid-flight in carbon-fiber thermal pods. Computer-controlled ventilation forces moist steam out while circulating pre-heated ghee vectors, maintaining a precise crisp-state at 78.4°C.</p>
          </div>
          <div className="feature-card reveal delay-3">
            <div className="card-icon-wrapper"><Target size={24} /></div>
            <h3>LIDAR Balcony Drops</h3>
            <p>Armed with solid-state LiDAR sensors and triple-frequency RTK GPS, our autonomous quadcopters execute safe centimeter-level landings to drop off chutney pods onto balconies, terraces, or window sills.</p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="section" id="pricing">
        <div className="section-header reveal">
          <span className="section-badge">Fuel &amp; Subscription Tiers</span>
          <h2 className="section-title">Select Your Fuel Plan</h2>
          <p className="section-subtitle">Whether you&apos;re a Sunday family breakfast traditionalist or a high-velocity midnight developer running on dosa carbs.</p>
        </div>

        <div className="pricing-grid">
          {/* Plan 1 */}
          <div className="pricing-card reveal delay-1">
            <div className="plan-header">
              <h3 className="plan-name">VFR (Pay-As-You-Eat)</h3>
              <p className="plan-description">Great for casual weekend breakfast warriors.</p>
              <div className="plan-price">₹99 <span>/ delivery</span></div>
            </div>
            <ul className="plan-features">
              <li><CheckCircle2 size={18} /> Standard drone delivery queue (15 mins)</li>
              <li><CheckCircle2 size={18} /> Ground level or Balcony drop zone</li>
              <li><CheckCircle2 size={18} /> Live drone tracking telemetry</li>
              <li><CheckCircle2 size={18} /> Standard Chutney pod matrix</li>
              <li style={{ opacity: 0.5 }}><XCircle size={18} style={{ color: 'var(--text-muted)' }} /> Sub-3 minute dispatch</li>
              <li style={{ opacity: 0.5 }}><XCircle size={18} style={{ color: 'var(--text-muted)' }} /> Custom crispiness slider</li>
            </ul>
            <button className="btn btn-secondary" onClick={openModal}>Order Delivery</button>
          </div>

          {/* Plan 2 */}
          <div className="pricing-card premium reveal delay-2">
            <span className="badge-popular">Most Popular</span>
            <div className="plan-header">
              <h3 className="plan-name">Super-Sonic Batter</h3>
              <p className="plan-description">For maximum acceleration. Highly recommended for devs.</p>
              <div className="plan-price">₹499 <span>/ month</span></div>
            </div>
            <ul className="plan-features">
              <li><CheckCircle2 size={18} /> Unlimited zero-delivery fee dispatches</li>
              <li><CheckCircle2 size={18} /> Priority hypersonic queue (&lt; 4 mins)</li>
              <li><CheckCircle2 size={18} /> Balcony, Terrace, or Window sill landing</li>
              <li><CheckCircle2 size={18} /> Dynamic chutney dual-valve injector</li>
              <li><CheckCircle2 size={18} /> Custom Crispiness Calibration (Levels 1-10)</li>
              <li><CheckCircle2 size={18} /> Exclusive Podi Dosa &amp; cheese variants</li>
            </ul>
            <button className="btn btn-primary" onClick={openModal}>Activate Autopilot</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <Navigation size={18} style={{ color: 'var(--primary)', marginRight: '0.3rem', display: 'inline' }} />
              <span>AirDosa</span>
            </a>
            <p className="footer-desc">Autonomous Ghee-propelled breakfast infrastructure. Baking and drops at speed since 2026.</p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" className="social-icon" aria-label="GitHub"><Github size={16} /></a>
              <a href="#" className="social-icon" aria-label="Instagram"><Instagram size={16} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Telemetry Specs</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">LIDAR Grid</a></li>
              <li><a href="#" className="footer-link">Batter Viscosity</a></li>
              <li><a href="#" className="footer-link">Active Thermal Pods</a></li>
              <li><a href="#" className="footer-link">HAL ATC Clearance</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legals</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">FAA India Rules</a></li>
              <li><a href="#" className="footer-link">Ghee Spill Protocol</a></li>
              <li><a href="#" className="footer-link">Balcony Landing Policy</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <h4>Launch Updates</h4>
            <p>Subscribe to know when drone launching covers your pin-code.</p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Subscribed! Drones are warming up for your neighborhood.');
              }}
            >
              <input type="email" placeholder="Your Email" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 AirDosa Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="footer-egg">
            <span>Engineered with</span>
            <Heart size={14} style={{ color: '#e25555', animation: 'heartbeat 1.5s infinite' }} />
            <span>and Ghee in Bengaluru</span>
          </div>
        </div>
      </footer>

      {/* FLOATING CTA BUTTON */}
      <button
        className="floating-cta"
        onClick={openModal}
        id="floatingCta"
        style={{ opacity: floatingVisible ? 1 : 0, pointerEvents: floatingVisible ? 'all' : 'none' }}
      >
        <ShoppingBag size={18} /> Order Now
      </button>

      {/* INTERACTIVE MODAL */}
      <div className={`modal-backdrop${modalOpen ? ' open' : ''}`} id="orderModal">
        <div className="modal-container">
          <button className="modal-close" onClick={closeModal}><X size={16} /></button>

          {/* STEP 1: CONFIGURATOR */}
          {step === 1 && (
            <div className="modal-step-1" id="configuratorStep" style={{ display: 'block' }}>
              <h3 className="modal-title">Assemble Payload</h3>
              <p className="modal-subtitle">Calibrate drone baking matrices and chutney configurations.</p>

              <form id="dosaConfigForm" onSubmit={initiateFlight}>
                {/* Dosa Profile */}
                <div className="form-group">
                  <label className="form-label">Dosa Profile</label>
                  <div className="option-grid">
                    {[
                      { type: 'classic', price: 110, label: 'Classic Masala', Icon: Sparkles },
                      { type: 'cheese', price: 140, label: 'Cheese Chili', Icon: Layers },
                      { type: 'podi', price: 130, label: 'Ghee Podi', Icon: Flame },
                    ].map(({ type, price, label, Icon }) => (
                      <div
                        key={type}
                        className={`option-card${selectedProfile.type === type ? ' selected' : ''}`}
                        onClick={() => selectProfile(type, price)}
                      >
                        <Icon size={24} />
                        <span className="option-card-title">{label}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crispiness Slider */}
                <div className="form-group">
                  <label className="form-label">
                    Crispiness Quotient: <span id="crispLabel" className="crisp-level-tag">{crispLabel}</span>
                  </label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={crispValue}
                      className="custom-slider"
                      id="crispSlider"
                      onChange={(e) => updateCrispLevel(e.target.value)}
                    />
                    <div className="slider-metrics">
                      <span>Soft (Lv. 1)</span>
                      <span>Glass-Shatter (Lv. 10)</span>
                    </div>
                  </div>
                </div>

                {/* Chutney Checkboxes */}
                <div className="form-group">
                  <label className="form-label">Chutney Compartments (Included)</label>
                  <div className="chutney-grid">
                    {['Coconut Chutney', 'Spicy Tomato', 'Ghee Sambar Pod'].map((name) => (
                      <div
                        key={name}
                        className={`chutney-item${chutneys.includes(name) ? ' selected' : ''}`}
                        onClick={() => toggleChutney(name)}
                      >
                        <div className="chutney-indicator"></div>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Target */}
                <div className="form-group">
                  <label className="form-label" htmlFor="deliveryTarget">LIDAR Coordinate Target</label>
                  <select
                    id="deliveryTarget"
                    className="newsletter-input"
                    style={{ width: '100%', borderRadius: '12px', marginTop: '0.2rem' }}
                    value={deliveryTarget}
                    onChange={(e) => setDeliveryTarget(e.target.value)}
                    required
                  >
                    <option value="HSR">HSR Layout (Sector 3, Balcony Pod B)</option>
                    <option value="Indiranagar">Indiranagar (100ft Rd, Terrace Target A)</option>
                    <option value="Koramangala">Koramangala (5th Block, Window Sill C)</option>
                    <option value="Whitefield">Whitefield (EPIP Zone, Tech Balcony 12)</option>
                  </select>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <div className="total-price">
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Payload Total</span>
                    ₹<span id="priceText">{totalPrice}</span> <span>(Inc. GST)</span>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <Rocket size={16} /> Launch Flight Pod
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: TELEMETRY RADAR */}
          {step === 2 && (
            <div className="modal-step-2" id="telemetryStep" style={{ display: 'block' }}>
              <h3 className="modal-title">Live Delivery Telemetry</h3>
              <p className="modal-subtitle">Tracking Drone Pod flight vector &amp; crispness-baking profile.</p>

              {/* Radar Map */}
              <div className="radar-map-wrapper">
                <div className="radar-grid"></div>
                <div className="radar-ring rr-1"></div>
                <div className="radar-ring rr-2"></div>
                <div className="radar-ring rr-3"></div>
                <div className="radar-sweep-simulation"></div>

                <svg className="flight-path-svg">
                  <path ref={flightPathRef} id="radarFlightPath" d="" className="flight-path-draw" />
                </svg>

                <div className="beacon beacon-src" style={{ top: '80%', left: '20%' }}>
                  <span className="beacon-label">HQ-HSR</span>
                </div>
                <div className="beacon beacon-dest" style={{ top: '25%', left: '75%' }}>
                  <span className="beacon-label" id="destLabel">{destLabel}</span>
                </div>

                <div className="drone-sim-icon" ref={simDroneRef} id="simDrone">
                  <Navigation size={18} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-bar-container">
                <div className="progress-bar-fill" ref={progressBarRef} id="simProgress"></div>
              </div>

              {/* Telemetry indicators */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                <div>ALTITUDE: <span id="simAlt" style={{ color: 'var(--secondary)' }}>{simAlt}</span></div>
                <div>POD TEMP: <span id="simTemp" style={{ color: 'var(--primary)' }}>{simTemp}</span></div>
                <div>ETA: <span id="simEta" style={{ color: 'var(--accent-green)' }}>{simEta}</span></div>
              </div>

              {/* Console log */}
              <div className="console-log" ref={consoleLogRef} id="consoleLog">
                {consoleLines.map((line, i) => (
                  <div key={i} className="console-line">
                    <span className="console-time">[{line.timeStr}]</span>
                    <span className={line.type === 'success' ? 'console-success' : ''}>{line.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right' }}>
                {showReturn && (
                  <button className="btn btn-secondary" onClick={resetConfigurator} id="btnReturn">
                    Return to Launchpad
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
