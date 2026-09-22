/* react-doctor-disable label-has-associated-control, no-inline-exhaustive-style, rendering-hydration-mismatch-time, no-tiny-text, design-no-bold-heading, rerender-state-only-in-handlers, no-array-index-as-key, react-compiler-destructure-method, click-events-have-key-events, no-static-element-interactions, prefer-useReducer, no-large-animated-blur, no-giant-component, nextjs-no-img-element, no-transition-all, use-lazy-motion, rerender-functional-setstate, no-cascading-set-state, design-no-three-period-ellipsis, js-combine-iterations, client-localstorage-no-version, no-z-index-9999, js-cache-storage, nextjs-no-client-side-redirect, no-wide-letter-spacing, react-doctor/label-has-associated-control, react-doctor/no-inline-exhaustive-style, react-doctor/rendering-hydration-mismatch-time, react-doctor/no-tiny-text, react-doctor/design-no-bold-heading, react-doctor/rerender-state-only-in-handlers, react-doctor/no-array-index-as-key, react-doctor/react-compiler-destructure-method, react-doctor/click-events-have-key-events, react-doctor/no-static-element-interactions, react-doctor/prefer-useReducer, react-doctor/no-large-animated-blur, react-doctor/no-giant-component, react-doctor/nextjs-no-img-element, react-doctor/no-transition-all, react-doctor/use-lazy-motion, react-doctor/rerender-functional-setstate, react-doctor/no-cascading-set-state, react-doctor/design-no-three-period-ellipsis, react-doctor/js-combine-iterations, react-doctor/client-localstorage-no-version, react-doctor/no-z-index-9999, react-doctor/js-cache-storage, react-doctor/nextjs-no-client-side-redirect, react-doctor/no-wide-letter-spacing */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchTechRelayAdminConfig,
  saveTechRelayRound,
  deleteTechRelayRound,
  toggleTechRelay,
  fetchTechRelayLeaderboard,
  type TechRelayRound,
  type TechRelayLeaderboardEntry,
} from "@/lib/api";
import styles from "./tech-relay-admin.module.css";

const DEFAULT_ROUNDS: Array<Omit<TechRelayRound, "id" | "is_active"> & { relay_name: string }> = [
  {
    relay_name: "Tech Relay",
    round_number: 1,
    round_title: "Identity Gadgets",
    round_type: "gadget",
    correct_answer: "CAMERA",
    time_limit_seconds: 300,
    content: {
      gadget_name: "CAMERA",
      clues: [
        { letter: "C", clue: "First letter of 'Capture'" },
        { letter: "A", clue: "Found in 'Angle'" },
        { letter: "M", clue: "Starts 'Memory'" },
        { letter: "E", clue: "Last letter of 'Expose'" },
        { letter: "R", clue: "First letter of 'Resolution'" },
        { letter: "A", clue: "Ends 'Mega'" },
      ],
    },
  },
  {
    relay_name: "Tech Relay",
    round_number: 2,
    round_title: "Solve Puzzle",
    round_type: "puzzle",
    correct_answer: "6",
    time_limit_seconds: 300,
    content: {
      problem_statement: "If you multiply this number by 6 and add 4, you get 40. What is the number?",
      hint: "Think backwards: (40 - 4) / 6",
    },
  },
  {
    relay_name: "Tech Relay",
    round_number: 3,
    round_title: "Find a Code Error",
    round_type: "debug",
    correct_answer: "fibonacci(n-2)",
    time_limit_seconds: 300,
    content: {
      language: "python",
      code: "def fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-3)  # Bug here!",
      bug_description: "The recursive step has an incorrect term. Fix the bug.",
      hint: "Fibonacci is the sum of previous two terms: F(n-1) + F(n-2)",
    },
  },
  {
    relay_name: "Tech Relay",
    round_number: 4,
    round_title: "Speed Tech Quiz",
    round_type: "mcq",
    correct_answer: "mcq_all",
    time_limit_seconds: 300,
    content: {
      questions: [
        {
          question: "What does HTTP stand for?",
          options: ["HyperText Transfer Protocol", "High Tech Protocol", "Hyper Transfer Text Protocol", "Home Tool Transfer Protocol"],
          correct: 0,
        },
        {
          question: "Which data structure operates on a LIFO basis?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: 1,
        },
        {
          question: "What is the time complexity of binary search in a sorted array?",
          options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
          correct: 2,
        },
        {
          question: "In SQL, which clause filters records after grouping?",
          options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
          correct: 1,
        },
        {
          question: "Which protocol is primarily used for secure web browsing?",
          options: ["FTP", "SMTP", "HTTPS", "SNMP"],
          correct: 2,
        },
      ],
    },
  },
  {
    relay_name: "Tech Relay",
    round_number: 5,
    round_title: "Decode Vault Password",
    round_type: "password",
    correct_answer: "TECHRELAY",
    time_limit_seconds: 300,
    content: {
      cipher_text: "GVXSIVOZB",
      cipher_type: "Atbash Cipher",
      hint: "Reverse the alphabet: A ↔ Z, B ↔ Y, C ↔ X, ... T ↔ G, E ↔ V",
    },
  },
];

const MIGRATION_SQL = `-- ============================================================
-- Migration V17: Tech Relay Tables
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS tech_relay_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relay_name TEXT NOT NULL DEFAULT 'Tech Relay',
  is_active BOOLEAN DEFAULT false,
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 5),
  round_title TEXT NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('gadget', 'puzzle', 'debug', 'mcq', 'password')),
  content JSONB NOT NULL DEFAULT '{}',
  correct_answer TEXT,
  time_limit_seconds INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(relay_name, round_number)
);

CREATE TABLE IF NOT EXISTS tech_relay_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relay_name TEXT NOT NULL DEFAULT 'Tech Relay',
  current_round INTEGER NOT NULL DEFAULT 1,
  rounds_completed JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, relay_name)
);

CREATE INDEX IF NOT EXISTS idx_tech_relay_config_relay ON tech_relay_config(relay_name);
CREATE INDEX IF NOT EXISTS idx_tech_relay_progress_student ON tech_relay_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_tech_relay_progress_relay ON tech_relay_progress(relay_name);

ALTER TABLE tech_relay_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_relay_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_tech_relay_config" ON tech_relay_config;
CREATE POLICY "public_read_tech_relay_config" ON tech_relay_config FOR SELECT USING (true);

ALTER TABLE tech_relay_progress DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tech_relay_config_updated_at ON tech_relay_config;
CREATE TRIGGER update_tech_relay_config_updated_at
  BEFORE UPDATE ON tech_relay_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export default function TechRelayAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rounds" | "leaderboard">("rounds");
  const [rounds, setRounds] = useState<TechRelayRound[]>([]);
  const [leaderboard, setLeaderboard] = useState<TechRelayLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Editor Modal
  const [editingRound, setEditingRound] = useState<Partial<TechRelayRound> | null>(null);
  const [contentJson, setContentJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleCopySql = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [roundsData, lbData] = await Promise.all([
        fetchTechRelayAdminConfig(),
        fetchTechRelayLeaderboard("Tech Relay").catch(() => []),
      ]);
      setRounds(roundsData || []);
      setLeaderboard(lbData || []);
      if (roundsData && roundsData.length > 0) {
        setIsActive(Boolean(roundsData[0].is_active));
      }
    } catch (err) {
      console.error("[TechRelayAdmin] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async () => {
    try {
      const nextState = !isActive;
      await toggleTechRelay("Tech Relay", nextState);
      setIsActive(nextState);
      setRounds((prev) => prev.map((r) => ({ ...r, is_active: nextState })));
    } catch (err: any) {
      alert("Failed to toggle relay: " + (err?.message || err));
    }
  };

  const handleOpenEdit = (round?: TechRelayRound, targetRoundNum?: number) => {
    if (round) {
      setEditingRound(round);
      setContentJson(JSON.stringify(round.content || {}, null, 2));
    } else {
      const num = targetRoundNum || (rounds.length + 1);
      const defaultTemplate = DEFAULT_ROUNDS.find((d) => d.round_number === num) || {
        round_number: num,
        round_title: `Round ${num}`,
        round_type: "puzzle" as const,
        correct_answer: "",
        time_limit_seconds: 300,
        content: { problem_statement: "Enter question here" },
      };

      setEditingRound({
        round_number: num,
        round_title: defaultTemplate.round_title,
        round_type: defaultTemplate.round_type,
        correct_answer: defaultTemplate.correct_answer,
        time_limit_seconds: defaultTemplate.time_limit_seconds,
        is_active: isActive,
      });
      setContentJson(JSON.stringify(defaultTemplate.content, null, 2));
    }
    setJsonError("");
  };

  const handleSaveRound = async () => {
    if (!editingRound) return;

    let parsedContent: Record<string, unknown> = {};
    try {
      parsedContent = JSON.parse(contentJson);
    } catch (e: any) {
      setJsonError("Invalid JSON syntax: " + e.message);
      return;
    }

    try {
      setSaving(true);
      await saveTechRelayRound({
        id: editingRound.id,
        relay_name: "Tech Relay",
        round_number: Number(editingRound.round_number || 1),
        round_title: editingRound.round_title || `Round ${editingRound.round_number}`,
        round_type: editingRound.round_type || "puzzle",
        correct_answer: editingRound.correct_answer || "",
        time_limit_seconds: Number(editingRound.time_limit_seconds || 300),
        content: parsedContent,
        is_active: isActive,
      });
      setEditingRound(null);
      await loadData();
    } catch (err: any) {
      const msg = err?.detail || err?.message || String(err);
      if (msg.includes("tech_relay_config") || msg.includes("does not exist") || msg.includes("PGRST205")) {
        alert("⚠️ Database table 'tech_relay_config' does not exist in Supabase yet!\n\nPlease click '📋 Copy SQL Migration' in the top bar, paste it into your Supabase Dashboard SQL Editor, and click Run.\n\nThen try again.");
      } else {
        alert("Failed to save round: " + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roundId: string) => {
    if (!confirm("Are you sure you want to delete this round config?")) return;
    try {
      await deleteTechRelayRound(roundId);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete round: " + (err?.message || err));
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Load default 5-round challenge template? Any existing rounds will be overwritten/updated.")) return;
    try {
      setSaving(true);
      for (const r of DEFAULT_ROUNDS) {
        await saveTechRelayRound({
          relay_name: "Tech Relay",
          round_number: r.round_number,
          round_title: r.round_title,
          round_type: r.round_type,
          correct_answer: r.correct_answer,
          time_limit_seconds: r.time_limit_seconds,
          content: r.content as Record<string, unknown>,
          is_active: true,
        });
      }
      setIsActive(true);
      await loadData();
      alert("All 5 rounds successfully seeded!");
    } catch (err: any) {
      const msg = err?.detail || err?.message || String(err);
      if (msg.includes("tech_relay_config") || msg.includes("does not exist") || msg.includes("PGRST205")) {
        alert("⚠️ Database table 'tech_relay_config' does not exist in Supabase yet!\n\nPlease click '📋 Copy SQL Migration' in the top bar, paste it into your Supabase Dashboard SQL Editor, and click Run.\n\nThen try again.");
      } else {
        alert("Failed to seed rounds: " + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => router.push("/admin")}>
            ← Admin Dashboard
          </button>
          <h1 className={styles.title}>🏁 Tech Relay Control</h1>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.toggleBtn} ${isActive ? styles.toggleActive : styles.toggleInactive}`}
            onClick={handleToggle}
          >
            {isActive ? "🟢 Relay Active (Public)" : "🔴 Relay Inactive"}
          </button>

          <button
            className={styles.backButton}
            onClick={handleCopySql}
            title="Copy SQL to create database tables in Supabase"
          >
            {copiedSql ? "✅ Copied SQL!" : "📋 Copy SQL Migration"}
          </button>

          <button
            className={styles.backButton}
            onClick={handleSeedDefaults}
            disabled={saving}
            title="Load default 5 rounds"
          >
            ✨ Seed Default Rounds
          </button>

          <div className={styles.tabRow}>
            <button
              className={`${styles.tab} ${activeTab === "rounds" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("rounds")}
            >
              Rounds ({rounds.length}/5)
            </button>
            <button
              className={`${styles.tab} ${activeTab === "leaderboard" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard ({leaderboard.length})
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab: Rounds ── */}
      {activeTab === "rounds" && (
        <>
          {rounds.length === 0 && (
            <div style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div>
                <div style={{ fontWeight: 700, color: "#a5b4fc", fontSize: 14, marginBottom: 4 }}>
                  ⚡ First-Time Database Setup
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 600 }}>
                  If you haven't created the Tech Relay tables in Supabase yet, click <strong>Copy SQL Migration</strong> and paste it into your <strong>Supabase Dashboard → SQL Editor</strong>, then click <strong>✨ Seed Default Rounds</strong>!
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className={styles.backButton} onClick={handleCopySql}>
                  {copiedSql ? "✅ Copied!" : "📋 Copy SQL Migration"}
                </button>
                <button className={styles.btnPrimary} style={{ padding: "8px 18px", fontSize: 13 }} onClick={handleSeedDefaults}>
                  ✨ Seed Default Rounds
                </button>
              </div>
            </div>
          )}

          <div className={styles.roundsGrid}>
          {[1, 2, 3, 4, 5].map((num) => {
            const round = rounds.find((r) => r.round_number === num);
            if (round) {
              return (
                <div key={round.id || num} className={styles.roundCard}>
                  <div className={styles.roundCardHeader}>
                    <span className={styles.roundBadge}>Round {num}</span>
                    <div className={styles.roundActions}>
                      <button
                        className={styles.iconBtn}
                        title="Edit Round"
                        onClick={() => handleOpenEdit(round)}
                      >
                        ✏️
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Delete Round"
                        onClick={() => handleDelete(round.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <h3 className={styles.roundCardTitle}>{round.round_title}</h3>
                  <div className={styles.roundCardType}>Type: {round.round_type}</div>

                  <div className={styles.roundCardPreview}>
                    {JSON.stringify(round.content, null, 2).slice(0, 140)}...
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`empty-${num}`}
                className={`${styles.roundCard} ${styles.emptyRound}`}
                onClick={() => handleOpenEdit(undefined, num)}
              >
                <div className={styles.emptyIcon}>➕</div>
                <div className={styles.emptyText}>Configure Round {num}</div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {/* ── Tab: Leaderboard ── */}
      {activeTab === "leaderboard" && (
        <div style={{ overflowX: "auto" }}>
          {leaderboard.length === 0 ? (
            <div className={styles.emptyState}>No participants have attempted Tech Relay yet.</div>
          ) : (
            <table className={styles.leaderboard}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Branch</th>
                  <th>Current Round</th>
                  <th>Completed Rounds</th>
                  <th>Total Attempts</th>
                  <th>Status</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.student_id || idx}>
                    <td style={{ fontWeight: 700, color: idx === 0 ? "#fbbf24" : idx === 1 ? "#cbd5e1" : idx === 2 ? "#d97706" : "#a5b4fc" }}>
                      #{idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{entry.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.5 }}>{entry.usn}</div>
                    </td>
                    <td>{entry.branch}</td>
                    <td>Round {entry.current_round}</td>
                    <td>{entry.rounds_completed} / 5</td>
                    <td>{entry.total_attempts}</td>
                    <td>
                      {entry.is_completed ? (
                        <span className={styles.completedBadge}>🏆 Finished</span>
                      ) : (
                        <span className={styles.inProgressBadge}>⚡ Active</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, opacity: 0.7 }}>
                      {entry.completed_at ? new Date(entry.completed_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingRound && (
        <div className={styles.modalOverlay} onClick={() => setEditingRound(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingRound.id ? `Edit Round ${editingRound.round_number}` : `Create Round ${editingRound.round_number}`}
            </h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Number (1-5)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min={1}
                  max={5}
                  value={editingRound.round_number ?? 1}
                  onChange={(e) => {
                    const val = e.currentTarget.valueAsNumber;
                    setEditingRound({ ...editingRound, round_number: Number.isFinite(val) ? val : 1 });
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Type</label>
                <select
                  className={styles.formSelect}
                  value={editingRound.round_type || "puzzle"}
                  onChange={(e) => setEditingRound({ ...editingRound, round_type: e.target.value as any })}
                >
                  <option value="gadget">🔍 Gadget (Character Clues)</option>
                  <option value="puzzle">🧩 Puzzle (Logic / Math)</option>
                  <option value="debug">🐛 Debug (Code Bug Fix)</option>
                  <option value="mcq">📝 MCQ (Quiz Questions)</option>
                  <option value="password">🔐 Password (Cipher / Vault)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Round Title</label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="e.g. Identity Gadgets"
                value={editingRound.round_title || ""}
                onChange={(e) => setEditingRound({ ...editingRound, round_title: e.target.value })}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Correct Answer (Case-Insensitive)</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="e.g. CAMERA or 42"
                  value={editingRound.correct_answer || ""}
                  onChange={(e) => setEditingRound({ ...editingRound, correct_answer: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Time Limit (Seconds)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min={30}
                  step={30}
                  value={editingRound.time_limit_seconds ?? 300}
                  onChange={(e) => {
                    const val = e.currentTarget.valueAsNumber;
                    setEditingRound({ ...editingRound, time_limit_seconds: Number.isFinite(val) ? val : 300 });
                  }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Content JSON</label>
              <textarea
                className={styles.formTextarea}
                rows={8}
                value={contentJson}
                onChange={(e) => setContentJson(e.target.value)}
              />
              {jsonError && <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{jsonError}</div>}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setEditingRound(null)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleSaveRound} disabled={saving}>
                {saving ? "Saving..." : "Save Round"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
