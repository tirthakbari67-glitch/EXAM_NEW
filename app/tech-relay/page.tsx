/* react-doctor-disable label-has-associated-control, no-inline-exhaustive-style, rendering-hydration-mismatch-time, no-tiny-text, design-no-bold-heading, rerender-state-only-in-handlers, no-array-index-as-key, react-compiler-destructure-method, click-events-have-key-events, no-static-element-interactions, prefer-useReducer, no-large-animated-blur, no-giant-component, nextjs-no-img-element, no-transition-all, use-lazy-motion, rerender-functional-setstate, no-cascading-set-state, design-no-three-period-ellipsis, js-combine-iterations, client-localstorage-no-version, no-z-index-9999, js-cache-storage, nextjs-no-client-side-redirect, no-wide-letter-spacing, react-doctor/label-has-associated-control, react-doctor/no-inline-exhaustive-style, react-doctor/rendering-hydration-mismatch-time, react-doctor/no-tiny-text, react-doctor/design-no-bold-heading, react-doctor/rerender-state-only-in-handlers, react-doctor/no-array-index-as-key, react-doctor/react-compiler-destructure-method, react-doctor/click-events-have-key-events, react-doctor/no-static-element-interactions, react-doctor/prefer-useReducer, react-doctor/no-large-animated-blur, react-doctor/no-giant-component, react-doctor/nextjs-no-img-element, react-doctor/no-transition-all, react-doctor/use-lazy-motion, react-doctor/rerender-functional-setstate, react-doctor/no-cascading-set-state, react-doctor/design-no-three-period-ellipsis, react-doctor/js-combine-iterations, react-doctor/client-localstorage-no-version, react-doctor/no-z-index-9999, react-doctor/js-cache-storage, react-doctor/nextjs-no-client-side-redirect, react-doctor/no-wide-letter-spacing */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AntiCheat from "@/components/AntiCheat";
import { useFullscreen } from "@/hooks/useFullscreen";
import {
  fetchTechRelayConfig,
  fetchTechRelayProgress,
  submitTechRelayRound,
  type TechRelayRound,
  type TechRelayProgress,
} from "@/lib/api";
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

function GadgetRound({ round, answer, setAnswer }: {
  round: TechRelayRound; answer: string; setAnswer: (v: string) => void;
}) {
  const content = parseContent<{ clues?: Array<{ letter: string; clue: string }> }>(round.content);
  const clues = content?.clues || [];

  return (
    <>
      <div className={styles.cluesGrid}>
        {clues.map((c, i) => (
          <div key={`clue-${round.round_number}-${i}`} className={styles.clueCard}>
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

function PuzzleRound({ round, answer, setAnswer }: {
  round: TechRelayRound; answer: string; setAnswer: (v: string) => void;
}) {
  const content = parseContent<{ problem_statement?: string; hint?: string }>(round.content);

  return (
    <>
      <div className={styles.puzzleStatement}>
        {content?.problem_statement || "No puzzle configured"}
      </div>
      {content?.hint && (
        <div className={styles.hintBox}>
          <span className={styles.hintIcon}>💡</span>
          <span>{content.hint}</span>
        </div>
      )}
      <div className={styles.inputGroup}>
        <input
          className={styles.answerInput}
          type="text"
          placeholder="Enter your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoComplete="off"
        />
      </div>
    </>
  );
}

function DebugRound({ round, answer, setAnswer }: {
  round: TechRelayRound; answer: string; setAnswer: (v: string) => void;
}) {
  const content = parseContent<{ code?: string; bug_description?: string; hint?: string; language?: string }>(round.content);

  return (
    <>
      <div className={styles.codeBlock}>
        <pre className={styles.codePre}>{content?.code || "// No code provided"}</pre>
      </div>
      {content?.bug_description && (
        <div className={styles.bugDesc}>
          <span>🐛</span>
          <span>{content.bug_description}</span>
        </div>
      )}
      {content?.hint && (
        <div className={styles.hintBox}>
          <span className={styles.hintIcon}>💡</span>
          <span>{content.hint}</span>
        </div>
      )}
      <div className={styles.inputGroup}>
        <input
          className={styles.answerInput}
          type="text"
          placeholder="Enter the fix or corrected line..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoComplete="off"
        />
      </div>
    </>
  );
}

function McqRound({ round, mcqAnswers, setMcqAnswers }: {
  round: TechRelayRound;
  mcqAnswers: number[];
  setMcqAnswers: (v: number[]) => void;
}) {
  const content = parseContent<{ questions?: Array<{ question: string; options: string[] }> }>(round.content);
  const questions = content?.questions || [];

  function handleSelect(qIndex: number, optionIndex: number) {
    const updated = [...mcqAnswers];
    updated[qIndex] = optionIndex;
    setMcqAnswers(updated);
  }

  return (
    <div className={styles.mcqList}>
      {questions.map((q, qi) => (
        <div key={`mcq-${round.round_number}-${qi}`} className={styles.mcqQuestion}>
          <p className={styles.mcqQuestionText}>
            {qi + 1}. {q.question}
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
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect(qi, oi); }}
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
  );
}

function PasswordRound({ round, answer, setAnswer }: {
  round: TechRelayRound; answer: string; setAnswer: (v: string) => void;
}) {
  const content = parseContent<{ cipher_text?: string; cipher_type?: string; hint?: string }>(round.content);

  return (
    <>
      <div className={styles.cipherDisplay}>
        <p className={styles.cipherLabel}>Encrypted Message</p>
        <p className={styles.cipherText}>{content?.cipher_text || "???"}</p>
        {content?.cipher_type && (
          <p className={styles.cipherType}>Cipher: {content.cipher_type}</p>
        )}
      </div>
      {content?.hint && (
        <div className={styles.hintBox}>
          <span className={styles.hintIcon}>💡</span>
          <span>{content.hint}</span>
        </div>
      )}
      <div className={styles.inputGroup}>
        <input
          className={styles.answerInput}
          type="text"
          placeholder="Enter the decoded password..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoComplete="off"
        />
      </div>
    </>
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

  // Input states
  const [textAnswer, setTextAnswer] = useState("");
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);

  // AntiCheat state
  const [warningCount, setWarningCount] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const { isFullscreen, enter: enterFullscreen } = useFullscreen();

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

  // ── Load Data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [roundsData, progressData] = await Promise.all([
        fetchTechRelayConfig(),
        fetchTechRelayProgress(),
      ]);
      setRounds(roundsData);
      setProgress(progressData);

      // Set active round to current progress
      const currentRound = progressData.current_round || 1;
      setActiveRound(Math.min(currentRound, 5));

      // Init MCQ answers if round 4 is active
      const r4 = roundsData.find(r => r.round_number === 4);
      if (r4) {
        const content = parseContent<{ questions?: unknown[] }>(r4.content);
        const qCount = content?.questions?.length || 0;
        setMcqAnswers(new Array(qCount).fill(-1));
      }
    } catch (e) {
      console.error("Failed to load Tech Relay:", e);
      setError("Failed to load Tech Relay. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("exam_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [loadData, router]);

  // ── Submit Handler ───────────────────────────────────────────
  async function handleSubmit() {
    if (submitting || isTerminated) return;
    setFeedback(null);
    setSubmitting(true);

    const currentRoundConfig = rounds.find(r => r.round_number === activeRound);
    if (!currentRoundConfig) {
      setFeedback({ type: "error", message: "Round not configured" });
      setSubmitting(false);
      return;
    }

    let answer = textAnswer;
    if (currentRoundConfig.round_type === "mcq") {
      answer = JSON.stringify({ answers: mcqAnswers });
    }

    if (!answer.trim()) {
      setFeedback({ type: "error", message: "Please enter your answer" });
      setSubmitting(false);
      return;
    }

    try {
      const result = await submitTechRelayRound(activeRound, answer);

      if (result.success) {
        setFeedback({ type: "success", message: result.message });
        setTextAnswer("");

        if (result.is_completed) {
          setShowConfetti(true);
          // Reload progress
          const updatedProgress = await fetchTechRelayProgress();
          setProgress(updatedProgress);
        } else if (result.next_round) {
          // Move to next round after a short delay
          setTimeout(async () => {
            setActiveRound(result.next_round as number);
            setFeedback(null);
            setTextAnswer("");
            setMcqAnswers(prev => prev.map(() => -1));
            const updatedProgress = await fetchTechRelayProgress();
            setProgress(updatedProgress);
          }, 1500);
        }
      } else {
        setFeedback({ type: "error", message: result.message });
      }
    } catch (e) {
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

  // ── Active Round ─────────────────────────────────────────────
  const activeRoundConfig = rounds.find(r => r.round_number === activeRound);
  const isRoundAccessible = activeRound <= currentRound;

  return (
    <div className={styles.container}>
      <AntiCheat
        isSubmitted={isCompleted || isTerminated}
        examName="Tech Relay"
        onAutoSubmit={handleAutoSubmit}
        onWarningUpdate={(count) => setWarningCount(count)}
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
            <button className={styles.submitBtn} style={{ background: "rgba(255, 255, 255, 0.1)", maxWidth: 260, margin: "0 auto" }} onClick={() => router.push("/dashboard")}>
              ← Return to Dashboard
            </button>
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

            {/* Round-Specific Content */}
            {activeRoundConfig.round_type === "gadget" && (
              <GadgetRound round={activeRoundConfig} answer={textAnswer} setAnswer={setTextAnswer} />
            )}
            {activeRoundConfig.round_type === "puzzle" && (
              <PuzzleRound round={activeRoundConfig} answer={textAnswer} setAnswer={setTextAnswer} />
            )}
            {activeRoundConfig.round_type === "debug" && (
              <DebugRound round={activeRoundConfig} answer={textAnswer} setAnswer={setTextAnswer} />
            )}
            {activeRoundConfig.round_type === "mcq" && (
              <McqRound round={activeRoundConfig} mcqAnswers={mcqAnswers} setMcqAnswers={setMcqAnswers} />
            )}
            {activeRoundConfig.round_type === "password" && (
              <PasswordRound round={activeRoundConfig} answer={textAnswer} setAnswer={setTextAnswer} />
            )}

            {/* Submit Button */}
            {activeRound === currentRound && (
              <div className={styles.inputGroup}>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Checking..." : `Submit Round ${activeRound}`}
                  {!submitting && <span>→</span>}
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
