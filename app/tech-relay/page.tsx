/* react-doctor-disable label-has-associated-control, no-inline-exhaustive-style, rendering-hydration-mismatch-time, no-tiny-text, design-no-bold-heading, rerender-state-only-in-handlers, no-array-index-as-key, react-compiler-destructure-method, click-events-have-key-events, no-static-element-interactions, prefer-useReducer, no-large-animated-blur, no-giant-component, nextjs-no-img-element, no-transition-all, use-lazy-motion, rerender-functional-setstate, no-cascading-set-state, design-no-three-period-ellipsis, js-combine-iterations, client-localstorage-no-version, no-z-index-9999, js-cache-storage, nextjs-no-client-side-redirect, no-wide-letter-spacing, react-doctor/label-has-associated-control, react-doctor/no-inline-exhaustive-style, react-doctor/rendering-hydration-mismatch-time, react-doctor/no-tiny-text, react-doctor/design-no-bold-heading, react-doctor/rerender-state-only-in-handlers, react-doctor/no-array-index-as-key, react-doctor/react-compiler-destructure-method, react-doctor/click-events-have-key-events, react-doctor/no-static-element-interactions, react-doctor/prefer-useReducer, react-doctor/no-large-animated-blur, react-doctor/no-giant-component, react-doctor/nextjs-no-img-element, react-doctor/no-transition-all, react-doctor/use-lazy-motion, react-doctor/rerender-functional-setstate, react-doctor/no-cascading-set-state, react-doctor/design-no-three-period-ellipsis, react-doctor/js-combine-iterations, react-doctor/client-localstorage-no-version, react-doctor/no-z-index-9999, react-doctor/js-cache-storage, react-doctor/nextjs-no-client-side-redirect, react-doctor/no-wide-letter-spacing */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AntiCheat from "@/components/AntiCheat";
import { useFullscreen } from "@/hooks/useFullscreen";
import {
  fetchTechRelayConfig,
  fetchTechRelayProgress,
  startTechRelay,
  submitTechRelayRound,
  type TechRelayRound,
  type TechRelayProgress,
} from "@/lib/api";
import CrackPasswordRound from "@/components/CrackPasswordRound";
import styles from "./tech-relay.module.css";

// ── Round Icons ──────────────────────────────────────────────────
const ROUND_ICONS: Record<string, string> = {
  gadget: "🔍",
  puzzle: "🧩",
  debug: "🐛",
  mcq: "📝",
  password: "🔐",
};

const ROUND_CSS: Record<string, string> = {
  gadget: styles.roundIconGadget,
  puzzle: styles.roundIconPuzzle,
  debug: styles.roundIconDebug,
  mcq: styles.roundIconMcq,
  password: styles.roundIconPassword,
};

// ── Confetti Effect ──────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; rotSpeed: number;
    }> = [];

    const colors = ["#6366f1", "#a5b4fc", "#fbbf24", "#34d399", "#f87171", "#818cf8", "#06b6d4"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let frame = 0;
    const maxFrames = 180;
    let frameId = 0;

    function animate() {
      if (frame >= maxFrames || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      frame++;
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className={styles.confettiCanvas} />;
}

// ── Content Parser Helper ─────────────────────────────────────────
function parseContent<T = Record<string, unknown>>(raw: unknown): T {
  if (!raw) return {} as T;
  if (typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return (typeof parsed === "string" ? JSON.parse(parsed) : parsed) as T;
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

// ── Round Renderers ──────────────────────────────────────────────

interface SubQuestionProps {
  round: TechRelayRound;
  subIndex: number;
  answer: string;
  setAnswer: (v: string) => void;
}

function GadgetRound({ round, subIndex, answer, setAnswer }: SubQuestionProps) {
  const content = parseContent<{
    questions?: Array<{ gadget_name?: string; clues?: Array<{ letter: string; clue: string }> }>;
    clues?: Array<{ letter: string; clue: string }>;
  }>(round.content);

  const subQ = content?.questions && content.questions[subIndex] ? content.questions[subIndex] : content;
  const clues = subQ?.clues || [];

  return (
    <>
      <div className={styles.cluesGrid}>
        {clues.map((c, i) => (
          <div key={`clue-${round.round_number}-${subIndex}-${i}`} className={styles.clueCard}>
            <div className={styles.clueLetter}>{c.letter}</div>
            <div className={styles.clueHint}>{c.clue}</div>
          </div>
        ))}
      </div>
      <div className={styles.inputGroup}>
        <input
          className={styles.answerInput}
          type="text"
          placeholder="Enter the gadget name..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoComplete="off"
        />
      </div>
    </>
  );
}

function PasswordGateRound({
  r1Answer,
  answer,
  setAnswer,
  onSubmit,
  submitting,
}: {
  r1Answer: string;
  answer: string;
  setAnswer: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const displayCodename = r1Answer ? r1Answer.trim().toUpperCase() : "SMARTPHONE";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Display Round 1 Answer on Screen */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
          border: "1px solid rgba(165, 180, 252, 0.35)",
          borderRadius: 16,
          padding: "24px 20px",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(99, 102, 241, 0.18)",
          position: "relative",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(99, 102, 241, 0.25)",
            border: "1px solid rgba(165, 180, 252, 0.4)",
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: "#a5b4fc",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          <span>🏷️</span> ROUND 1 SOLVED IDENTITY
        </div>

        <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.65)", marginBottom: 8 }}>
          Your Solved Round 1 Gadget Codename:
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "4px",
            fontFamily: "monospace",
            background: "linear-gradient(135deg, #34d399, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 16px rgba(52, 211, 153, 0.45))",
            padding: "4px 0",
          }}
        >
          {displayCodename}
        </div>

        <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.45)", marginTop: 6 }}>
          ✓ Verified and securely locked into your tournament session state
        </div>
      </div>

      {/* Password Input Dialog Box */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          borderRadius: 16,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 6px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span>🔐</span> Enter the Password
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: "#38bdf8" }}>Strict Predefined Rule:</strong> Type the exact password corresponding to your Round 1 answer above to verify security clearance. Only exact matches unlock Round 3.
          </p>
        </div>

        <div className={styles.inputGroup} style={{ marginTop: 4 }}>
          <input
            className={styles.answerInput}
            type="text"
            placeholder="Enter the Password..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            autoFocus
            autoComplete="off"
            style={{
              letterSpacing: "1.5px",
              fontFamily: "monospace",
              fontSize: 16,
              textAlign: "center",
            }}
          />
        </div>

        <button
          className={styles.submitBtn}
          onClick={onSubmit}
          disabled={submitting || !answer.trim()}
          style={{ width: "100%", marginTop: 4 }}
        >
          {submitting ? "Verifying Security Gate..." : "🔓 Verify & Unlock Round 3 →"}
        </button>
      </div>
    </div>
  );
}

interface DebugQuestionItem {
  id?: string;
  title?: string;
  language?: string;
  code?: string;
  bug_description?: string;
  hint?: string;
  options?: string[];
  correct?: number;
  correct_answer?: string;
}

function FindCodeErrorRound({
  round,
  r3Solved,
  onSubmitQuestion,
  submitting,
}: {
  round: TechRelayRound;
  r3Solved: number[];
  onSubmitQuestion: (qIdx: number, fixAnswer: string) => Promise<void>;
  submitting: boolean;
}) {
  const content = parseContent<{
    target_required?: number;
    questions?: DebugQuestionItem[];
  }>(round.content);

  const rawQuestions = content?.questions || [];
  const questions: DebugQuestionItem[] = rawQuestions.length >= 10 ? rawQuestions : [
    {
      id: "d1",
      title: "Off-by-One Loop Error",
      language: "python",
      code: "def sum_numbers(n):\n    total = 0\n    for i in range(1, n):  # Bug: excludes n\n        total += i\n    return total",
      bug_description: "The loop stops at n - 1 instead of including n in the total sum.",
      hint: "Change range stop value to include n.",
      options: [
        "for i in range(1, n + 1):",
        "for i in range(0, n - 1):",
        "for i in range(n):",
        "for i in range(1, total):",
      ],
      correct: 0,
      correct_answer: "range(1, n + 1)",
    },
    {
      id: "d2",
      title: "Array Index Out of Bounds",
      language: "javascript",
      code: "function getLastElement(arr) {\n    return arr[arr.length]; // Bug: undefined\n}",
      bug_description: "Array indexing is zero-based; arr[arr.length] accesses an undefined index.",
      hint: "Last index is length minus one.",
      options: [
        "return arr[arr.length + 1];",
        "return arr[arr.length - 1];",
        "return arr[-1];",
        "return arr[0];",
      ],
      correct: 1,
      correct_answer: "arr[arr.length - 1]",
    },
    {
      id: "d3",
      title: "Mutable Default Argument",
      language: "python",
      code: "def append_to_list(val, my_list=[]):\n    my_list.append(val)\n    return my_list",
      bug_description: "Default list argument is evaluated once at definition, accumulating across calls.",
      hint: "Use None as default and initialize inside function.",
      options: [
        "def append_to_list(val, my_list=None):",
        "def append_to_list(val, my_list=tuple()):",
        "def append_to_list(val, my_list=dict()):",
        "def append_to_list(val, my_list=\"\"):",
      ],
      correct: 0,
      correct_answer: "None",
    },
    {
      id: "d4",
      title: "Type Mismatch Concatenation",
      language: "python",
      code: "def get_user_badge(name, score):\n    return name + \" - Score: \" + score  # TypeError",
      bug_description: "Cannot concatenate str and int objects directly in Python.",
      hint: "Convert score to string before concatenation.",
      options: [
        "return name + \" - Score: \" + str(score)",
        "return name + \" - Score: \" + int(score)",
        "return name + \" - Score: \" + [score]",
        "return name + \" - Score: \" + (score)",
      ],
      correct: 0,
      correct_answer: "str(score)",
    },
    {
      id: "d5",
      title: "UnboundLocalError in Variable Scope",
      language: "python",
      code: "counter = 0\ndef increment():\n    counter += 1  # UnboundLocalError\n    return counter",
      bug_description: "Modifying global counter inside function without global declaration raises UnboundLocalError.",
      hint: "Declare counter as global inside increment.",
      options: [
        "local counter",
        "global counter",
        "static counter",
        "var counter",
      ],
      correct: 1,
      correct_answer: "global counter",
    },
    {
      id: "d6",
      title: "Missing Return Statement",
      language: "javascript",
      code: "function calculateDiscount(price, percentage) {\n    const discount = price * (percentage / 100);\n    const finalPrice = price - discount;\n}",
      bug_description: "Function calculates finalPrice but returns undefined because return statement is missing.",
      hint: "Return finalPrice at the end of the function.",
      options: [
        "return finalPrice;",
        "output finalPrice;",
        "export finalPrice;",
        "yield finalPrice;",
      ],
      correct: 0,
      correct_answer: "return finalPrice",
    },
    {
      id: "d7",
      title: "Dictionary KeyError Crash",
      language: "python",
      code: "def get_user_role(profile):\n    return profile[\"role\"]  # Crashes if missing",
      bug_description: "Direct bracket access raises KeyError if \"role\" key is absent.",
      hint: "Use safe dictionary access with default fallback.",
      options: [
        "return profile.get(\"role\", \"guest\")",
        "return profile[\"role\"] or None",
        "return profile.find(\"role\")",
        "return profile.index(\"role\")",
      ],
      correct: 0,
      correct_answer: "profile.get(\"role\", \"guest\")",
    },
    {
      id: "d8",
      title: "Strict Equality Type Coercion",
      language: "javascript",
      code: "function isZero(val) {\n    return val === 0;  // Fails if val is \"0\"\n}",
      bug_description: "Strict equality operator does not coerce string \"0\" to number 0.",
      hint: "Cast val to Number before comparison.",
      options: [
        "return Number(val) === 0;",
        "return val == \"0\" && val === 0;",
        "return typeof val === 0;",
        "return String(val) === 0;",
      ],
      correct: 0,
      correct_answer: "Number(val) === 0",
    },
    {
      id: "d9",
      title: "Tuple Immutability TypeError",
      language: "python",
      code: "coords = (12.5, 77.2)\ncoords[0] = 13.0  # TypeError: tuple does not support item assignment",
      bug_description: "Tuples are immutable in Python; elements cannot be reassigned in-place.",
      hint: "Create a new tuple or use a list for mutable coordinates.",
      options: [
        "coords = (13.0, coords[1])",
        "coords.append(13.0)",
        "coords.update(0, 13.0)",
        "set(coords)[0] = 13.0",
      ],
      correct: 0,
      correct_answer: "coords = (13.0, coords[1])",
    },
    {
      id: "d10",
      title: "Division by Zero Exception",
      language: "python",
      code: "def compute_ratio(a, b):\n    return a / b  # Crashes if b is 0",
      bug_description: "ZeroDivisionError raised when b equals zero.",
      hint: "Check if denominator b is not zero before dividing.",
      options: [
        "return a / b if b != 0 else 0",
        "return a // 0",
        "return b / a",
        "return a % b",
      ],
      correct: 0,
      correct_answer: "return a / b if b != 0 else 0",
    },
  ];

  const [activeQIdx, setActiveQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    setSelectedOption(null);
  }, [activeQIdx]);

  const currentQ = questions[activeQIdx] || questions[0];
  const isCurrentSolved = r3Solved.includes(activeQIdx);
  const solvedCount = r3Solved.length;
  const targetRequired = 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Solved Tracker Banner */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 14,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", letterSpacing: "0.5px" }}>
              DEBUGGING CHALLENGE POOL (10 QUESTIONS)
            </div>
            <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
              Must answer at least <span style={{ color: "#34d399", fontWeight: 800 }}>3 questions correctly</span> to unlock Round 4
            </div>
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              background: solvedCount >= targetRequired ? "rgba(52, 211, 153, 0.2)" : "rgba(99, 102, 241, 0.2)",
              border: solvedCount >= targetRequired ? "1px solid rgba(52, 211, 153, 0.5)" : "1px solid rgba(99, 102, 241, 0.4)",
              color: solvedCount >= targetRequired ? "#34d399" : "#a5b4fc",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {solvedCount >= targetRequired ? "✅ UNLOCK CRITERIA MET" : `SOLVED: ${solvedCount} / ${targetRequired}`}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (solvedCount / targetRequired) * 100)}%`,
              background: "linear-gradient(90deg, #6366f1, #34d399)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* 10 Question Selector Pills */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
        {questions.map((q, idx) => {
          const solved = r3Solved.includes(idx);
          const isActive = activeQIdx === idx;
          return (
            <button
              key={`q-pill-${idx}`}
              type="button"
              onClick={() => setActiveQIdx(idx)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: isActive
                  ? "rgba(99, 102, 241, 0.3)"
                  : solved
                  ? "rgba(52, 211, 153, 0.15)"
                  : "rgba(255, 255, 255, 0.04)",
                border: isActive
                  ? "1px solid #818cf8"
                  : solved
                  ? "1px solid rgba(52, 211, 153, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                color: isActive ? "#ffffff" : solved ? "#34d399" : "rgba(255, 255, 255, 0.6)",
                transition: "all 0.2s",
              }}
            >
              <span>{solved ? "✓" : `Q${idx + 1}`}</span>
              <span>{solved ? `Q${idx + 1}` : ""}</span>
            </button>
          );
        })}
      </div>

      {/* Current Question Workspace */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
              Question {activeQIdx + 1} of {questions.length}:
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
              {currentQ.title || `Challenge ${activeQIdx + 1}`}
            </span>
          </div>
          {currentQ.language && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 6,
                background: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#38bdf8",
              }}
            >
              {currentQ.language}
            </span>
          )}
        </div>

        {/* Buggy Code block */}
        <div className={styles.codeBlock}>
          <pre className={styles.codePre}>{currentQ.code || "// No code available"}</pre>
        </div>

        {/* Bug description */}
        {currentQ.bug_description && (
          <div className={styles.bugDesc}>
            <span>🐛</span>
            <span>{currentQ.bug_description}</span>
          </div>
        )}

        {/* Hint */}
        {currentQ.hint && (
          <div className={styles.hintBox}>
            <span className={styles.hintIcon}>💡</span>
            <span>{currentQ.hint}</span>
          </div>
        )}

        {/* Fix options */}
        {currentQ.options && currentQ.options.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255, 255, 255, 0.7)" }}>
              Select the correct fix:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {currentQ.options.map((opt, oi) => {
                const isSelected = selectedOption === oi;
                return (
                  <div
                    key={`opt-d-${activeQIdx}-${oi}`}
                    onClick={() => {
                      if (!isCurrentSolved) setSelectedOption(oi);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (!isCurrentSolved) setSelectedOption(oi);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      border: isSelected ? "1px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.08)",
                      cursor: isCurrentSolved ? "default" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: isSelected ? "2px solid #818cf8" : "2px solid rgba(255, 255, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8" }} />
                      )}
                    </div>
                    <code style={{ fontSize: 13, fontFamily: "monospace", color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.8)" }}>
                      {opt}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit button for this question */}
        <div style={{ marginTop: 6 }}>
          {isCurrentSolved ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderRadius: 10,
                background: "rgba(52, 211, 153, 0.12)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "#34d399",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span>✅ Question {activeQIdx + 1} Error Resolved!</span>
              <button
                type="button"
                onClick={() => {
                  const nextUnsolved = questions.findIndex((_, i) => !r3Solved.includes(i));
                  if (nextUnsolved !== -1) setActiveQIdx(nextUnsolved);
                  else setActiveQIdx((activeQIdx + 1) % questions.length);
                }}
                style={{
                  background: "rgba(52, 211, 153, 0.2)",
                  border: "1px solid rgba(52, 211, 153, 0.4)",
                  color: "#fff",
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Next Question →
              </button>
            </div>
          ) : (
            <button
              className={styles.submitBtn}
              onClick={() => {
                if (selectedOption !== null) {
                  onSubmitQuestion(activeQIdx, String(selectedOption));
                }
              }}
              disabled={submitting || selectedOption === null}
              style={{ width: "100%" }}
            >
              {submitting
                ? "Validating Fix..."
                : selectedOption === null
                ? "Select a fix above to submit"
                : `Submit Fix for Question ${activeQIdx + 1} →`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TechQuizRound({
  round,
  mcqAnswers,
  setMcqAnswers,
}: {
  round: TechRelayRound;
  mcqAnswers: number[];
  setMcqAnswers: (v: number[]) => void;
}) {
  const content = parseContent<{
    target_required?: number;
    questions?: Array<{ question: string; options: string[] }>;
  }>(round.content);

  const rawQuestions = content?.questions || [];
  const questions = rawQuestions.length >= 10 ? rawQuestions : [
    {
      question: "What is the return type of type(None) in Python?",
      options: ["<class 'NoneType'>", "<class 'null'>", "<class 'void'>", "<class 'undefined'>"],
      correct: 0,
    },
    {
      question: "Which data structure operates strictly on a LIFO (Last In, First Out) principle?",
      options: ["Queue", "Stack", "Array", "Hash Table"],
      correct: 1,
    },
    {
      question: "What is the average time complexity of searching an element in a balanced Binary Search Tree?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      correct: 2,
    },
    {
      question: "Which HTTP status code officially signifies 'Unauthorized' access?",
      options: ["403 Forbidden", "401 Unauthorized", "400 Bad Request", "404 Not Found"],
      correct: 1,
    },
    {
      question: "In SQL, which keyword is used to eliminate duplicate rows from a query result?",
      options: ["UNIQUE", "DISTINCT", "DIFFERENT", "FILTER"],
      correct: 1,
    },
    {
      question: "Which JavaScript equality operator checks both value and type without coercion?",
      options: ["==", "===", "!=", "=:"],
      correct: 1,
    },
    {
      question: "Which of the following is NOT a standard valid IP protocol version?",
      options: ["IPv4", "IPv6", "IPv5", "All of these are standard"],
      correct: 2,
    },
    {
      question: "In Git, which command creates a new branch and immediately switches to it?",
      options: ["git branch -n <name>", "git checkout -b <name>", "git fetch -new <name>", "git push -b <name>"],
      correct: 1,
    },
    {
      question: "Which clause in a Python try...except...finally block ALWAYS executes regardless of exceptions?",
      options: ["except", "else", "finally", "pass"],
      correct: 2,
    },
    {
      question: "In a relational database table, which key uniquely identifies each record in the table?",
      options: ["Foreign Key", "Primary Key", "Candidate Index", "Composite View"],
      correct: 1,
    },
  ];

  const answeredCount = mcqAnswers.filter((a) => a !== -1).length;

  function handleSelect(qIndex: number, optionIndex: number) {
    const updated = [...mcqAnswers];
    updated[qIndex] = optionIndex;
    setMcqAnswers(updated);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Round 4 Requirement Notice */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.5px" }}>
            ROUND 4: TECHNICAL MCQ CHALLENGE (POOL OF 10 MCQs)
          </div>
          <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>
            Must answer at least <span style={{ color: "#34d399", fontWeight: 800 }}>4 questions correctly</span> to unlock the Final Round
          </div>
        </div>
        <div
          style={{
            padding: "5px 14px",
            borderRadius: 20,
            background: answeredCount === questions.length ? "rgba(52, 211, 153, 0.2)" : "rgba(255, 255, 255, 0.06)",
            border: answeredCount === questions.length ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 12,
            fontWeight: 700,
            color: answeredCount === questions.length ? "#34d399" : "rgba(255, 255, 255, 0.6)",
          }}
        >
          {answeredCount} / {questions.length} Answered
        </div>
      </div>

      {/* 10 Questions List */}
      <div className={styles.mcqList}>
        {questions.map((q, qi) => (
          <div key={`mcq-${round.round_number}-${qi}`} className={styles.mcqQuestion}>
            <p className={styles.mcqQuestionText}>
              <span style={{ color: "#818cf8", fontWeight: 800, marginRight: 6 }}>{qi + 1}.</span>
              {q.question}
            </p>
            <div className={styles.mcqOptions}>
              {q.options.map((opt, oi) => {
                const isSelected = mcqAnswers[qi] === oi;
                return (
                  <div
                    key={`opt-${round.round_number}-${qi}-${oi}`}
                    className={`${styles.mcqOption} ${isSelected ? styles.mcqOptionSelected : ""}`}
                    onClick={() => handleSelect(qi, oi)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleSelect(qi, oi);
                    }}
                  >
                    <div className={`${styles.mcqRadio} ${isSelected ? styles.mcqRadioSelected : ""}`}>
                      {isSelected && <div className={styles.mcqRadioDot} />}
                    </div>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function TechRelayPage() {
  const router = useRouter();
  const [rounds, setRounds] = useState<TechRelayRound[]>([]);
  const [progress, setProgress] = useState<TechRelayProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRound, setActiveRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Round 1 and Round 3 state
  const [r1Answer, setR1Answer] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tech_relay_r1_answer") || "";
    }
    return "";
  });
  const [r3Solved, setR3Solved] = useState<number[]>([]);

  // Input states
  const [textAnswer, setTextAnswer] = useState("");
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);

  // AntiCheat state
  const [warningCount, setWarningCount] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const { isFullscreen, enter: enterFullscreen } = useFullscreen();

  // Start Gate state (code: "Meet")
  const [startCode, setStartCode] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  // Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleAutoSubmit = useCallback(() => {
    setIsTerminated(true);
    setFeedback({
      type: "error",
      message: "⚠️ Challenge Terminated: Auto-submitted due to repeated security violations (tab switch, window blur, or unauthorized shortcuts)."
    });
  }, []);

  const handleStartRelay = async () => {
    if (!startCode.trim() || starting) return;
    setStartError("");
    setStarting(true);
    try {
      const res = await startTechRelay(startCode.trim());
      if (res.success) {
        setIsTerminated(false);
        setWarningCount(0);
        setProgress((prev) => ({
          current_round: res.current_round || 1,
          current_question_index: 0,
          rounds_completed: prev?.rounds_completed || [],
          is_completed: res.is_completed || false,
          started_at: res.started_at,
          completed_at: prev?.completed_at || null,
        }));
        setActiveRound(res.current_round || 1);
        setCurrentQuestionIndex(0);
        try {
          enterFullscreen();
        } catch {
          // ignore
        }
      } else {
        setStartError(res.message || "Failed to start challenge");
      }
    } catch (err: any) {
      const msg = err?.detail || err?.message || "Invalid start code. Please enter 'Meet' to start.";
      setStartError(msg);
    } finally {
      setStarting(false);
    }
  };

  // ── Load Data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [roundsData, progressData] = await Promise.all([
        fetchTechRelayConfig(),
        fetchTechRelayProgress(),
      ]);
      setRounds(roundsData);
      setProgress(progressData);

      // Hydrate Round 1 answer and Round 3 solved from progress or localStorage
      if (progressData?.r1_answer) {
        setR1Answer(progressData.r1_answer);
        if (typeof window !== "undefined") {
          localStorage.setItem("tech_relay_r1_answer", progressData.r1_answer);
        }
      } else if (typeof window !== "undefined") {
        const cached = localStorage.getItem("tech_relay_r1_answer");
        if (cached) setR1Answer(cached);
      }

      if (progressData?.r3_solved && Array.isArray(progressData.r3_solved)) {
        setR3Solved(progressData.r3_solved);
      }

      // Check if student has not started or was reset
      const hasStartedProg = Boolean(
        progressData?.started_at ||
        (progressData?.rounds_completed && progressData.rounds_completed.length > 0) ||
        (progressData?.current_round && progressData.current_round > 1)
      );
      if (!hasStartedProg) {
        setIsTerminated(false);
        setWarningCount(0);
      }

      // Set active round and sub-question index to current progress
      const currentRound = progressData.current_round || 1;
      setActiveRound(Math.min(currentRound, 5));
      setCurrentQuestionIndex(progressData.current_question_index || 0);
    } catch (e) {
      console.error("Failed to load Tech Relay:", e);
      setError("Failed to load Tech Relay. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sync MCQ Answer slots whenever active round is MCQ (Round 4) ─────────
  useEffect(() => {
    const currentCfg = rounds.find((r) => r.round_number === activeRound);
    if (currentCfg && currentCfg.round_type === "mcq") {
      const content = parseContent<{ questions?: unknown[] }>(currentCfg.content);
      const qCount = content?.questions?.length || 10;
      setMcqAnswers((prev) => (prev.length === qCount ? prev : new Array(qCount).fill(-1)));
    } else {
      setMcqAnswers([]);
    }
  }, [activeRound, rounds]);

  useEffect(() => {
    const token = localStorage.getItem("exam_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [loadData, router]);

  // ── Submit Handler ───────────────────────────────────────────
  async function handleSubmit(overrideAnswer?: string, overrideQIdx?: number) {
    if (submitting || isTerminated) return;
    setFeedback(null);
    setSubmitting(true);

    const currentRoundConfig = rounds.find(r => r.round_number === activeRound);
    if (!currentRoundConfig) {
      setFeedback({ type: "error", message: "Round not configured" });
      setSubmitting(false);
      return;
    }

    let answer = typeof overrideAnswer === "string" ? overrideAnswer : textAnswer;
    const targetQIdx = typeof overrideQIdx === "number" ? overrideQIdx : currentQuestionIndex;

    if (currentRoundConfig.round_type === "mcq") {
      const content = parseContent<{ questions?: unknown[] }>(currentRoundConfig.content);
      const qCount = content?.questions?.length || 10;
      if (mcqAnswers.length < qCount || mcqAnswers.some((a) => a === -1)) {
        setFeedback({ type: "error", message: `Please select an answer for all ${qCount} questions before submitting!` });
        setSubmitting(false);
        return;
      }
      answer = JSON.stringify({ answers: mcqAnswers });
    }

    if (!answer.trim()) {
      setFeedback({ type: "error", message: "Please enter your answer" });
      setSubmitting(false);
      return;
    }

    try {
      const result = await submitTechRelayRound(activeRound, answer, targetQIdx);

      if (result.success) {
        setFeedback({ type: "success", message: result.message });
        setTextAnswer("");

        if (result.r1_answer) {
          setR1Answer(result.r1_answer);
          if (typeof window !== "undefined") {
            localStorage.setItem("tech_relay_r1_answer", result.r1_answer);
          }
        }
        if (result.r3_solved) {
          setR3Solved(result.r3_solved);
        }

        if (result.round_cleared === false) {
          // Solved sub-question in this round
          const nextQ = result.next_question_index ?? (targetQIdx + 1);
          setCurrentQuestionIndex(nextQ);
          setTimeout(() => setFeedback(null), 2500);
        } else {
          // Entire round cleared!
          setCurrentQuestionIndex(0);

          if (result.is_completed) {
            setShowConfetti(true);
            const updatedProgress = await fetchTechRelayProgress();
            setProgress(updatedProgress);
          } else if (result.next_round) {
            setTimeout(async () => {
              setActiveRound(result.next_round as number);
              setFeedback(null);
              setTextAnswer("");
              setMcqAnswers(prev => prev.map(() => -1));
              const updatedProgress = await fetchTechRelayProgress();
              setProgress(updatedProgress);
              if (updatedProgress?.r1_answer) {
                setR1Answer(updatedProgress.r1_answer);
                if (typeof window !== "undefined") {
                  localStorage.setItem("tech_relay_r1_answer", updatedProgress.r1_answer);
                }
              }
              if (updatedProgress?.r3_solved) {
                setR3Solved(updatedProgress.r3_solved);
              }
            }, 1200);
          }
        }
      } else {
        setFeedback({ type: "error", message: result.message });
      }
    } catch {
      setFeedback({ type: "error", message: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render States ────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading Tech Relay...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
            ← Back
          </button>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚡</div>
          <h2 className={styles.errorTitle}>Connection Error</h2>
          <p className={styles.errorText}>{error}</p>
        </div>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
            ← Back
          </button>
          <h1 className={styles.title}>Tech Relay</h1>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>🚧</div>
          <h2 className={styles.errorTitle}>Coming Soon</h2>
          <p className={styles.errorText}>The Tech Relay challenge hasn&#39;t been configured yet. Check back later!</p>
        </div>
      </div>
    );
  }

  const currentRound = progress?.current_round || 1;
  const isCompleted = progress?.is_completed || false;
  const roundsCompleted = progress?.rounds_completed || [];

  // ── Completion Screen ────────────────────────────────────────
  if (isCompleted) {
    const totalAttempts = roundsCompleted.reduce((sum, r) => sum + (r.attempts || 1), 0);
    return (
      <div className={styles.container}>
        <Confetti active={showConfetti} />
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
            ← Dashboard
          </button>
        </div>
        <div className={styles.completionContainer}>
          <div className={styles.trophyIcon}>🏆</div>
          <h1 className={styles.completionTitle}>Relay Complete!</h1>
          <p className={styles.completionSubtitle}>
            You&#39;ve conquered all 5 rounds of the Tech Relay challenge
          </p>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <p className={styles.statValue}>5/5</p>
              <p className={styles.statLabel}>Rounds Cleared</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{totalAttempts}</p>
              <p className={styles.statLabel}>Total Attempts</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>✓</p>
              <p className={styles.statLabel}>All Passed</p>
            </div>
          </div>
          <button className={styles.submitBtn} onClick={() => router.push("/dashboard")}>
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Start Code Gate ──────────────────────────────────────────
  const hasStarted = Boolean(
    progress?.started_at ||
    (progress?.rounds_completed && progress.rounds_completed.length > 0) ||
    (progress?.current_round && progress.current_round > 1)
  );

  if (!hasStarted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
            ← Dashboard
          </button>
        </div>

        <div className={styles.startGateCard}>
          <div className={styles.startGateIcon}>🏁</div>
          <h1 className={styles.startGateTitle}>Tech Relay Challenge Gate</h1>
          <p className={styles.startGateSubtitle}>
            Enter the tournament access code to unlock Round 1 and begin the challenge.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartRelay();
            }}
            style={{ width: "100%", maxWidth: 360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input
              type="text"
              placeholder="Enter Start Code..."
              value={startCode}
              onChange={(e) => {
                setStartCode(e.target.value);
                if (startError) setStartError("");
              }}
              className={styles.startGateInput}
              autoFocus
              autoComplete="off"
              disabled={starting}
            />

            {startError && (
              <div className={`${styles.feedback} ${styles.feedbackError}`} style={{ margin: "0 auto", width: "100%" }}>
                <span>❌</span>
                <span>{startError}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.startGateBtn}
              disabled={starting || !startCode.trim()}
            >
              {starting ? "Verifying..." : "🚀 Unlock & Start Challenge"}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "12px 18px", borderRadius: 10, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.07)", fontSize: 12, color: "rgba(255, 255, 255, 0.4)" }}>
            ℹ️ Entering the start code will record your official entry on the tournament live monitor and begin your challenge (No time limit).
          </div>
        </div>
      </div>
    );
  }

  // ── Active Round ─────────────────────────────────────────────
  const activeRoundConfig = rounds.find(r => r.round_number === activeRound);
  const isRoundAccessible = activeRound <= currentRound;

  return (
    <div className={styles.container}>
      <AntiCheat
        isSubmitted={isCompleted || isTerminated}
        examName="Tech Relay"
        onAutoSubmit={handleAutoSubmit}
        onWarningUpdate={(count) => {
          setWarningCount(count);
          if (count < 3) {
            setIsTerminated(false);
          }
        }}
      />
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/dashboard")}>
          ← Back
        </button>
        <h1 className={styles.title}>Tech Relay</h1>
        <p className={styles.subtitle}>Complete all 5 rounds to conquer the challenge</p>

        {/* Anti-Cheat Telemetry Badge */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            background: warningCount > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(52, 211, 153, 0.1)",
            border: warningCount > 0 ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(52, 211, 153, 0.3)",
            color: warningCount > 0 ? "#f87171" : "#34d399",
            letterSpacing: "0.3px"
          }}>
            <span>{warningCount > 0 ? "🚨" : "🛡️"}</span>
            <span>{warningCount > 0 ? `STRIKE ${warningCount} OF 3` : "ANTI-CHEAT SHIELD ACTIVE"}</span>
          </div>

          {!isFullscreen && (
            <button
              onClick={() => enterFullscreen()}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#a5b4fc",
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.2s"
              }}
            >
              <span>⛶</span> Enter Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressTrack}>
          <div className={styles.progressLine}>
            <div
              className={styles.progressLineFill}
              style={{ width: `${((currentRound - 1) / 4) * 100}%` }}
            />
          </div>
          {[1, 2, 3, 4, 5].map(num => {
            const isComplete = num < currentRound;
            const isCurrent = num === currentRound;
            const roundConfig = rounds.find(r => r.round_number === num);
            const dotClass = isComplete ? styles.dotCompleted
              : isCurrent ? styles.dotActive
              : styles.dotLocked;
            const labelClass = isComplete ? styles.labelCompleted
              : isCurrent ? styles.labelActive
              : styles.labelLocked;

            return (
              <div
                key={`progress-${num}`}
                className={styles.progressNode}
                onClick={() => {
                  if (num <= currentRound) {
                    setActiveRound(num);
                    setFeedback(null);
                    setTextAnswer("");
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && num <= currentRound) {
                    setActiveRound(num);
                    setFeedback(null);
                    setTextAnswer("");
                  }
                }}
              >
                <div className={`${styles.progressDot} ${dotClass}`}>
                  {isComplete ? "✓" : num}
                </div>
                <span className={`${styles.progressLabel} ${labelClass}`}>
                  {roundConfig?.round_title || `Round ${num}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Round Content */}
      {isTerminated ? (
        <div className={styles.roundContainer}>
          <div className={styles.roundCard} style={{ textAlign: "center", borderColor: "rgba(239, 68, 68, 0.4)", background: "rgba(239, 68, 68, 0.05)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>
              Challenge Terminated
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", maxWidth: 500, margin: "0 auto 20px", lineHeight: 1.6 }}>
              The Tech Relay challenge has been automatically terminated due to repeated anti-cheat violations (tab switching, window blur, or prohibited shortcuts).
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", margin: "0 auto", maxWidth: 460 }}>
              <button
                className={styles.submitBtn}
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #6366f1)",
                  padding: "12px 24px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: 10,
                  border: "none",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flex: "1 1 200px"
                }}
                onClick={() => {
                  loadData();
                  window.location.reload();
                }}
              >
                <span>🔄</span> Refresh / Check Status
              </button>
              <button
                className={styles.submitBtn}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  borderRadius: 10,
                  color: "#fff",
                  flex: "1 1 180px"
                }}
                onClick={() => router.push("/dashboard")}
              >
                ← Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : !isRoundAccessible || !activeRoundConfig ? (
        <div className={styles.lockedOverlay}>
          <div className={styles.lockIcon}>🔒</div>
          <h2 className={styles.lockedTitle}>Round Locked</h2>
          <p className={styles.lockedText}>Complete Round {currentRound} to unlock this stage</p>
        </div>
      ) : (
        <div className={styles.roundContainer}>
          <div className={styles.roundCard}>
            {/* Round Header */}
            <div className={styles.roundHeader}>
              <div className={`${styles.roundIcon} ${ROUND_CSS[activeRoundConfig.round_type] || ""}`}>
                {ROUND_ICONS[activeRoundConfig.round_type] || "❓"}
              </div>
              <div className={styles.roundTitleGroup}>
                <p className={styles.roundNumber}>Round {activeRound} of 5</p>
                <h2 className={styles.roundTitle}>{activeRoundConfig.round_title}</h2>
              </div>
            </div>

            {/* Sub-Question Navigation / Tracker */}
            {(() => {
              if (activeRound >= 2) return null;
              const activeContent = parseContent<{ questions?: unknown[] }>(activeRoundConfig?.content);
              const subQuestionsCount = activeContent?.questions && Array.isArray(activeContent.questions)
                ? activeContent.questions.length
                : 1;

              if (subQuestionsCount <= 1) return null;

              return (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "10px 16px",
                  borderRadius: 12,
                  marginBottom: 20,
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
                    Question {currentQuestionIndex + 1} of {subQuestionsCount}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {Array.from({ length: subQuestionsCount }).map((_, idx) => (
                      <div
                        key={`subdot-${idx}`}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          background: idx < currentQuestionIndex ? "rgba(52, 211, 153, 0.2)" : idx === currentQuestionIndex ? "var(--accent, #6366f1)" : "rgba(255,255,255,0.06)",
                          color: idx < currentQuestionIndex ? "#34d399" : idx === currentQuestionIndex ? "#fff" : "rgba(255,255,255,0.4)",
                          border: idx === currentQuestionIndex ? "1px solid #818cf8" : "none"
                        }}
                      >
                        {idx < currentQuestionIndex ? "✓" : idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Round-Specific Content */}
            {activeRound === 1 && (
              <GadgetRound
                round={activeRoundConfig}
                subIndex={currentQuestionIndex}
                answer={textAnswer}
                setAnswer={setTextAnswer}
              />
            )}
            {activeRound === 2 && (
              <PasswordGateRound
                r1Answer={r1Answer}
                answer={textAnswer}
                setAnswer={setTextAnswer}
                onSubmit={() => handleSubmit()}
                submitting={submitting}
              />
            )}
            {activeRound === 3 && (
              <FindCodeErrorRound
                round={activeRoundConfig}
                r3Solved={r3Solved}
                onSubmitQuestion={(qIdx, fixAns) => handleSubmit(fixAns, qIdx)}
                submitting={submitting}
              />
            )}
            {activeRound === 4 && (
              <TechQuizRound
                round={activeRoundConfig}
                mcqAnswers={mcqAnswers}
                setMcqAnswers={setMcqAnswers}
              />
            )}
            {activeRound === 5 && (
              <CrackPasswordRound
                round={activeRoundConfig}
                subIndex={currentQuestionIndex}
                answer={textAnswer}
                setAnswer={setTextAnswer}
                onSubmit={(finalKey) => handleSubmit(finalKey)}
                isSubmitting={submitting}
              />
            )}

            {/* Bottom Submit Button (for Round 1 and Round 4; Rounds 2, 3, 5 have their own action buttons) */}
            {activeRound === currentRound && (activeRound === 1 || activeRound === 4) && (
              <div className={styles.inputGroup} style={{ marginTop: 20 }}>
                <button
                  className={styles.submitBtn}
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting
                    ? "Checking..."
                    : activeRound === 4
                    ? "Submit Tech Quiz (10 MCQs) →"
                    : "Submit Gadget Name →"}
                </button>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`${styles.feedback} ${feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError}`}>
                <span>{feedback.type === "success" ? "✅" : "❌"}</span>
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
