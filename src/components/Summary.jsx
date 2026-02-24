import { BRAND } from '../constants/theme';
import { LEVELS } from '../constants/defaultSections';

function ScoreBar({ value, max = 3 }) {
    const pct = Math.round((value / max) * 100);
    const color = value >= 2.6 ? BRAND.red : value >= 2.0 ? BRAND.coral : value >= 1.5 ? "#f59e0b" : "#d1d5db";
    return (
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", width: "100%", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.5s ease", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }} />
        </div>
    );
}

export default function Summary({
    sections,
    ratings,
    overallAvg,
    sectionAvg,
    readiness,
    getLevelLabel,
    employeeName,
    jobTitle,
    evaluatorName,
    completedDate,
    totalItems,
    setScreen,
    setActiveSectionId,
    handleEmailSummary
}) {
    const S = {
        summaryCard: {
            background: BRAND.white,
            borderRadius: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            padding: 24,
            marginBottom: 14,
            breakInside: "avoid" // Crucial for print layout
        },
        btn: (primary) => ({
            padding: "10px 20px", borderRadius: 6, border: "none",
            background: primary ? BRAND.red : "#e5e7eb",
            color: primary ? BRAND.white : "#6b7280",
            fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", fontWeight: "bold",
        }),
    };

    const avgScore = overallAvg();

    return (
        <>
            <div className="print-only" style={{ marginBottom: 12, fontSize: 12, fontFamily: "sans-serif", color: BRAND.muted }}>
                Completed: {completedDate} · Evaluator: {evaluatorName || "Not specified"}
            </div>

            <div style={S.summaryCard}>
                <div style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 10 }}>
                    Overall Readiness Assessment
                </div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
                    borderRadius: 30, background: readiness.bg, color: readiness.color,
                    fontWeight: "bold", fontSize: 18, marginBottom: 14,
                    printColorAdjust: "exact", WebkitPrintColorAdjust: "exact"
                }}>
                    <span>{readiness.icon}</span><span>{readiness.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 14, opacity: 0.8 }}>
                        ({avgScore.toFixed(2)} / 3.00)
                    </span>
                </div>
                <ScoreBar value={avgScore} />
                <div style={{ marginTop: 12, fontSize: 12, color: BRAND.muted, fontFamily: "sans-serif" }}>
                    <strong>Employee:</strong> {employeeName || "N/A"} &nbsp;·&nbsp;
                    <strong>Role:</strong> {jobTitle || "N/A"}
                    {evaluatorName && <> &nbsp;·&nbsp; <strong>Evaluator:</strong> {evaluatorName}</>}
                </div>
            </div>

            <div style={S.summaryCard}>
                <div style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>
                    Section Scores
                </div>
                {sections.map((s, idx) => {
                    const avg = sectionAvg(s);
                    return (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ fontSize: 12, fontFamily: "sans-serif", color: "#6b7280", width: 220, flexShrink: 0 }}>
                                {idx + 1}. {s.title}
                            </div>
                            <div style={{ flex: 1 }}><ScoreBar value={avg} /></div>
                            <div style={{ fontFamily: "monospace", fontSize: 12, color: avg >= 2.6 ? BRAND.red : avg >= 2.0 ? BRAND.coral : "#9ca3af", width: 36, textAlign: "right" }}>
                                {avg > 0 ? avg.toFixed(2) : "—"}
                            </div>
                            <div style={{ fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", color: avg >= 2.6 ? BRAND.red : avg >= 2.0 ? BRAND.coral : "#9ca3af", width: 80, textAlign: "right", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {avg > 0 ? getLevelLabel(avg) : "—"}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={S.summaryCard}>
                <div style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>
                    Rating Distribution
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                    {Object.entries(LEVELS).reverse().map(([k, v]) => {
                        const count = Object.values(ratings).filter(r => r === k).length;
                        const pct = totalItems > 0 ? Math.round((count / totalItems) * 100) : 0;
                        return (
                            <div key={k} style={{
                                flex: 1, textAlign: "center", padding: 16,
                                background: v.bg, borderRadius: 8, border: `1px solid ${v.color}33`,
                                printColorAdjust: "exact", WebkitPrintColorAdjust: "exact"
                            }}>
                                <div style={{ fontSize: 28, fontWeight: "bold", color: v.accent, fontFamily: "monospace" }}>{count}</div>
                                <div style={{ fontSize: 10, color: v.accent, fontFamily: "sans-serif", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{v.label}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{pct}%</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={S.summaryCard}>
                <div style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 14 }}>
                    Promotion Thresholds
                </div>
                {[
                    { label: "Strong Promotion Candidate", range: "2.6 – 3.0", desc: "Master-level across most competencies. Independently driving analytics and influencing cross-functional teams.", c: BRAND.red, bg: BRAND.lightRed, min: 2.6, max: 3.01 },
                    { label: "Promotion Ready", range: "2.0 – 2.5", desc: "Solid Intermediate-to-Master performance with minimal guidance needed.", c: "#1d6c3a", bg: "#dcfce7", min: 2.0, max: 2.6 },
                    { label: "Developing", range: "1.5 – 1.9", desc: "Progress evident but targeted development plan recommended before re-evaluation.", c: "#92400e", bg: "#fef3c7", min: 1.5, max: 2.0 },
                    { label: "Not Yet Ready", range: "< 1.5", desc: "Significant gaps remain. Structured development and mentoring required.", c: "#7f1d1d", bg: "#fee2e2", min: 0, max: 1.5 },
                ].map((t, idx) => {
                    const active = avgScore > 0 && avgScore >= t.min && avgScore < t.max;
                    return (
                        <div key={idx} style={{
                            display: "flex", gap: 14, padding: "11px 15px", borderRadius: 8,
                            background: active ? t.bg : "#f9fafb", marginBottom: 8,
                            border: `2px solid ${active ? t.c + "55" : "transparent"}`,
                            printColorAdjust: "exact", WebkitPrintColorAdjust: "exact"
                        }}>
                            <div style={{ fontFamily: "monospace", fontSize: 12, color: t.c, fontWeight: "bold", minWidth: 68 }}>{t.range}</div>
                            <div>
                                <div style={{ fontWeight: "bold", fontSize: 13, color: t.c, fontFamily: "sans-serif" }}>{t.label}</div>
                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{t.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
                <button style={S.btn(false)} onClick={() => { setActiveSectionId(sections[0]?.id); setScreen("eval"); }}>
                    ← Back to Evaluation
                </button>
                <div style={{ flex: 1 }} />
                <button style={{ ...S.btn(false), display: "flex", alignItems: "center", gap: 6 }} onClick={handleEmailSummary}>
                    ✉ Email Summary
                </button>
                <button style={{ ...S.btn(true), background: BRAND.black, display: "flex", alignItems: "center", gap: 6 }} onClick={() => window.print()}>
                    ⎙ Print Summary
                </button>
            </div>
        </>
    );
}
