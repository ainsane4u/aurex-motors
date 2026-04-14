const { useState, useEffect, useRef } = React;
const { motion, useScroll, useSpring, useTransform } = window.Motion;

const TOTAL_FRAMES = 150;
const imagePaths = Array.from({ length: TOTAL_FRAMES }, (_, i) => 
  `./sequence/frame_${i}.webp`
);

const SERVICES_DATA = [
  { id: "01", category: "ADVANCED CONFIGURATION", desc: "// [Hyper-personalize your dynamic chassis setup.]", img: "./sequence/frame_25.webp" },
  { id: "02", category: "DIGITAL DIAGNOSTICS", desc: "// [Remote OTA scanning with zero latency.]", img: "./sequence/frame_50.webp" },
  { id: "03", category: "VELOCITY INTEGRATION", desc: "// [Optimized battery core alignment for 2,000HP output.]", img: "./sequence/frame_75.webp" },
  { id: "04", category: "AERO-MORPHIC TUNING", desc: "// [Adjust active surface response curves.]", img: "./sequence/frame_100.webp" },
  { id: "05", category: "VOID RESERVATION", desc: "// [Secure your exclusive build slot.]", img: "./sequence/frame_125.webp" }
];



function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const chromeSectionRef = useRef(null);
  
  const [images, setImages] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [chromeMousePos, setChromeMousePos] = useState({ x: 0, y: 0 });
  
  const [hoveredField, setHoveredField] = useState(null);
  const [hexCode, setHexCode] = useState("0x000000");

  useEffect(() => {
    const interval = setInterval(() => {
      setHexCode("0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0'));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const handleChromeMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setChromeMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Preload images and track completion for loader phase
  useEffect(() => {
    let count = 0;
    const loadedImages = [];
    imagePaths.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        if (count === TOTAL_FRAMES) setImagesLoaded(true);
      };
      loadedImages.push(img);
    });
    setImages(loadedImages);
  }, []);

  // Initialize Lenis Smooth Scroll Overlay
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
      smoothTouch: true,
      touchMultiplier: 2
    });
    
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    return () => lenis.destroy();
  }, []);

  // Framer Motion useScroll tied to the main scroll container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Spring physics physics configured as per user specs for dynamic inertia
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
    mass: 0.5,
    restDelta: 0.001
  });
  
  // Transform mapping smoothly across the 150 frames tied to smoothProgress to prevent snapping
  const frameIndexTransform = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Canvas Render Loop reacting to spring changes
  useEffect(() => {
    const renderFrame = (latestRawFrame) => {
      if (images.length === 0) return;
      
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(latestRawFrame))
      );
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Memoize scaling rendering to an offscreen layer to drastically reduce micro-stutters
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement("canvas");
      }
      const offscreen = offscreenCanvasRef.current;
      const offCtx = offscreen.getContext("2d", { alpha: false });
      
      const img = images[Math.max(0, Math.min(frameIndex, TOTAL_FRAMES - 1))];
      
      if (img && img.complete && img.naturalWidth > 0) {
        if (offscreen.width !== window.innerWidth || offscreen.height !== window.innerHeight) {
          offscreen.width = window.innerWidth;
          offscreen.height = window.innerHeight;
        }
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
        
        offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
        
        let scale = Math.max(offscreen.width / img.naturalWidth, offscreen.height / img.naturalHeight);
        
        // Mobile zoom-out to fit full car width
        if (window.innerWidth <= 768) {
          scale *= 0.8;
        }
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        
        const x = (offscreen.width - scaledWidth) / 2;
        const y = ((offscreen.height - scaledHeight) / 2) - (offscreen.height * 0.1);

        offCtx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Push compiled buffer to visible layer effortlessly
        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.drawImage(offscreen, 0, 0);
      }
    };
    
    // Ensure render triggered by smooth frame mapping
    const unsubscribe = frameIndexTransform.on("change", renderFrame);
    
    // Bind resize to re-render using current progress value
    const handleResize = () => {
      renderFrame(frameIndexTransform.get());
    };
    window.addEventListener("resize", handleResize);
    
    // Initial Render
    if (images[0]) {
      if (images[0].complete) {
        renderFrame(0);
      } else {
        images[0].onload = () => renderFrame(0);
      }
    }

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [frameIndexTransform, images]);

  // Storyboard Transform Bindings featuring subtle Y translation Parallax
  
  // 1. Beat A: 0% to 20%: Start: Center 'AUREX MOTORS'
  const titleOpacity = useTransform(smoothProgress, [0, 0.15, 0.2], [0.9, 0.9, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.2], [0, -150]);

  // 2. Beat B: 25% to 45%: Fade in text left "BEYOND AERODYNAMICS"
  const text1Opacity = useTransform(smoothProgress, [0.25, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
  const text1Y = useTransform(smoothProgress, [0.25, 0.45], [100, -100]);

  // 3. Beat C: 55% to 75%: Fade in text right "SOLID STATE CORE"
  const text2Opacity = useTransform(smoothProgress, [0.55, 0.6, 0.7, 0.75], [0, 1, 1, 0]);
  const text2Y = useTransform(smoothProgress, [0.55, 0.75], [100, -100]);

  // 4. Beat D: 85% to 100%: End: PRE-ORDER button with crimson glow border
  const endOpacity = useTransform(smoothProgress, [0.85, 0.925, 1], [0, 1, 1]);
  const endY = useTransform(smoothProgress, [0.85, 1], [100, 0]);
  const pointerEventsTransform = useTransform(smoothProgress, v => v > 0.85 ? 'auto' : 'none');

  const { scrollYProgress: chromeScrollY } = useScroll({
    target: chromeSectionRef,
    offset: ["start end", "end start"]
  });
  const chromeY = useTransform(chromeScrollY, [0, 1], [150, -150]);
  const chromeScale = useTransform(chromeScrollY, [0, 0.5, 1], [0.8, 1, 1.05]);

  return (
    <>
      {/* Absolute Initializer Preload Screen */}
      {!imagesLoaded && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#050505', color: 'rgba(255, 255, 255, 0.5)', zIndex: 9999, fontFamily: 'Noto Sans JP', letterSpacing: '0.3em', fontSize: '0.8rem' }}>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                SYSTEM INITIALIZING...
            </motion.div>
        </div>
      )}

      {/* Main Orchestration Fade Box tied to loaded state */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: imagesLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeIn" }}
      >
        <div ref={containerRef} className="scroll-container">
        <div className="ambient-glow" />
        <div className="sticky-wrapper">
        
          {/* HTML5 Rendering Engine */}
          <div className="canvas-container">
            <canvas ref={canvasRef} className="render-canvas"></canvas>
          </div>

          {/* Floating Storyboard UI Layer */}
          <div className="ui-layer">
            
            <motion.div 
              className="panel center"
              style={{ opacity: titleOpacity, y: titleY }}
            >
              <h1 className="title">AUREX MOTORS</h1>
            </motion.div>

            <motion.div 
              className="panel left"
              style={{ opacity: text1Opacity, y: text1Y }}
            >
              <div>
                   <h2 className="heading">BEYOND AERODYNAMICS</h2>
                   <p className="subtext">Active surfaces that defy gravity.</p>
              </div>
            </motion.div>

            <motion.div 
              className="panel right"
              style={{ opacity: text2Opacity, y: text2Y }}
            >
              <div>
                   <h2 className="heading">SOLID STATE CORE</h2>
                   <p className="subtext">2000HP of pure silent energy.</p>
              </div>
            </motion.div>

            <motion.div 
              className="panel center bottom-end"
              style={{ opacity: endOpacity, y: endY }}
            >
              <motion.div style={{ pointerEvents: pointerEventsTransform }}>
                  <button className="preorder-btn" onClick={() => alert("Pre-order Initiated")}>PRE-ORDER</button>
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </div>

      {/* 1. THE SPECIFICATIONS GRID */}
      <motion.section 
        className="specs-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h3 className="section-title">TECHNICAL DATA // 01</h3>
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">01 / POWER</span>
            <span className="spec-value">2,000 HP</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">02 / TORQUE</span>
            <span className="spec-value">1,700 NM</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">03 / 0-100</span>
            <span className="spec-value">1.85s</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">04 / RANGE</span>
            <span className="spec-value">650 KM</span>
          </div>
        </div>
      </motion.section>

      {/* 2. THE MANIFESTO SECTION */}
      <motion.section 
        className="manifesto-section"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <blockquote className="manifesto-quote">
          BORN IN THE VOID. ENGINEERED FOR THE ETERNITY.
        </blockquote>
      </motion.section>

      {/* 2.5 THE SERVICES SECTION */}
      <motion.section 
        className="services-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h3 className="section-title">SERVICES // CORE</h3>
        <div className="services-list">
          {SERVICES_DATA.map((s) => (
            <motion.div 
              key={s.id} 
              className="service-row"
              initial="rest"
              whileHover="hover"
              whileTap="hover"
              animate="rest"
            >
              <motion.div 
                className="service-bg-layer"
                variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="service-glow" />
                <img src={s.img} alt={s.category} />
              </motion.div>
              <div className="service-content">
                <span className="service-id">{s.id}</span>
                <span className="service-category">{s.category}</span>
                <span className="service-desc">{s.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 2.6 LIQUID CHROME SECTION */}
      <section 
        className="liquid-chrome-section"
        ref={chromeSectionRef}
        onMouseMove={handleChromeMouseMove}
      >
        <motion.div
           className="chrome-mouse-glow"
           animate={{
             x: chromeMousePos.x - 300,
             y: chromeMousePos.y - 300
           }}
           transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        />
        <motion.div 
          className="chrome-text-container"
          style={{ y: chromeY, scale: chromeScale }}
        >
          <h2 className="chrome-text" data-text="AUREX">AUREX</h2>
        </motion.div>
      </section>

      {/* TECHNICAL BLUEPRINT CONTACT SECTION */}
      <motion.section 
        className="blueprint-contact-section"
        initial={{ opacity: 0, backgroundPositionY: '-100%' }}
        whileInView={{ opacity: 1, backgroundPositionY: '0%' }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.5, ease: "circOut" }}
      >
        <div className="blueprint-container">
            {/* Background SVG Wireframe */}
            <svg viewBox="0 0 800 600" className="blueprint-svg">
               {/* Outline elements of the car */}
               <path className="car-wireframe body" d="M360,180 C360,140 440,140 440,180 L450,250 L460,350 L450,450 C440,480 360,480 350,450 L340,350 L350,250 Z" />
               <path className="car-wireframe cockpit" d="M370,240 C370,220 430,220 430,240 L440,320 L360,320 Z" />
               <path className="car-wireframe engine" d="M370,380 L430,380 L440,420 L360,420 Z" />
               <path className="car-wireframe wheels" d="M340,180 L350,230 M460,180 L450,230 M330,360 L340,440 M470,360 L460,440" />

               {/* Lead Lines */}
               <line className={`lead-line ${hoveredField === 'name' ? 'active' : ''}`} x1="380" y1="260" x2="160" y2="100" />
               <line className={`lead-line ${hoveredField === 'email' ? 'active' : ''}`} x1="380" y1="400" x2="160" y2="500" />
               <line className={`lead-line ${hoveredField === 'message' ? 'active' : ''}`} x1="420" y1="180" x2="640" y2="150" />
            </svg>

            {/* Floating Input Fields */}
            <div 
               className="blueprint-field name-field"
               onMouseEnter={() => setHoveredField('name')}
               onMouseLeave={() => setHoveredField(null)}
            >
               <span className="field-label">NAME // DATA-INPUT</span>
               <input type="text" className="crosshair-input" placeholder="ENTER IDENTIFIER" />
            </div>

            <div 
               className="blueprint-field email-field"
               onMouseEnter={() => setHoveredField('email')}
               onMouseLeave={() => setHoveredField(null)}
            >
               <span className="field-label">COMMS // DATA-INPUT</span>
               <input type="email" className="crosshair-input" placeholder="WINTERMUTE@AUREX.COM" />
            </div>

            <div 
               className="blueprint-field message-field"
               onMouseEnter={() => setHoveredField('message')}
               onMouseLeave={() => setHoveredField(null)}
            >
               <span className="field-label">SECURE COMM //</span>
               <textarea className="crosshair-input" placeholder="TRANSMIT SECURE DATA PACKET..." rows="4"></textarea>
            </div>

            {/* Action Area */}
            <div className="blueprint-submit-area">
                <div className="submit-flicker-code">{hexCode}</div>
                <button className="initialize-btn">SYSTEM INITIALIZE</button>
            </div>
        </div>
      </motion.section>

      {/* 3. THE FOOTER */}
      <motion.footer 
        className="blueprint-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="footer-bg-grid"></div>
        <div className="footer-content">
          <div className="footer-left">AUREX MOTORS</div>
          <div className="footer-center">
            <a href="https://jeromemichael.in/" target="_blank" rel="noopener noreferrer">TECH</a>
            <a href="https://jeromemichael.in/" target="_blank" rel="noopener noreferrer">LEGACY</a>
            <a href="https://jeromemichael.in/" target="_blank" rel="noopener noreferrer">DESIGN</a>
          </div>
          <div className="footer-right">
            <div className="social-icons">
               <span className="icon-placeholder">IG</span>
               <span className="icon-placeholder">X</span>
               <span className="icon-placeholder">YT</span>
            </div>
            <span className="credit">MADE BY <a href="https://rifft.in/" target="_blank" rel="noopener noreferrer" className="credit-link">RIFFT</a></span>
          </div>
        </div>
      </motion.footer>
      </motion.div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
