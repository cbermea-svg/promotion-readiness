import { useState } from 'react';
import { BRAND, LOGO_URI } from '../constants/theme';

export default function CoverPage({ onStart, onSettings }) {
    const [empName, setEmpName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [error, setError] = useState(false);

    const handleStart = () => {
        if (!empName.trim() || !jobTitle.trim()) { setError(true); return; }
        onStart(empName.trim(), jobTitle.trim());
    };

    const inp = (hasError) => ({
        width: "100%", padding: "14px 18px",
        border: `2px solid ${hasError ? BRAND.red : BRAND.border}`,
        borderRadius: 8, fontSize: 15, fontFamily: "'Georgia', serif",
        background: BRAND.white, color: BRAND.black, outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s",
    });

    return (
        <div style={{ minHeight: "100vh", background: BRAND.black, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 5, background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.coral})` }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
                <div style={{ marginBottom: 48, textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <img src={LOGO_URI} alt="Soarion Credit Union" style={{ height: 48, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
                    </div>
                </div>

                <div style={{ background: BRAND.white, borderRadius: 16, padding: "52px 56px", maxWidth: 540, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
                    <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.coral, fontWeight: "bold" }}>
                            Promotion Readiness
                        </span>
                    </div>
                    <h1 style={{ margin: "0 0 8px", fontSize: 30, fontFamily: "'Georgia', serif", color: BRAND.black, lineHeight: 1.2 }}>
                        Evaluation Tool
                    </h1>
                    <p style={{ margin: "0 0 36px", color: BRAND.muted, fontSize: 15, fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
                        A structured scoring model to assess readiness across core competency areas.
                    </p>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", color: BRAND.black, fontWeight: "bold", marginBottom: 8 }}>Employee Name</label>
                        <input style={inp(error && !empName.trim())} placeholder="Full name" value={empName}
                            onChange={(e) => { setEmpName(e.target.value); setError(false); }}
                            onKeyDown={(e) => e.key === "Enter" && handleStart()} />
                    </div>
                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", color: BRAND.black, fontWeight: "bold", marginBottom: 8 }}>Role Being Evaluated For</label>
                        <input style={inp(error && !jobTitle.trim())} placeholder="e.g., Data & Insights Specialist" value={jobTitle}
                            onChange={(e) => { setJobTitle(e.target.value); setError(false); }}
                            onKeyDown={(e) => e.key === "Enter" && handleStart()} />
                    </div>

                    {error && (
                        <div style={{ marginBottom: 16, padding: "10px 14px", background: BRAND.lightRed, border: `1px solid ${BRAND.red}`, borderRadius: 6, color: BRAND.red, fontSize: 13, fontFamily: "sans-serif" }}>
                            Please fill in both fields to continue.
                        </div>
                    )}

                    <button onClick={handleStart} style={{ width: "100%", padding: 16, border: "none", borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.coral})`, color: BRAND.white, fontSize: 16, fontWeight: "bold", fontFamily: "sans-serif", letterSpacing: "0.04em", cursor: "pointer", boxShadow: `0 4px 20px ${BRAND.red}44`, marginBottom: 12 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                        Get Started →
                    </button>

                    <button onClick={onSettings} style={{ width: "100%", padding: "11px 16px", border: `1.5px solid ${BRAND.border}`, borderRadius: 8, background: "transparent", color: BRAND.muted, fontSize: 13, fontFamily: "sans-serif", cursor: "pointer", letterSpacing: "0.03em" }}>
                        ⚙ Customize Sections & Questions
                    </button>

                    <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#9ca3af", fontFamily: "sans-serif" }}>
                        Sections and questions can be customized in Settings
                    </p>
                </div>
            </div>
            <div style={{ textAlign: "center", padding: 20, color: "#4b5563", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em" }}>
                SOARION FEDERAL CREDIT UNION · CONFIDENTIAL
            </div>
        </div>
    );
}
