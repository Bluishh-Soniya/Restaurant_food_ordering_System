import React, { useState, useEffect } from "react";
import { fetchTables } from "../services/api";
import { Utensils, Package, CheckCircle, Edit2, Sparkles, ArrowRight } from "lucide-react";

const Swirls = () => (
  <>
    <svg
      style={{ position: 'absolute', top: '-15%', left: '-5%', transform: 'scale(1.2)', color: '#fdba74', opacity: 0.15, filter: 'blur(1px)', pointerEvents: 'none' }}
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
    <svg
      style={{ position: 'absolute', bottom: '-20%', right: '-10%', transform: 'scale(1.5)', color: '#ea580c', opacity: 0.08, filter: 'blur(2px)', pointerEvents: 'none' }}
      width="700"
      height="700"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  </>
);

const heroImages = [
  {
    src: 'https://b.zmtcdn.com/data/o2_assets/110a09a9d81f0e5305041c1b507d0f391743058910.png',
    alt: 'A delicious cheeseburger',
    className: 'hero-img-1',
    anim: 'float1'
  },
  {
    src: 'https://b.zmtcdn.com/data/o2_assets/316495f4ba2a9c9d9aa97fed9fe61cf71743059024.png',
    alt: 'A slice of pizza',
    className: 'hero-img-2',
    anim: 'float3'
  },
  {
    src: 'https://b.zmtcdn.com/data/o2_assets/b4f62434088b0ddfa9b370991f58ca601743060218.png',
    alt: 'A bamboo steamer with dumplings',
    className: 'hero-img-3',
    anim: 'float2'
  },
  {
    src: 'https://b.zmtcdn.com/data/o2_assets/70b50e1a48a82437bfa2bed925b862701742892555.png',
    alt: 'A basil leaf',
    className: 'hero-img-4',
    anim: 'float2'
  },
  {
    src: 'https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png',
    alt: 'A slice of tomato',
    className: 'hero-img-5',
    anim: 'float1'
  }
];

const Banner = ({ data }) => {
  const [step, setStep] = useState(localStorage.getItem("orderType") ? "set" : "choose");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [orderType, setOrderType] = useState(localStorage.getItem("orderType") || "");
  const [tableNumber, setTableNumber] = useState(localStorage.getItem("tableNumber") || "");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableFromUrl = params.get("table");
    
    if (tableFromUrl) {
      localStorage.setItem("orderType", "dine-in");
      localStorage.setItem("tableNumber", tableFromUrl);
      setOrderType("dine-in");
      setTableNumber(tableFromUrl);
      setStep("set");
      window.dispatchEvent(new Event("storage"));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleParcel = () => {
    localStorage.setItem("orderType", "parcel");
    localStorage.removeItem("tableNumber");
    setOrderType("parcel");
    setTableNumber("");
    setStep("set");
    window.dispatchEvent(new Event("storage"));
  };

  const handleDineIn = () => {
    setStep("table");
    fetchTables().then((res) => setTables(res.data)).catch(() => {});
  };

  const handleTableSelect = () => {
    if (!selectedTable) return;
    localStorage.setItem("orderType", "dine-in");
    localStorage.setItem("tableNumber", selectedTable);
    setOrderType("dine-in");
    setTableNumber(selectedTable);
    setStep("set");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <section style={{ 
      position: 'relative', width: '100%', minHeight: '80vh', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      overflow: 'hidden', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #fff7ed 50%, #ffedd5 100%)',
      padding: '100px 20px',
    }}>
      
      {/* Background Swirls */}
      <Swirls />
      
      {/* Floating food images */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`hero-image ${image.className}`}
            style={{ 
              animation: `${image.anim} ${3 + (index % 2)}s ease-in-out infinite alternate`,
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Main Two-Column Container */}
      <div className="hero-container">
        
        {/* Left Column: Text */}
        <div className="hero-text-content" style={{ animation: 'slideRightFade 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(234, 88, 12, 0.1)', padding: '6px 16px', borderRadius: '30px', 
            color: '#ea580c', fontWeight: '700', fontSize: '13px', marginBottom: '20px', 
            letterSpacing: '1px', border: '1px solid rgba(234, 88, 12, 0.2)' 
          }}>
            <Sparkles size={14} /> PREMIUM DINING EXPERIENCE
          </div>
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', fontWeight: 900, 
            letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '20px',
            lineHeight: 1.05
          }}>
            Fast. Fresh.<br />
            <span className="gradient-text">Yours.</span>
          </h1>
          <p style={{ 
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)', color: '#475569', 
            maxWidth: '32rem', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px'
          }}>
            Skip the wait. Scan the table or grab a parcel to go. Discover incredible tastes tailored precisely for your hunger.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Menu <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Card */}
        <div className="hero-card-container" style={{ animation: 'slideLeftFade 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="glass-card" style={{ 
            padding: "40px", borderRadius: "28px", width: "100%", maxWidth: "420px",
            position: "relative", zIndex: 20
          }}>
            
            {step === "set" ? (
              <div style={{ textAlign: "center", animation: "scaleIn 0.3s ease-out" }}>
                <div style={{ 
                  width: '64px', height: '64px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  margin: '0 auto 20px', color: 'white', boxShadow: '0 12px 24px rgba(34, 197, 94, 0.3)' 
                }}>
                  <CheckCircle size={32} />
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#0f172a" }}>
                  Ready to Order
                </h2>
                <p style={{ color: '#64748b', marginBottom: '28px', fontWeight: '500' }}>Your preference is set!</p>
                
                <div style={{ 
                  display: "inline-flex", alignItems: "center", gap: "12px", 
                  background: orderType === "parcel" ? "linear-gradient(to right, #f0fdf4, #dcfce7)" : "linear-gradient(to right, #fff7ed, #ffedd5)", 
                  border: orderType === "parcel" ? "1px solid #86efac" : "1px solid #fdba74",
                  color: orderType === "parcel" ? "#166534" : "#c2410c",
                  padding: "16px 28px", borderRadius: "16px", fontWeight: "700", 
                  fontSize: "16px", marginBottom: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                }}>
                  {orderType === "parcel" ? (
                    <><Package size={22} /> Parcel / Takeaway</>
                  ) : (
                    <><Utensils size={22} /> Dine In (Table {tableNumber})</>
                  )}
                </div>
                <div>
                  <button onClick={() => setStep("choose")} className="btn-secondary">
                    <Edit2 size={16} /> Change Preference
                  </button>
                </div>
              </div>
            ) : step === "choose" ? (
              <div style={{ animation: "scaleIn 0.3s ease-out" }}>
                <h2 style={{ fontSize: "26px", fontWeight: "800", textAlign: "center", marginBottom: "8px", color: "#0f172a", letterSpacing: '-0.5px' }}>
                  Where will you eat?
                </h2>
                <p style={{ textAlign: "center", color: "#64748b", fontSize: "15px", marginBottom: "32px", fontWeight: '500' }}>
                  Select your preference to unlock the menu
                </p>

                <button onClick={handleDineIn} className="btn-option primary-option">
                  <Utensils size={22} /> Dine In Experience
                </button>

                <button onClick={handleParcel} className="btn-option secondary-option">
                  <Package size={22} /> Quick Parcel
                </button>
              </div>
            ) : (
              <div style={{ animation: "scaleIn 0.3s ease-out" }}>
                <div style={{ 
                  width: '56px', height: '56px', background: '#ffedd5', 
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  margin: '0 auto 20px', color: '#ea580c' 
                }}>
                  <Utensils size={28} />
                </div>
                <h2 style={{ fontSize: "26px", fontWeight: "800", textAlign: "center", marginBottom: "8px", color: "#0f172a", letterSpacing: '-0.5px' }}>
                  Select Your Table
                </h2>
                <p style={{ textAlign: "center", color: "#64748b", fontSize: "15px", marginBottom: "28px", fontWeight: '500' }}>
                  Let us know where to bring the food
                </p>

                <div style={{ position: 'relative', marginBottom: '24px' }}>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="table-select"
                  >
                    <option value="" disabled>Choose an available table...</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.table_number}>
                        Table {t.table_number}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
                    ▼
                  </div>
                </div>

                <button onClick={handleTableSelect} disabled={!selectedTable} className={`btn-option ${selectedTable ? 'primary-option' : 'disabled-option'}`}>
                  <CheckCircle size={22} /> Confirm Table
                </button>

                <button onClick={() => { setStep("choose"); setSelectedTable(""); }} className="btn-back">
                  ← Back to Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Embedded High-End CSS */}
      <style>{`
        /* Core Layout */
        .hero-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 40px;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 20;
        }
        .hero-text-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-card-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        @media (min-width: 992px) {
          .hero-container {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
            gap: 60px;
          }
          .hero-text-content {
            align-items: flex-start;
            flex: 1.1;
          }
          .hero-card-container {
            flex: 0.9;
            justify-content: flex-end;
          }
        }

        /* Image Positions */
        .hero-image {
          position: absolute;
          object-fit: contain;
          pointer-events: auto;
          filter: drop-shadow(0 20px 20px rgba(0,0,0,0.15));
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hero-image:hover {
          transform: scale(1.15) !important;
          z-index: 50;
        }
        
        .hero-img-1 { width: clamp(140px, 18vw, 220px); top: 5%; right: 10%; }
        .hero-img-2 { width: clamp(120px, 15vw, 180px); bottom: 10%; left: 8%; }
        .hero-img-3 { width: clamp(100px, 13vw, 160px); top: 15%; left: 5%; }
        .hero-img-4 { width: clamp(40px, 6vw, 60px); top: 25%; right: 40%; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); }
        .hero-img-5 { width: clamp(40px, 6vw, 60px); bottom: 20%; right: 25%; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); }

        @media (min-width: 992px) {
          .hero-img-1 { top: 0%; right: 35%; }
          .hero-img-2 { bottom: -5%; left: 45%; }
          .hero-img-3 { top: 10%; right: 5%; }
          .hero-img-4 { top: 15%; left: 45%; }
          .hero-img-5 { bottom: 10%; right: 10%; }
        }

        /* Aesthetics */
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 
            0 10px 30px -5px rgba(0, 0, 0, 0.05),
            0 20px 40px -10px rgba(234, 88, 12, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }
        .gradient-text {
          background: linear-gradient(135deg, #ff5722 0%, #ea580c 50%, #f97316 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: gradientText 4s ease infinite;
        }

        /* Buttons & Inputs */
        .btn-primary {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: white;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 16px rgba(234, 88, 12, 0.25);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px rgba(234, 88, 12, 0.35);
        }
        
        .btn-option {
          width: 100%;
          padding: 16px;
          margin-bottom: 14px;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s ease;
          border: none;
        }
        .primary-option {
          background: linear-gradient(135deg, #ea580c, #c2410c);
          color: white;
          box-shadow: 0 10px 20px rgba(234, 88, 12, 0.2);
        }
        .primary-option:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(234, 88, 12, 0.3); }
        
        .secondary-option {
          background: white;
          color: #0f172a;
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .secondary-option:hover { transform: translateY(-2px); border-color: #cbd5e1; box-shadow: 0 8px 16px rgba(0,0,0,0.06); }
        
        .disabled-option {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          border: 2px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 14px;
          color: #334155;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }

        .btn-back {
          width: 100%; padding: 14px; background: transparent; color: #64748b; border: none; 
          cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s; border-radius: 12px;
        }
        .btn-back:hover { color: #0f172a; background: rgba(0,0,0,0.03); }

        .table-select {
          width: 100%; padding: 18px 20px; border-radius: 16px; border: 2px solid #e2e8f0;
          font-size: 16px; font-weight: 600; outline: none; background: white;
          color: #0f172a; transition: all 0.2s; appearance: none; cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .table-select:focus { border-color: #ea580c; box-shadow: 0 0 0 4px rgba(234,88,12,0.1); }

        /* Animations */
        @keyframes gradientText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-3deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }
        @keyframes slideRightFade {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideLeftFade {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default Banner;