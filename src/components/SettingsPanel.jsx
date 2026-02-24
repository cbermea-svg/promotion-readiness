import { useState, useRef } from 'react';
import { BRAND, LOGO_URI } from '../constants/theme';
import { DEFAULT_SECTIONS } from '../constants/defaultSections';

export default function SettingsPanel({ sections, onChange, onBack }) {
    const [expandedSection, setExpandedSection] = useState(null);
    const [editingTitle, setEditingTitle] = useState(null);
    const [titleDraft, setTitleDraft] = useState("");
    const [newQuestions, setNewQuestions] = useState({});
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [questionDraft, setQuestionDraft] = useState("");
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);

    const [showAIModal, setShowAIModal] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [pasteDraft, setPasteDraft] = useState("");
    const fileInputRef = useRef(null);

    const nextId = useRef(Math.max(...sections.map(s => s.id), 0) + 1);
    const totalItems = sections.reduce((a, s) => a + (s.items?.length || 0), 0);

    const flash = () => { setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1800); };

    const addSection = () => {
        const id = nextId.current++;
        onChange([...sections, { id, title: "New Section", items: ["New competency item"] }]);
        setExpandedSection(id);
        setEditingTitle(id);
        setTitleDraft("New Section");
    };

    const removeSection = (id) => {
        if (sections.length <= 1) return;
        onChange(sections.filter(s => s.id !== id));
        if (expandedSection === id) setExpandedSection(null);
    };

    const moveSectionUp = (idx) => {
        if (idx === 0) return;
        const next = [...sections];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        onChange(next);
    };

    const moveSectionDown = (idx) => {
        if (idx === sections.length - 1) return;
        const next = [...sections];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        onChange(next);
    };

    const saveTitle = (id) => {
        if (!titleDraft.trim()) return;
        onChange(sections.map(s => s.id === id ? { ...s, title: titleDraft.trim() } : s));
        setEditingTitle(null);
        flash();
    };

    const addQuestion = (sectionId) => {
        const text = (newQuestions[sectionId] || "").trim();
        if (!text) return;
        onChange(sections.map(s => s.id === sectionId ? { ...s, items: [...(s.items || []), text] } : s));
        setNewQuestions(p => ({ ...p, [sectionId]: "" }));
        flash();
    };

    const removeQuestion = (sectionId, itemIdx) => {
        onChange(sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter((_, i) => i !== itemIdx) } : s));
    };

    const saveQuestion = (sectionId, itemIdx) => {
        if (!questionDraft.trim()) return;
        onChange(sections.map(s => s.id === sectionId ? { ...s, items: s.items.map((it, i) => i === itemIdx ? questionDraft.trim() : it) } : s));
        setEditingQuestion(null);
        flash();
    };

    const moveQuestionUp = (sectionId, idx) => {
        if (idx === 0) return;
        onChange(sections.map(s => {
            if (s.id !== sectionId) return s;
            const items = [...s.items];
            [items[idx - 1], items[idx]] = [items[idx], items[idx - 1]];
            return { ...s, items };
        }));
    };

    const moveQuestionDown = (sectionId, idx) => {
        onChange(sections.map(s => {
            if (s.id !== sectionId) return s;
            if (idx >= s.items.length - 1) return s;
            const items = [...s.items];
            [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
            return { ...s, items };
        }));
    };

    const exportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sections, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "promotion_readiness_template.json");
        dlAnchorElem.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && Array.isArray(parsed[0].items)) {
                    const sanitized = parsed.map((sec, i) => ({
                        id: i + 1,
                        title: sec.title || `Section ${i + 1}`,
                        items: Array.isArray(sec.items) ? sec.items : []
                    }));
                    nextId.current = sanitized.length + 1;
                    onChange(sanitized);
                    flash();
                } else {
                    alert("Invalid template format. Must be an array of objects with 'title' and 'items' array.");
                }
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
        e.target.value = null; // reset input
    };

    const generatePrompt = () => {
        if (!jobDescription.trim()) return;

        const promptTemplate = `You are an expert HR and People Analytics specialist. I have a tool that assesses employee readiness for promotion based on specific competencies.

I need you to generate a JSON array of competency sections and questions tailored specifically for the following Job Description:

--- JOB DESCRIPTION START ---
${jobDescription}
--- JOB DESCRIPTION END ---

Requirements for the JSON output:
1. Return ONLY valid JSON, absolutely no markdown formatting like \`\`\`json, no introductory conversational text.
2. The root element must be an array of objects.
3. Each object represents a "Section" and MUST have exactly two keys:
   - "title": a string (e.g. "Technical Skills", "Leadership", etc.)
   - "items": an array of strings. Each string is a specific, actionable behavior or skill to assess (e.g. "Demonstrates expertise in Python data analysis").
4. Please generate between 4 and 6 sections.
5. Provide between 3 and 5 items per section.

Example format:
[
  {
    "title": "Data Governance & Quality",
    "items": [
      "Supports and helps lead data governance practices",
      "Identifies and resolves data quality issues proactively"
    ]
  }
]`;

        setGeneratedPrompt(promptTemplate);
    };

    const copyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert("Prompt copied to clipboard! Paste it into ChatGPT or Claude, then copy their JSON response and use the 'Paste JSON' button here to import it.");
    };

    const S = {
        page: { minHeight: "100vh", background: BRAND.offWhite, fontFamily: "'Georgia', serif" },
        topBar: { height: 4, background: `linear-gradient(90deg, ${BRAND.red}, ${BRAND.coral})` },
        header: { background: BRAND.black, padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
        body: { maxWidth: 860, margin: "0 auto", padding: "32px 24px" },
        sectionCard: { background: BRAND.white, borderRadius: 10, marginBottom: 12, border: `1px solid ${BRAND.border}`, overflow: "hidden" },
        sectionHeader: (expanded) => ({
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            background: expanded ? BRAND.black : BRAND.white,
            cursor: "pointer", userSelect: "none",
            borderBottom: expanded ? `2px solid ${BRAND.red}` : "none",
        }),
        sectionNum: (expanded) => ({
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: expanded ? BRAND.red : "#f3f4f6",
            color: expanded ? BRAND.white : BRAND.muted,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: "bold", fontFamily: "monospace",
        }),
        iconBtn: (color = BRAND.muted) => ({
            background: "none", border: "none", cursor: "pointer",
            color, padding: "4px 7px", borderRadius: 5, fontSize: 14,
            fontFamily: "sans-serif", display: "flex", alignItems: "center",
        }),
        primaryBtn: { padding: "9px 18px", borderRadius: 6, border: "none", background: BRAND.red, color: BRAND.white, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", cursor: "pointer" },
        ghostBtn: { padding: "9px 18px", borderRadius: 6, border: `1.5px solid ${BRAND.border}`, background: "transparent", color: BRAND.muted, fontSize: 13, fontFamily: "sans-serif", cursor: "pointer", fontWeight: "bold" },
        textArea: { width: "100%", padding: "10px 13px", border: `1.5px solid ${BRAND.border}`, borderRadius: 6, fontSize: 13, fontFamily: "'Georgia', serif", color: BRAND.black, resize: "vertical", minHeight: 60, boxSizing: "border-box", outline: "none" },
        questionRow: (idx) => ({
            display: "flex", gap: 10, alignItems: "flex-start",
            padding: "11px 18px", background: idx % 2 === 0 ? BRAND.white : "#fafaf9",
            borderBottom: `1px solid ${BRAND.border}`,
        }),
        modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
        modalContent: { background: BRAND.white, borderRadius: 12, padding: 32, width: "100%", maxWidth: 640, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }
    };

    return (
        <div style={S.page}>
            <div style={S.topBar} />
            <div style={S.header}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={LOGO_URI} alt="Soarion Credit Union" style={{ height: 32, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
                    <div>
                        <div style={{ color: BRAND.white, fontSize: 16, fontWeight: "bold" }}>Settings</div>
                        <div style={{ color: "#9ca3af", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.06em" }}>Customize Sections & Questions</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {saveFlash && <span style={{ color: "#4ade80", fontSize: 12, fontFamily: "sans-serif" }}>✓ Saved</span>}

                    <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ ...S.ghostBtn, borderColor: "#4b5563", color: "#d1d5db" }}>
                        Import File
                    </button>
                    <button onClick={() => setShowPasteModal(true)} style={{ ...S.ghostBtn, borderColor: "#4b5563", color: "#d1d5db" }}>
                        Paste JSON
                    </button>
                    <button onClick={exportJSON} style={{ ...S.ghostBtn, borderColor: "#4b5563", color: "#d1d5db" }}>
                        Export JSON
                    </button>

                    <button onClick={() => setShowResetConfirm(true)} style={{ ...S.ghostBtn, color: BRAND.red, borderColor: BRAND.red + "55", fontSize: 12 }}>
                        Reset to Default
                    </button>
                    <button onClick={onBack} style={{ ...S.primaryBtn, background: `linear-gradient(135deg, ${BRAND.red}, ${BRAND.coral})` }}>
                        ← Back to Home
                    </button>
                </div>
            </div>

            {showResetConfirm && (
                <div style={S.modalOverlay}>
                    <div style={{ background: BRAND.white, borderRadius: 12, padding: 32, maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
                        <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Reset to Default?</div>
                        <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                            This will restore all original sections and questions. Any customizations will be lost.
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button style={S.ghostBtn} onClick={() => setShowResetConfirm(false)}>Cancel</button>
                            <button style={{ ...S.primaryBtn, background: BRAND.red }} onClick={() => {
                                onChange(JSON.parse(JSON.stringify(DEFAULT_SECTIONS)));
                                setShowResetConfirm(false);
                                flash();
                            }}>Yes, Reset</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasteModal && (
                <div style={S.modalOverlay}>
                    <div style={S.modalContent}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{ fontSize: 20, margin: 0, color: BRAND.black }}>Paste JSON Data</h2>
                            <button onClick={() => { setShowPasteModal(false); setPasteDraft(""); }} style={S.iconBtn(BRAND.black)}>✕</button>
                        </div>
                        <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                            If you generated JSON using AI, paste the raw JSON text below to import it into your assessment tool.
                        </p>
                        <textarea
                            style={{ ...S.textArea, minHeight: 200, marginBottom: 16, backgroundColor: "#f3f4f6", fontFamily: "monospace", fontSize: 12 }}
                            placeholder={`[\n  {\n    "title": "Section Name",\n    "items": [\n      "Question 1"\n    ]\n  }\n]`}
                            value={pasteDraft}
                            onChange={e => setPasteDraft(e.target.value)}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button style={S.ghostBtn} onClick={() => { setShowPasteModal(false); setPasteDraft(""); }}>Cancel</button>
                            <button style={S.primaryBtn} onClick={() => {
                                try {
                                    const cleaned = pasteDraft.trim().replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
                                    const parsed = JSON.parse(cleaned);
                                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && Array.isArray(parsed[0].items)) {
                                        const sanitized = parsed.map((sec, i) => ({
                                            id: i + 1,
                                            title: sec.title || `Section ${i + 1}`,
                                            items: Array.isArray(sec.items) ? sec.items : []
                                        }));
                                        nextId.current = sanitized.length + 1;
                                        onChange(sanitized);
                                        setPasteDraft("");
                                        setShowPasteModal(false);
                                        flash();
                                    } else {
                                        alert("Invalid format. Must be a JSON array of objects with 'title' and 'items'.");
                                    }
                                } catch (e) {
                                    alert("Failed to parse JSON. Please ensure it is valid JSON code.");
                                }
                            }}>Import</button>
                        </div>
                    </div>
                </div>
            )}

            {showAIModal && (
                <div style={S.modalOverlay}>
                    <div style={S.modalContent}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <h2 style={{ fontSize: 20, margin: 0, color: BRAND.black }}>AI Question Generator</h2>
                            <button onClick={() => { setShowAIModal(false); setGeneratedPrompt(""); setJobDescription(""); }} style={S.iconBtn(BRAND.black)}>✕</button>
                        </div>

                        <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                            Paste the Job Description below. We will generate an optimized prompt that you can paste into ChatGPT, Claude, or Gemini to create an assessment template. You can then use the <b>Paste JSON</b> button to import their response directly.
                        </p>

                        <textarea
                            style={{ ...S.textArea, minHeight: 120, marginBottom: 16 }}
                            placeholder="Paste Job Description here..."
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                        />

                        {!generatedPrompt ? (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button style={S.primaryBtn} onClick={generatePrompt} disabled={!jobDescription.trim()}>
                                    Generate Prompt
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: 20 }}>
                                <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 8, color: BRAND.black }}>Your Prompt (Copy this):</div>
                                <textarea
                                    style={{ ...S.textArea, minHeight: 180, backgroundColor: "#f3f4f6", fontFamily: "monospace", fontSize: 12 }}
                                    readOnly
                                    value={generatedPrompt}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                                    <button style={S.primaryBtn} onClick={copyPrompt}>Copy to Clipboard</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={S.body}>
                <div style={{ display: "flex", gap: 20, marginBottom: 24, padding: "14px 20px", background: BRAND.white, borderRadius: 10, border: `1px solid ${BRAND.border}` }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: "bold", fontFamily: "monospace", color: BRAND.red }}>{sections.length}</div>
                        <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sections</div>
                    </div>
                    <div style={{ width: 1, background: BRAND.border }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: "bold", fontFamily: "monospace", color: BRAND.coral }}>{totalItems}</div>
                        <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Questions</div>
                    </div>
                    <div style={{ width: 1, background: BRAND.border }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: "bold", fontFamily: "monospace", color: BRAND.muted }}>{sections.length * 3}</div>
                        <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>Max Score</div>
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <button style={{ ...S.primaryBtn, background: BRAND.black, display: "flex", alignItems: "center", gap: 8 }}
                            onClick={() => setShowAIModal(true)}
                        >
                            ✨ Auto-Generate with AI
                        </button>
                    </div>
                </div>

                {sections.map((section, sIdx) => {
                    const expanded = expandedSection === section.id;
                    return (
                        <div key={section.id} style={S.sectionCard}>
                            <div style={S.sectionHeader(expanded)} onClick={() => setExpandedSection(expanded ? null : section.id)}>
                                <div style={S.sectionNum(expanded)}>{sIdx + 1}</div>

                                {editingTitle === section.id ? (
                                    <input
                                        autoFocus
                                        style={{ flex: 1, padding: "6px 10px", border: `2px solid ${BRAND.red}`, borderRadius: 6, fontSize: 14, fontFamily: "'Georgia', serif", color: BRAND.black, outline: "none" }}
                                        value={titleDraft}
                                        onChange={e => setTitleDraft(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") saveTitle(section.id); if (e.key === "Escape") setEditingTitle(null); }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                ) : (
                                    <div style={{ flex: 1, fontSize: 14, fontWeight: "bold", color: expanded ? BRAND.white : BRAND.black }}>
                                        {section.title}
                                        <span style={{ fontSize: 11, fontWeight: "normal", color: expanded ? "#9ca3af" : BRAND.muted, marginLeft: 10, fontFamily: "sans-serif" }}>
                                            {section.items?.length || 0} questions
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: 2, alignItems: "center" }} onClick={e => e.stopPropagation()}>
                                    {editingTitle === section.id ? (
                                        <>
                                            <button style={{ ...S.iconBtn("#4ade80"), fontSize: 12 }} onClick={() => saveTitle(section.id)}>✓ Save</button>
                                            <button style={{ ...S.iconBtn(BRAND.muted), fontSize: 12 }} onClick={() => setEditingTitle(null)}>✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <button title="Edit title" style={S.iconBtn(expanded ? "#9ca3af" : BRAND.muted)} onClick={() => { setEditingTitle(section.id); setTitleDraft(section.title); setExpandedSection(section.id); }}>✎</button>
                                            <button title="Move up" style={S.iconBtn(expanded ? "#9ca3af" : BRAND.muted)} disabled={sIdx === 0} onClick={() => moveSectionUp(sIdx)}>↑</button>
                                            <button title="Move down" style={S.iconBtn(expanded ? "#9ca3af" : BRAND.muted)} disabled={sIdx === sections.length - 1} onClick={() => moveSectionDown(sIdx)}>↓</button>
                                            <button title="Remove section" style={{ ...S.iconBtn(BRAND.red), opacity: sections.length <= 1 ? 0.3 : 1 }} onClick={() => sections.length > 1 && removeSection(section.id)}>✕</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {expanded && (
                                <div>
                                    {(section.items || []).map((item, iIdx) => (
                                        <div key={iIdx} style={S.questionRow(iIdx)}>
                                            <div style={{ width: 22, textAlign: "center", paddingTop: 2, color: BRAND.muted, fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>{iIdx + 1}.</div>

                                            {editingQuestion && editingQuestion.sectionId === section.id && editingQuestion.itemIdx === iIdx ? (
                                                <div style={{ flex: 1 }}>
                                                    <textarea
                                                        autoFocus
                                                        style={S.textArea}
                                                        value={questionDraft}
                                                        onChange={e => setQuestionDraft(e.target.value)}
                                                        onKeyDown={e => { if (e.key === "Escape") setEditingQuestion(null); }}
                                                    />
                                                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                                        <button style={S.primaryBtn} onClick={() => saveQuestion(section.id, iIdx)}>Save</button>
                                                        <button style={S.ghostBtn} onClick={() => setEditingQuestion(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ flex: 1, fontSize: 13, color: "#374151", lineHeight: 1.55, paddingTop: 2 }}>{item}</div>
                                            )}

                                            {!(editingQuestion && editingQuestion.sectionId === section.id && editingQuestion.itemIdx === iIdx) && (
                                                <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
                                                    <button title="Edit" style={S.iconBtn(BRAND.muted)} onClick={() => { setEditingQuestion({ sectionId: section.id, itemIdx: iIdx }); setQuestionDraft(item); }}>✎</button>
                                                    <button title="Move up" style={{ ...S.iconBtn(BRAND.muted), opacity: iIdx === 0 ? 0.3 : 1 }} onClick={() => moveQuestionUp(section.id, iIdx)}>↑</button>
                                                    <button title="Move down" style={{ ...S.iconBtn(BRAND.muted), opacity: iIdx === section.items.length - 1 ? 0.3 : 1 }} onClick={() => moveQuestionDown(section.id, iIdx)}>↓</button>
                                                    <button title="Remove" style={{ ...S.iconBtn(BRAND.red), opacity: section.items.length <= 1 ? 0.3 : 1 }} onClick={() => section.items.length > 1 && removeQuestion(section.id, iIdx)}>✕</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div style={{ padding: "14px 18px", background: "#f0f9ff", borderTop: `1px solid ${BRAND.border}` }}>
                                        <div style={{ fontSize: 11, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", color: BRAND.coral, fontWeight: "bold", marginBottom: 8 }}>
                                            Add Question
                                        </div>
                                        <textarea
                                            style={{ ...S.textArea, minHeight: 50, marginBottom: 8, background: BRAND.white }}
                                            placeholder="Type a new competency question and click Add..."
                                            value={newQuestions[section.id] || ""}
                                            onChange={e => setNewQuestions(p => ({ ...p, [section.id]: e.target.value }))}
                                            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addQuestion(section.id); }}
                                        />
                                        <button style={S.primaryBtn} onClick={() => addQuestion(section.id)}>+ Add Question</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    onClick={addSection}
                    style={{ width: "100%", padding: "14px", border: `2px dashed ${BRAND.border}`, borderRadius: 10, background: "transparent", color: BRAND.muted, fontSize: 14, fontFamily: "sans-serif", cursor: "pointer", marginTop: 4 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.red; e.currentTarget.style.color = BRAND.red; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.muted; }}
                >
                    + Add New Section
                </button>
            </div>
        </div>
    );
}
