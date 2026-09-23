"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Key,
  ShieldCheck,
  Sparkles,
  Terminal,
  Hash,
  Palette,
  Layers,
  Cpu,
  Calculator,
  Copy,
  Check,
  Flame,
  Radio,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import type { TechRelayRound } from "@/lib/api";

export interface CrackPasswordRoundProps {
  round: TechRelayRound;
  subIndex: number;
  answer: string;
  setAnswer: (ans: string) => void;
  onSubmit?: (finalAnswer?: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

// ── Mobile Brands (Step 4) ─────────────────────────────────────────
interface MobileBrand {
  id: string;
  name: string;
  tag: string;
  accentColor: string;
  bgRgba: string;
  svgIcon: React.ReactNode;
}

const MOBILE_BRANDS: MobileBrand[] = [
  {
    id: "APPLE",
    name: "APPLE",
    tag: "iOS Ecosystem",
    accentColor: "#f5f5f7",
    bgRgba: "rgba(255, 255, 255, 0.08)",
    svgIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96.99-3.11-.97.04-2.15.65-2.85 1.47-.62.72-1.16 1.88-1.02 3 1.09.09 2.21-.55 2.88-1.36z" />
      </svg>
    ),
  },
  {
    id: "SAMSUNG",
    name: "SAMSUNG",
    tag: "Galaxy Flagship",
    accentColor: "#3b82f6",
    bgRgba: "rgba(59, 130, 246, 0.12)",
    svgIcon: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "1.5px", color: "#60a5fa" }}>
          SAMSUNG
        </span>
      </div>
    ),
  },
  {
    id: "GOOGLE",
    name: "GOOGLE",
    tag: "Pixel Tensor AI",
    accentColor: "#ea4335",
    bgRgba: "rgba(234, 67, 53, 0.12)",
    svgIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
];

// ── Color Options (Step 5) ─────────────────────────────────────────
const COLOR_OPTIONS = [
  { id: "CYAN", name: "Neon Cyan", hex: "#06b6d4", bgRgba: "rgba(6, 182, 212, 0.15)" },
  { id: "VIOLET", name: "Cyber Violet", hex: "#a855f7", bgRgba: "rgba(168, 85, 247, 0.15)" },
  { id: "EMERALD", name: "Matrix Emerald", hex: "#10b981", bgRgba: "rgba(16, 185, 129, 0.15)" },
];

// ── Tech Tags (Step 6) ─────────────────────────────────────────────
const TECH_TAGS = [
  { id: "TS", label: "TypeScript" },
  { id: "PY", label: "Python" },
  { id: "GO", label: "Golang" },
  { id: "RUST", label: "Rust" },
];

// ── Special Symbols (Step 7) ───────────────────────────────────────
const SPECIAL_SYMBOLS = [
  { char: "!", name: "Exclamation" },
  { char: "#", name: "Hash" },
  { char: "$", name: "Dollar" },
  { char: "&", name: "Ampersand" },
];

export default function CrackPasswordRound({
  setAnswer,
  onSubmit,
  isSubmitting = false,
}: CrackPasswordRoundProps) {
  // Step 1: Base Name
  const [baseName, setBaseName] = useState<string>("");
  // Step 2: Number
  const [numAddition, setNumAddition] = useState<string>("");
  // Step 3: Math
  const [mathAnswer, setMathAnswer] = useState<string>("");
  // Step 4: Mobile Brand
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  // Step 5: Color
  const [selectedColor, setSelectedColor] = useState<string>("");
  // Step 6: Tech Tag
  const [techTag, setTechTag] = useState<string>("");
  // Step 7: Special Symbol
  const [specialSymbol, setSpecialSymbol] = useState<string>("");
  // Step 8: Verification Digit
  const [verifyDigit, setVerifyDigit] = useState<string>("");
  // Step 9: Confirmed Assembly
  const [assemblyConfirmed, setAssemblyConfirmed] = useState<boolean>(false);
  // Step 10: Master Key Unlocked
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Constants
  const mathProblem = { num1: 14, num2: 7, op: "×", answer: "98" };
  const expectedVerifyDigit = "7";

  // Conditions fulfillment checks
  const isCond1Done = baseName.trim().length > 0;
  const isCond2Done = isCond1Done && numAddition.trim().length > 0 && !isNaN(Number(numAddition));
  const isCond3Done = isCond2Done && mathAnswer.trim() === mathProblem.answer;
  const isCond4Done = isCond3Done && selectedBrand.length > 0;
  const isCond5Done = isCond4Done && selectedColor.length > 0;
  const isCond6Done = isCond5Done && techTag.length > 0;
  const isCond7Done = isCond6Done && specialSymbol.length > 0;
  const isCond8Done = isCond7Done && verifyDigit.trim() === expectedVerifyDigit;
  const isCond9Done = isCond8Done && assemblyConfirmed;
  const isCond10Done = isCond9Done && isUnlocked;

  // Active step count
  const completedCount = [
    isCond1Done,
    isCond2Done,
    isCond3Done,
    isCond4Done,
    isCond5Done,
    isCond6Done,
    isCond7Done,
    isCond8Done,
    isCond9Done,
    isCond10Done,
  ].filter(Boolean).length;

  // Assembled string
  const assembledRaw = [
    baseName.trim() || "???",
    numAddition.trim() || "??",
    isCond3Done ? mathProblem.answer : "??",
    selectedBrand || "???",
    selectedColor || "???",
    techTag || "??",
    specialSymbol || "?",
    verifyDigit.trim() || "?",
  ].join("_");

  // Sync answer to parent
  useEffect(() => {
    if (isUnlocked && masterPassword) {
      setAnswer(masterPassword);
    }
  }, [isUnlocked, masterPassword, setAnswer]);

  // Handle final Step 10 unlock
  const handleFinalUnlock = async () => {
    const finalKey = assembledRaw.toUpperCase();
    setMasterPassword(finalKey);
    setIsUnlocked(true);
    setAnswer(finalKey);

    if (onSubmit) {
      await onSubmit(finalKey);
    }
  };

  const handleCopy = () => {
    const textToCopy = (masterPassword || assembledRaw).toUpperCase();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ width: "100%", color: "#e2e8f0", fontFamily: "var(--font-body, sans-serif)" }}>
      {/* ── Progress Status Tracker (Top HUD) ── */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: "rgba(6, 182, 212, 0.15)",
              color: "#22d3ee",
              border: "1px solid rgba(6, 182, 212, 0.35)",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1px",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            CONDITIONS UNLOCKED: {completedCount} / 10
          </span>
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
            Complete each condition to reveal the next hint below
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "100px",
              height: "6px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${completedCount * 10}%`,
                height: "100%",
                background: "linear-gradient(90deg, #06b6d4, #10b981)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#22d3ee", fontFamily: "var(--font-mono, monospace)" }}>
            {completedCount * 10}%
          </span>
        </div>
      </div>

      {/* ── Progressive Conditions Stack (Hints reveal below) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ════════════════════════════════════════════════════════════
            CONDITION 1: BASE NAME
        ════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: isCond1Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
            border: isCond1Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "16px 18px",
            transition: "all 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: isCond1Done ? "#10b981" : "rgba(6, 182, 212, 0.2)",
                  color: isCond1Done ? "#ffffff" : "#22d3ee",
                  fontSize: "11px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCond1Done ? "✓" : "1"}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                Condition 1: Enter Base Codename
              </span>
            </div>
            {isCond1Done && (
              <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                SAVED: {baseName.toUpperCase()}
              </span>
            )}
          </div>

          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 10px 32px" }}>
            Type your student name or initial codename to seed the master password.
          </p>

          <div style={{ marginLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              placeholder="Type codename (e.g. MEET, CIPHER, TITAN)..."
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#ffffff",
                fontSize: "14px",
                fontFamily: "var(--font-mono, monospace)",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>Suggestions:</span>
              {["MEET", "CIPHER", "SHADOW", "TITAN"].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setBaseName(sug)}
                  style={{
                    background: baseName === sug ? "rgba(6, 182, 212, 0.25)" : "rgba(255, 255, 255, 0.05)",
                    color: baseName === sug ? "#22d3ee" : "rgba(255, 255, 255, 0.6)",
                    border: baseName === sug ? "1px solid rgba(6, 182, 212, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            CONDITION 2: NUMBER ADDITION (Appears below Condition 1)
        ════════════════════════════════════════════════════════════ */}
        {isCond1Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond2Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond2Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond2Done ? "#10b981" : "rgba(99, 102, 241, 0.25)",
                    color: isCond2Done ? "#ffffff" : "#a5b4fc",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond2Done ? "✓" : "2"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 2: Add a Numeric Value
                </span>
              </div>
              {isCond2Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SAVED: +{numAddition}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 10px 32px" }}>
              Append numeric value or choose one suggestion button.
            </p>

            <div style={{ marginLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="number"
                value={numAddition}
                onChange={(e) => setNumAddition(e.target.value)}
                placeholder="Enter numbers (e.g. 10, 42, 777)..."
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontFamily: "var(--font-mono, monospace)",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>Presets:</span>
                {["10", "42", "777", "2026"].map((numVal) => (
                  <button
                    key={numVal}
                    type="button"
                    onClick={() => setNumAddition(numVal)}
                    style={{
                      background: numAddition === numVal ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                      color: numAddition === numVal ? "#a5b4fc" : "rgba(255, 255, 255, 0.6)",
                      border: numAddition === numVal ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono, monospace)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    +{numVal}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 3: MATH CHALLENGE (Appears below Condition 2)
        ════════════════════════════════════════════════════════════ */}
        {isCond2Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond3Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond3Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond3Done ? "#10b981" : "rgba(251, 191, 36, 0.25)",
                    color: isCond3Done ? "#ffffff" : "#fbbf24",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond3Done ? "✓" : "3"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 3: Math Challenge: What is {mathProblem.num1} {mathProblem.op} {mathProblem.num2} ?
                </span>
              </div>
              {isCond3Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SOLVED: {mathProblem.answer}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 10px 32px" }}>
              Calculate the correct arithmetic result to unlock the next condition.
            </p>

            <div style={{ marginLeft: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value.trim())}
                placeholder="Type answer (e.g. 98)..."
                style={{
                  width: "180px",
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: isCond3Done ? "1px solid #10b981" : "1px solid rgba(251, 191, 36, 0.4)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono, monospace)",
                  outline: "none",
                }}
              />
              {isCond3Done && (
                <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Correct!
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 4: MOBILE BRANDS (Appears below Condition 3)
        ════════════════════════════════════════════════════════════ */}
        {isCond3Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond4Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond4Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond4Done ? "#10b981" : "rgba(168, 85, 247, 0.25)",
                    color: isCond4Done ? "#ffffff" : "#c084fc",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond4Done ? "✓" : "4"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 4: Choose a Mobile Brand Logo
                </span>
              </div>
              {isCond4Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SELECTED: {selectedBrand}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 12px 32px" }}>
              Click any of the 3 mobile brand cards below to capture its name:
            </p>

            <div style={{ marginLeft: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
              {MOBILE_BRANDS.map((brand) => {
                const isSelected = selectedBrand === brand.name;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setSelectedBrand(brand.name)}
                    style={{
                      background: isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(0, 0, 0, 0.35)",
                      border: isSelected ? "1px solid #22d3ee" : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isSelected ? "0 0 16px rgba(6, 182, 212, 0.3)" : "none",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ color: isSelected ? "#22d3ee" : brand.accentColor, height: 26, display: "flex", alignItems: "center" }}>
                      {brand.svgIcon}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                      {brand.name}
                    </span>
                    <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
                      {brand.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 5: COLOR CHOICE (Appears below Condition 4)
        ════════════════════════════════════════════════════════════ */}
        {isCond4Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond5Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond5Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond5Done ? "#10b981" : "rgba(244, 114, 182, 0.25)",
                    color: isCond5Done ? "#ffffff" : "#f472b6",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond5Done ? "✓" : "5"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 5: Select a Signature Color
                </span>
              </div>
              {isCond5Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SELECTED: {selectedColor}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 12px 32px" }}>
              Pick one of the 3 color designations:
            </p>

            <div style={{ marginLeft: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
              {COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    style={{
                      background: isSelected ? c.bgRgba : "rgba(0, 0, 0, 0.35)",
                      border: isSelected ? `1px solid ${c.hex}` : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isSelected ? `0 0 16px ${c.hex}55` : "none",
                      borderRadius: "12px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.hex, flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 6: TECH TAG (Appears below Condition 5)
        ════════════════════════════════════════════════════════════ */}
        {isCond5Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond6Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond6Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond6Done ? "#10b981" : "rgba(52, 211, 153, 0.25)",
                    color: isCond6Done ? "#ffffff" : "#34d399",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond6Done ? "✓" : "6"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 6: Select a Tech Tag
                </span>
              </div>
              {isCond6Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SELECTED: {techTag}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 12px 32px" }}>
              Choose your language abbreviation tag:
            </p>

            <div style={{ marginLeft: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
              {TECH_TAGS.map((t) => {
                const isSelected = techTag === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTechTag(t.id)}
                    style={{
                      background: isSelected ? "rgba(52, 211, 153, 0.2)" : "rgba(0, 0, 0, 0.35)",
                      border: isSelected ? "1px solid #34d399" : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isSelected ? "0 0 14px rgba(52, 211, 153, 0.3)" : "none",
                      borderRadius: "10px",
                      padding: "10px 8px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: "16px", fontWeight: 900, fontFamily: "var(--font-mono, monospace)", color: isSelected ? "#34d399" : "#ffffff" }}>
                      {t.id}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)" }}>
                      {t.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 7: SPECIAL SYMBOL (Appears below Condition 6)
        ════════════════════════════════════════════════════════════ */}
        {isCond6Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond7Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond7Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond7Done ? "#10b981" : "rgba(244, 63, 94, 0.25)",
                    color: isCond7Done ? "#ffffff" : "#fb7185",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond7Done ? "✓" : "7"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 7: Select a Special Character
                </span>
              </div>
              {isCond7Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  SELECTED: {specialSymbol}
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 12px 32px" }}>
              Pick a required punctuation symbol:
            </p>

            <div style={{ marginLeft: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "8px" }}>
              {SPECIAL_SYMBOLS.map((s) => {
                const isSelected = specialSymbol === s.char;
                return (
                  <button
                    key={s.char}
                    type="button"
                    onClick={() => setSpecialSymbol(s.char)}
                    style={{
                      background: isSelected ? "rgba(244, 63, 94, 0.2)" : "rgba(0, 0, 0, 0.35)",
                      border: isSelected ? "1px solid #fb7185" : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isSelected ? "0 0 14px rgba(244, 63, 94, 0.3)" : "none",
                      borderRadius: "10px",
                      padding: "10px 8px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ fontSize: "22px", fontWeight: 900, fontFamily: "var(--font-mono, monospace)", color: "#fb7185" }}>
                      {s.char}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)" }}>
                      {s.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 8: VERIFICATION DIGIT HINT (Appears below 7)
        ════════════════════════════════════════════════════════════ */}
        {isCond7Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond8Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond8Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond8Done ? "#10b981" : "rgba(6, 182, 212, 0.25)",
                    color: isCond8Done ? "#ffffff" : "#22d3ee",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond8Done ? "✓" : "8"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 8: Verification Parity Digit Hint
                </span>
              </div>
              {isCond8Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  VERIFIED: [{expectedVerifyDigit}]
                </span>
              )}
            </div>

            <div
              style={{
                marginLeft: "32px",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                <Radio style={{ width: 16, height: 16, color: "#22d3ee" }} />
                <span>Security Hint: Parity checksum digit is:</span>
              </div>
              <span style={{ background: "rgba(6, 182, 212, 0.25)", color: "#22d3ee", padding: "2px 10px", borderRadius: "6px", fontSize: "16px", fontWeight: 900, fontFamily: "var(--font-mono, monospace)" }}>
                {expectedVerifyDigit}
              </span>
            </div>

            <div style={{ marginLeft: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="text"
                maxLength={2}
                value={verifyDigit}
                onChange={(e) => setVerifyDigit(e.target.value.trim())}
                placeholder={`Type digit ${expectedVerifyDigit}...`}
                style={{
                  width: "160px",
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: isCond8Done ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono, monospace)",
                  outline: "none",
                }}
              />
              {isCond8Done && (
                <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Digit Verified!
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 9: STRING ASSEMBLY PREVIEW (Appears below 8)
        ════════════════════════════════════════════════════════════ */}
        {isCond8Done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: isCond9Done ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.04)",
              border: isCond9Done ? "1px solid rgba(52, 211, 153, 0.35)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px 18px",
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isCond9Done ? "#10b981" : "rgba(59, 130, 246, 0.25)",
                    color: isCond9Done ? "#ffffff" : "#60a5fa",
                    fontSize: "11px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCond9Done ? "✓" : "9"}
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                  Condition 9: Verify Assembled Password String
                </span>
              </div>
              {isCond9Done && (
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, fontFamily: "var(--font-mono, monospace)" }}>
                  ASSEMBLY CONFIRMED
                </span>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.55)", margin: "0 0 10px 32px" }}>
              Inspect the combined password sequence assembled from all your choices:
            </p>

            <div style={{ marginLeft: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.6)",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#22d3ee",
                  wordBreak: "break-all",
                }}
              >
                {assembledRaw}
              </div>

              {!isCond9Done ? (
                <button
                  type="button"
                  onClick={() => setAssemblyConfirmed(true)}
                  style={{
                    alignSelf: "flex-start",
                    background: "linear-gradient(135deg, #06b6d4, #2563eb)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    padding: "8px 18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
                  }}
                >
                  Confirm Assembly & Reveal Master Step 10 ↓
                </button>
              ) : (
                <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> String verified. Master Password ready!
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════
            CONDITION 10: FINAL MASTER PASSWORD (Appears below 9)
        ════════════════════════════════════════════════════════════ */}
        {isCond9Done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(16, 185, 129, 0.08))",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              borderRadius: "16px",
              padding: "22px 20px",
              boxShadow: "0 0 35px rgba(6, 182, 212, 0.15)",
              textAlign: "center",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                margin: "0 auto 12px",
                borderRadius: "14px",
                background: isUnlocked ? "linear-gradient(135deg, #059669, #10b981)" : "linear-gradient(135deg, #06b6d4, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 0 25px rgba(6, 182, 212, 0.4)",
              }}
            >
              {isUnlocked ? <Unlock style={{ width: 24, height: 24 }} /> : <Key style={{ width: 24, height: 24 }} />}
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "0 0 4px" }}>
              Condition 10: Final Master Password
            </h3>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", margin: "0 auto 14px", maxWidth: "450px" }}>
              Transform the assembled sequence entirely into UPPERCASE to unlock the dashboard and complete Round 5!
            </p>

            {/* Master Key Encoding Box */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                border: "1px solid rgba(6, 182, 212, 0.35)",
                borderRadius: "12px",
                padding: "14px 18px",
                marginBottom: "16px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "17px",
                fontWeight: 900,
                letterSpacing: "1px",
                color: "#ffffff",
                wordBreak: "break-all",
                userSelect: "all",
              }}
            >
              {assembledRaw.toUpperCase()}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handleFinalUnlock}
                disabled={isSubmitting}
                style={{
                  background: isUnlocked
                    ? "linear-gradient(135deg, #059669, #10b981)"
                    : "linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #10b981 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 26px",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  fontFamily: "var(--font-mono, monospace)",
                  boxShadow: isUnlocked
                    ? "0 0 25px rgba(16, 185, 129, 0.5)"
                    : "0 0 30px rgba(6, 182, 212, 0.5)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width: 14, height: 14, border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    <span>Unlocking Master Vault...</span>
                  </>
                ) : isUnlocked ? (
                  <>
                    <CheckCircle2 style={{ width: 16, height: 16, color: "#a7f3d0" }} />
                    <span>Vault Unlocked! Submitted!</span>
                  </>
                ) : (
                  <>
                    <Unlock style={{ width: 16, height: 16 }} />
                    <span>TRANSFORM TO UPPERCASE & UNLOCK DASHBOARD</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#f1f5f9",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono, monospace)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {copied ? <Check style={{ width: 15, height: 15, color: "#34d399" }} /> : <Copy style={{ width: 15, height: 15 }} />}
                <span>{copied ? "Copied!" : "Copy Key"}</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
