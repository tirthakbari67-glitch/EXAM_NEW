/* react-doctor-disable label-has-associated-control, no-inline-exhaustive-style, rendering-hydration-mismatch-time, no-tiny-text, design-no-bold-heading, rerender-state-only-in-handlers, no-array-index-as-key, react-compiler-destructure-method, click-events-have-key-events, no-static-element-interactions, prefer-useReducer, no-large-animated-blur, no-giant-component, nextjs-no-img-element, no-transition-all, use-lazy-motion, rerender-functional-setstate, no-cascading-set-state, design-no-three-period-ellipsis, js-combine-iterations, client-localstorage-no-version, no-z-index-9999, js-cache-storage, nextjs-no-client-side-redirect, no-wide-letter-spacing, react-doctor/label-has-associated-control, react-doctor/no-inline-exhaustive-style, react-doctor/rendering-hydration-mismatch-time, react-doctor/no-tiny-text, react-doctor/design-no-bold-heading, react-doctor/rerender-state-only-in-handlers, react-doctor/no-array-index-as-key, react-doctor/react-compiler-destructure-method, react-doctor/click-events-have-key-events, react-doctor/no-static-element-interactions, react-doctor/prefer-useReducer, react-doctor/no-large-animated-blur, react-doctor/no-giant-component, react-doctor/nextjs-no-img-element, react-doctor/no-transition-all, react-doctor/use-lazy-motion, react-doctor/rerender-functional-setstate, react-doctor/no-cascading-set-state, react-doctor/design-no-three-period-ellipsis, react-doctor/js-combine-iterations, react-doctor/client-localstorage-no-version, react-doctor/no-z-index-9999, react-doctor/js-cache-storage, react-doctor/nextjs-no-client-side-redirect, react-doctor/no-wide-letter-spacing */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchTechRelayAdminConfig,
  saveTechRelayRound,
  deleteTechRelayRound,
  toggleTechRelay,
  fetchTechRelayLeaderboard,
  fetchTechRelayAdminStudents,
  forceUnlockTechRelay,
  resetTechRelayStudent,
  removeTechRelayStudent,
  blockAdminStudent,
  unblockAdminStudent,
  type TechRelayRound,
  type TechRelayLeaderboardEntry,
  type TechRelayParticipant,
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
      questions: [
        {
          id: "g1",
          gadget_name: "CAMERA",
          clues: [
            { letter: "C", clue: "First letter of 'Capture'" },
            { letter: "A", clue: "Found in 'Angle'" },
            { letter: "M", clue: "Starts 'Memory'" },
            { letter: "E", clue: "Last letter of 'Expose'" },
            { letter: "R", clue: "First letter of 'Resolution'" },
            { letter: "A", clue: "Ends 'Mega'" },
          ],
          correct_answer: "CAMERA",
        },
        {
          id: "g2",
          gadget_name: "DRONE",
          clues: [
            { letter: "D", clue: "First letter of 'Device' that flies" },
            { letter: "R", clue: "Found in 'Rotors' that spin" },
            { letter: "O", clue: "Starts 'Orbit' navigation" },
            { letter: "N", clue: "Middle of 'Sensor'" },
            { letter: "E", clue: "Ends 'Altitude'" },
          ],
          correct_answer: "DRONE",
        },
        {
          id: "g3",
          gadget_name: "SMARTWATCH",
          clues: [
            { letter: "S", clue: "First letter of 'Screen' on wrist" },
            { letter: "M", clue: "Tracks daily 'Motion'" },
            { letter: "A", clue: "Found in 'Activity' monitoring" },
            { letter: "R", clue: "Measures heart 'Rate'" },
            { letter: "T", clue: "Tells exact 'Time'" },
            { letter: "W", clue: "Worn on the 'Wrist'" },
            { letter: "A", clue: "First letter of 'Alarm'" },
            { letter: "T", clue: "Responsive to 'Touch'" },
            { letter: "C", clue: "First letter of 'Clock'" },
            { letter: "H", clue: "Monitors overall 'Health'" },
          ],
          correct_answer: "SMARTWATCH",
        },
        {
          id: "g4",
          gadget_name: "ROBOT",
          clues: [
            { letter: "R", clue: "First letter of 'Robotics'" },
            { letter: "O", clue: "Found in 'Automation'" },
            { letter: "B", clue: "Starts 'Bionic' system" },
            { letter: "O", clue: "Found in 'Motor' control" },
            { letter: "T", clue: "Last letter of 'Circuit'" },
          ],
          correct_answer: "ROBOT",
        },
        {
          id: "g5",
          gadget_name: "KEYBOARD",
          clues: [
            { letter: "K", clue: "Press this 'Key' to type" },
            { letter: "E", clue: "Found in 'Enter' key" },
            { letter: "Y", clue: "Found in 'QWERTY' layout" },
            { letter: "B", clue: "First letter of 'Backspace'" },
            { letter: "O", clue: "Found in 'Output' peripheral" },
            { letter: "A", clue: "First letter of 'Alt' key" },
            { letter: "R", clue: "Found in 'Return' key" },
            { letter: "D", clue: "Ends 'Command'" },
          ],
          correct_answer: "KEYBOARD",
        },
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
      questions: [
        {
          id: "p1",
          problem_statement: "If you multiply this number by 6 and add 4, you get 40. What is the number?",
          hint: "Think backwards: (40 - 4) / 6",
          correct_answer: "6",
        },
      ],
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
      questions: [
        {
          id: "d1",
          language: "python",
          code: "def fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n-1) + fibonacci(n-3)  # Bug here!",
          bug_description: "The recursive step has an incorrect term. Fix the bug.",
          hint: "Fibonacci is the sum of previous two terms: F(n-1) + F(n-2)",
          correct_answer: "fibonacci(n-2)",
        },
      ],
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
      questions: [
        {
          id: "c1",
          cipher_text: "GVXSIVOZB",
          cipher_type: "Atbash Cipher",
          hint: "Reverse the alphabet: A ↔ Z, B ↔ Y, C ↔ X, ... T ↔ G, E ↔ V",
          correct_answer: "TECHRELAY",
        },
      ],
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

-- Enable Supabase Realtime for live observer
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tech_relay_progress;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
`;

export default function TechRelayAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"observer" | "rounds" | "leaderboard">("observer");
  const [rounds, setRounds] = useState<TechRelayRound[]>([]);
  const [leaderboard, setLeaderboard] = useState<TechRelayLeaderboardEntry[]>([]);
  const [participants, setParticipants] = useState<TechRelayParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [observerLoading, setObserverLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Filter & Search state for observer
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRound, setFilterRound] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAllRegistered, setShowAllRegistered] = useState(false);

  // Force Unlock Modal
  const [forceUnlockStudent, setForceUnlockStudent] = useState<TechRelayParticipant | null>(null);
  const [selectedUnlockRound, setSelectedUnlockRound] = useState<number>(2);

  // Multi-Question Editor Modal
  const [editingRound, setEditingRound] = useState<Partial<TechRelayRound> | null>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual");
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [contentJson, setContentJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // ── Load All Data ─────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [roundsData, lbData, studentsData] = await Promise.all([
        fetchTechRelayAdminConfig(),
        fetchTechRelayLeaderboard("Tech Relay").catch(() => []),
        fetchTechRelayAdminStudents("Tech Relay", showAllRegistered).catch(() => []),
      ]);
      setRounds(roundsData || []);
      setLeaderboard(lbData || []);
      setParticipants(studentsData || []);
      if (roundsData && roundsData.length > 0) {
        setIsActive(Boolean(roundsData[0].is_active));
      }
    } catch (err) {
      console.error("[TechRelayAdmin] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [showAllRegistered]);

  const refreshObserver = useCallback(async (overrideAll?: boolean) => {
    try {
      setObserverLoading(true);
      const includeAll = typeof overrideAll === "boolean" ? overrideAll : showAllRegistered;
      const studentsData = await fetchTechRelayAdminStudents("Tech Relay", includeAll);
      setParticipants(studentsData || []);
    } catch (err) {
      console.error("Failed to refresh observer:", err);
    } finally {
      setObserverLoading(false);
    }
  }, [showAllRegistered]);

  useEffect(() => {
    loadData();

    // ── Supabase Realtime Subscription ──────────────────────────
    const channel = supabase
      .channel("tech_relay_realtime_observer")
      .on("postgres_changes", { event: "*", schema: "public", table: "tech_relay_progress" }, () => {
        refreshObserver();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, refreshObserver]);

  // ── Relay Toggle ─────────────────────────────────────────────
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

  // ── Observer Actions ─────────────────────────────────────────
  const handleOpenForceUnlock = (student: TechRelayParticipant) => {
    setForceUnlockStudent(student);
    const nextR = Math.min((student.current_round || 1) + 1, 6);
    setSelectedUnlockRound(nextR);
  };

  const handleConfirmForceUnlock = async () => {
    if (!forceUnlockStudent) return;
    try {
      await forceUnlockTechRelay(forceUnlockStudent.student_id, selectedUnlockRound);
      setForceUnlockStudent(null);
      await refreshObserver();
    } catch (err: any) {
      alert("Force unlock failed: " + (err?.message || err));
    }
  };

  const handleResetStudent = async (student: TechRelayParticipant) => {
    if (!confirm(`Reset all Tech Relay progress for ${student.name} (${student.usn})? This will start them back at Round 1.`)) return;
    try {
      await resetTechRelayStudent(student.student_id);
      await refreshObserver();
    } catch (err: any) {
      alert("Reset failed: " + (err?.message || err));
    }
  };

  const handleToggleBlock = async (student: TechRelayParticipant) => {
    const action = student.is_blocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} ${student.name}?`)) return;
    try {
      if (student.is_blocked) await unblockAdminStudent(student.student_id);
      else await blockAdminStudent(student.student_id);
      await refreshObserver();
    } catch (err: any) {
      alert(`Failed to ${action}: ` + (err?.message || err));
    }
  };

  const handleRemoveStudent = async (student: TechRelayParticipant) => {
    if (!confirm(`Remove ${student.name} from Tech Relay? Their relay progress will be cleared.`)) return;
    try {
      await removeTechRelayStudent(student.student_id);
      await refreshObserver();
    } catch (err: any) {
      alert("Remove failed: " + (err?.message || err));
    }
  };

  // ── Round & Multi-Question Editor ─────────────────────────────
  const handleOpenEdit = (round?: TechRelayRound, targetRoundNum?: number) => {
    setEditorMode("visual");
    setJsonError("");

    if (round) {
      setEditingRound(round);
      const rawContent: any = round.content || {};
      setContentJson(JSON.stringify(rawContent, null, 2));

      // Extract questions array
      if (rawContent.questions && Array.isArray(rawContent.questions) && rawContent.questions.length > 0) {
        setQuestionsList(JSON.parse(JSON.stringify(rawContent.questions)));
      } else {
        // Wrap legacy single item into a question object
        if (round.round_type === "gadget") {
          setQuestionsList([
            {
              id: "g1",
              gadget_name: rawContent.gadget_name || round.correct_answer || "",
              clues: rawContent.clues || [],
              correct_answer: round.correct_answer || rawContent.gadget_name || "",
            },
          ]);
        } else if (round.round_type === "puzzle") {
          setQuestionsList([
            {
              id: "p1",
              problem_statement: rawContent.problem_statement || "",
              hint: rawContent.hint || "",
              correct_answer: round.correct_answer || "",
            },
          ]);
        } else if (round.round_type === "debug") {
          setQuestionsList([
            {
              id: "d1",
              language: rawContent.language || "python",
              code: rawContent.code || "",
              bug_description: rawContent.bug_description || "",
              hint: rawContent.hint || "",
              correct_answer: round.correct_answer || "",
            },
          ]);
        } else if (round.round_type === "password") {
          setQuestionsList([
            {
              id: "c1",
              cipher_text: rawContent.cipher_text || "",
              cipher_type: rawContent.cipher_type || "Cipher",
              hint: rawContent.hint || "",
              correct_answer: round.correct_answer || "",
            },
          ]);
        } else {
          setQuestionsList(rawContent.questions || []);
        }
      }
    } else {
      const num = targetRoundNum || (rounds.length + 1);
      const defaultTemplate = DEFAULT_ROUNDS.find((d) => d.round_number === num) || DEFAULT_ROUNDS[0];

      setEditingRound({
        round_number: num,
        round_title: defaultTemplate.round_title,
        round_type: defaultTemplate.round_type,
        correct_answer: defaultTemplate.correct_answer,
        time_limit_seconds: defaultTemplate.time_limit_seconds,
        is_active: isActive,
      });

      const templateContent: any = defaultTemplate.content;
      setContentJson(JSON.stringify(templateContent, null, 2));
      setQuestionsList(templateContent.questions ? JSON.parse(JSON.stringify(templateContent.questions)) : []);
    }
  };

  const handleAddQuestion = () => {
    const qId = `q_${Date.now()}`;
    const roundType = editingRound?.round_type || "puzzle";

    if (roundType === "gadget") {
      setQuestionsList((prev) => [
        ...prev,
        {
          id: qId,
          gadget_name: "",
          clues: [{ letter: "A", clue: "Clue here..." }],
          correct_answer: "",
        },
      ]);
    } else if (roundType === "puzzle") {
      setQuestionsList((prev) => [
        ...prev,
        {
          id: qId,
          problem_statement: "",
          hint: "",
          correct_answer: "",
        },
      ]);
    } else if (roundType === "debug") {
      setQuestionsList((prev) => [
        ...prev,
        {
          id: qId,
          language: "python",
          code: "# Write code with bug",
          bug_description: "",
          hint: "",
          correct_answer: "",
        },
      ]);
    } else if (roundType === "mcq") {
      setQuestionsList((prev) => [
        ...prev,
        {
          question: "",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: 0,
        },
      ]);
    } else if (roundType === "password") {
      setQuestionsList((prev) => [
        ...prev,
        {
          id: qId,
          cipher_text: "",
          cipher_type: "Cipher",
          hint: "",
          correct_answer: "",
        },
      ]);
    }
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestionsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, field: string, val: any) => {
    setQuestionsList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSaveRound = async () => {
    if (!editingRound) return;

    let finalContent: Record<string, unknown> = {};

    if (editorMode === "json") {
      try {
        finalContent = JSON.parse(contentJson);
      } catch (e: any) {
        setJsonError("Invalid JSON syntax: " + e.message);
        return;
      }
    } else {
      // Build content from questionsList
      finalContent = { questions: questionsList };
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
        content: finalContent,
        is_active: isActive,
      });
      setEditingRound(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to save round: " + (err?.detail || err?.message || String(err)));
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
    if (!confirm("Load default 5-round challenge template with multiple questions? Existing rounds will be updated.")) return;
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
      alert("Failed to seed rounds: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  // ── Observer Statistics ───────────────────────────────────────
  const startedParticipants = participants.filter((p) => p.has_started);
  const totalStudents = showAllRegistered ? participants.length : startedParticipants.length;
  const activeStudents = participants.filter((p) => p.has_started && !p.is_completed).length;
  const completedStudents = participants.filter((p) => p.is_completed).length;
  const flaggedStudents = (showAllRegistered ? participants : startedParticipants).filter((p) => p.warnings > 0).length;

  const roundCounts = {
    r1: participants.filter((p) => p.has_started && !p.is_completed && p.current_round === 1).length,
    r2: participants.filter((p) => p.has_started && !p.is_completed && p.current_round === 2).length,
    r3: participants.filter((p) => p.has_started && !p.is_completed && p.current_round === 3).length,
    r4: participants.filter((p) => p.has_started && !p.is_completed && p.current_round === 4).length,
    r5: participants.filter((p) => p.has_started && !p.is_completed && p.current_round === 5).length,
    completed: completedStudents,
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    // Only show started contestants unless admin toggles to show all registered accounts
    if (!showAllRegistered && !p.has_started) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchUsn = p.usn.toLowerCase().includes(q);
      const matchBranch = p.branch.toLowerCase().includes(q);
      if (!matchName && !matchUsn && !matchBranch) return false;
    }
    // Round filter
    if (filterRound !== "all") {
      if (filterRound === "completed" && !p.is_completed) return false;
      if (filterRound !== "completed" && (p.is_completed || p.current_round !== Number(filterRound))) return false;
    }
    // Status filter
    if (filterStatus === "active" && (!p.has_started || p.is_completed)) return false;
    if (filterStatus === "completed" && !p.is_completed) return false;
    if (filterStatus === "flagged" && p.warnings === 0) return false;

    return true;
  });

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => router.push("/admin")}>
            ← Admin Dashboard
          </button>
          <h1 className={styles.title}>🏁 Tech Relay Tournament Control</h1>
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
            title="Load default 5 rounds with multiple questions"
          >
            ✨ Seed Rounds
          </button>

          <div className={styles.tabRow}>
            <button
              className={`${styles.tab} ${activeTab === "observer" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("observer")}
            >
              🏃 Live Monitor ({showAllRegistered ? participants.length : startedParticipants.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === "rounds" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("rounds")}
            >
              📝 Rounds & Questions ({rounds.length}/5)
            </button>
            <button
              className={`${styles.tab} ${activeTab === "leaderboard" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              🏆 Leaderboard ({leaderboard.length})
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: LIVE MONITOR (PYHUNT-STYLE OBSERVER)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === "observer" && (
        <div>
          {/* Top Metrics Row */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>{showAllRegistered ? "Total Accounts" : "Started Contestants"}</div>
              <div className={styles.metricValue}>{totalStudents}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel} style={{ color: "#38bdf8" }}>⚡ Active in Relay</div>
              <div className={styles.metricValue} style={{ color: "#38bdf8" }}>{activeStudents}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel} style={{ color: "#34d399" }}>🏆 Completed Relay</div>
              <div className={styles.metricValue} style={{ color: "#34d399" }}>{completedStudents}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel} style={{ color: flaggedStudents > 0 ? "#f87171" : "rgba(255,255,255,0.5)" }}>
                🚨 Flagged / Strikes
              </div>
              <div className={styles.metricValue} style={{ color: flaggedStudents > 0 ? "#f87171" : "#fff" }}>
                {flaggedStudents}
              </div>
            </div>
          </div>

          {/* Interactive Round Distribution Breakdown */}
          <div className={styles.distSection}>
            <div className={styles.distHeader}>
              <div className={styles.distTitle}>
                Round Distribution ({activeStudents + completedStudents} Active/Finished)
              </div>
              <button
                className={styles.backButton}
                style={{ padding: "4px 12px", fontSize: 11 }}
                onClick={() => refreshObserver()}
                disabled={observerLoading}
              >
                {observerLoading ? "Syncing..." : "🔄 Refresh"}
              </button>
            </div>

            <div className={styles.distBar}>
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.r1 / totalStudents) * 100 : 0}%`, background: "#38bdf8" }}
                title={`Round 1: ${roundCounts.r1}`}
              />
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.r2 / totalStudents) * 100 : 0}%`, background: "#818cf8" }}
                title={`Round 2: ${roundCounts.r2}`}
              />
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.r3 / totalStudents) * 100 : 0}%`, background: "#c084fc" }}
                title={`Round 3: ${roundCounts.r3}`}
              />
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.r4 / totalStudents) * 100 : 0}%`, background: "#f472b6" }}
                title={`Round 4: ${roundCounts.r4}`}
              />
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.r5 / totalStudents) * 100 : 0}%`, background: "#fbbf24" }}
                title={`Round 5: ${roundCounts.r5}`}
              />
              <div
                className={styles.distSegment}
                style={{ width: `${totalStudents ? (roundCounts.completed / totalStudents) * 100 : 0}%`, background: "#34d399" }}
                title={`Finished: ${roundCounts.completed}`}
              />
            </div>

            <div className={styles.distPills}>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#38bdf8" }} />
                <span>R1 (Gadgets): <strong>{roundCounts.r1}</strong></span>
              </div>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#818cf8" }} />
                <span>R2 (Puzzles): <strong>{roundCounts.r2}</strong></span>
              </div>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#c084fc" }} />
                <span>R3 (Debug): <strong>{roundCounts.r3}</strong></span>
              </div>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#f472b6" }} />
                <span>R4 (Quiz): <strong>{roundCounts.r4}</strong></span>
              </div>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#fbbf24" }} />
                <span>R5 (Vault): <strong>{roundCounts.r5}</strong></span>
              </div>
              <div className={styles.distPill}>
                <div className={styles.distDot} style={{ background: "#34d399" }} />
                <span>🏆 Finished: <strong>{roundCounts.completed}</strong></span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className={styles.filterBar}>
            <input
              type="text"
              placeholder="🔍 Search student name, USN, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />

            <select
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Filter by Round (All)</option>
              <option value="1">Round 1 (Gadgets)</option>
              <option value="2">Round 2 (Puzzles)</option>
              <option value="3">Round 3 (Debug)</option>
              <option value="4">Round 4 (Speed Quiz)</option>
              <option value="5">Round 5 (Vault Password)</option>
              <option value="completed">🏆 Completed (Finished)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Filter by Status (All)</option>
              <option value="active">Active Now</option>
              <option value="completed">Completed</option>
              <option value="flagged">Flagged / Strikes</option>
            </select>

            <button
              type="button"
              onClick={() => {
                const next = !showAllRegistered;
                setShowAllRegistered(next);
                refreshObserver(next);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                border: showAllRegistered ? "1px solid rgba(251, 191, 36, 0.4)" : "1px solid rgba(99, 102, 241, 0.4)",
                background: showAllRegistered ? "rgba(251, 191, 36, 0.12)" : "rgba(99, 102, 241, 0.15)",
                color: showAllRegistered ? "#fbbf24" : "#a5b4fc",
                whiteSpace: "nowrap",
              }}
              title="Toggle between showing only active contestants and all database accounts"
            >
              {showAllRegistered ? "👥 Showing All Accounts" : "⚡ Started Only (Code: Meet)"}
            </button>
          </div>

          {/* Student Progress Table */}
          <div style={{ overflowX: "auto" }}>
            {filteredParticipants.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏁</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>
                  No Contestants Have Started Yet
                </div>
                <p style={{ maxWidth: 460, margin: "0 auto", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Only students who enter the start code (<strong>Meet</strong>) on their challenge screen will appear here in real-time.
                </p>
              </div>
            ) : (
              <table className={styles.observerTable}>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>CURRENT ROUND</th>
                    <th>SUB-PROGRESS</th>
                    <th>ROUND STATUS</th>
                    <th>STRIKES</th>
                    <th>TIME ELAPSED</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p) => {
                    const isCompleted = p.is_completed;
                    const roundNum = p.current_round || 1;
                    const roundTitle = rounds.find((r) => r.round_number === roundNum)?.round_title || `Round ${roundNum}`;

                    // Elapsed time calculation
                    let elapsedTime = "—";
                    if (p.started_at) {
                      const start = new Date(p.started_at).getTime();
                      const end = p.completed_at ? new Date(p.completed_at).getTime() : Date.now();
                      const diffSec = Math.max(0, Math.floor((end - start) / 1000));
                      const m = Math.floor(diffSec / 60);
                      const s = diffSec % 60;
                      elapsedTime = `${m}m ${s}s`;
                    }

                    return (
                      <tr key={p.student_id}>
                        <td>
                          <div style={{ fontWeight: 700, color: "#fff" }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                            {p.usn} {p.branch ? `• ${p.branch}` : ""}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 800,
                                background: isCompleted ? "rgba(52, 211, 153, 0.2)" : "rgba(99, 102, 241, 0.2)",
                                color: isCompleted ? "#34d399" : "#a5b4fc",
                                border: isCompleted ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid rgba(99, 102, 241, 0.4)",
                              }}
                            >
                              {isCompleted ? "🏆 DONE" : `R${roundNum}`}
                            </span>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                              {isCompleted ? "All 5 Cleared" : roundTitle}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>
                            {isCompleted
                              ? "5/5 Cleared"
                              : `Q${(p.current_question_index || 0) + 1}`}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              isCompleted
                                ? styles.completedBadge
                                : p.has_started
                                ? styles.inProgressBadge
                                : ""
                            }
                            style={{
                              background: !p.has_started ? "rgba(255,255,255,0.05)" : undefined,
                              color: !p.has_started ? "rgba(255,255,255,0.4)" : undefined,
                            }}
                          >
                            {isCompleted ? "COMPLETED" : p.has_started ? "IN PROGRESS" : "NOT STARTED"}
                          </span>
                        </td>

                        <td>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              color: p.warnings >= 3 ? "#ef4444" : p.warnings > 0 ? "#fbbf24" : "#34d399",
                            }}
                          >
                            {p.warnings >= 3 ? "🚫 3/3 (DISQUALIFIED)" : `${p.warnings}/3`}
                          </span>
                        </td>

                        <td style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }}>
                          {elapsedTime}
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700 }}>
                            {isCompleted ? (
                              <span style={{ color: "#34d399" }}>FINISHED</span>
                            ) : p.is_blocked ? (
                              <span style={{ color: "#f87171" }}>STOPPED</span>
                            ) : p.has_started ? (
                              <>
                                <span className={styles.liveDot} />
                                <span style={{ color: "#10b981" }}>ACTIVE</span>
                              </>
                            ) : (
                              <span style={{ color: "rgba(255,255,255,0.3)" }}>IDLE</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className={styles.actionGroup}>
                            <button
                              className={`${styles.actionBtn} ${styles.btnUnlock}`}
                              onClick={() => handleOpenForceUnlock(p)}
                              title="Force Unlock Next Round"
                            >
                              ⚡ Unlock
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.btnReset}`}
                              onClick={() => handleResetStudent(p)}
                              title="Reset Student Progress"
                            >
                              🔄 Reset
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.btnBlock}`}
                              onClick={() => handleToggleBlock(p)}
                              title={p.is_blocked ? "Resume Exam" : "Stop / Block Exam"}
                            >
                              {p.is_blocked ? "Resume" : "Stop"}
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.btnBlock}`}
                              onClick={() => handleRemoveStudent(p)}
                              title="Remove from Relay"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: ROUNDS & MULTI-QUESTION BUILDER
         ══════════════════════════════════════════════════════════ */}
      {activeTab === "rounds" && (
        <>
          <div className={styles.roundsGrid}>
            {[1, 2, 3, 4, 5].map((num) => {
              const round = rounds.find((r) => r.round_number === num);
              if (round) {
                const content: any = typeof round.content === "string" ? JSON.parse(round.content || "{}") : round.content || {};
                const qCount = content?.questions?.length || 1;

                return (
                  <div key={round.id || num} className={styles.roundCard}>
                    <div className={styles.roundCardHeader}>
                      <span className={styles.roundBadge}>Round {num}</span>
                      <span
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "#c7d2fe",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {qCount} {qCount === 1 ? "Question" : "Questions"}
                      </span>
                      <div className={styles.roundActions}>
                        <button
                          className={styles.iconBtn}
                          title="Edit Round Questions"
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
                    <div className={styles.roundCardType}>
                      Type: <strong>{round.round_type}</strong> • Limit: <strong>{round.time_limit_seconds}s</strong>
                    </div>

                    <div className={styles.roundCardPreview}>
                      {JSON.stringify(round.content, null, 2).slice(0, 160)}...
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

      {/* ══════════════════════════════════════════════════════════
          TAB 3: LEADERBOARD
         ══════════════════════════════════════════════════════════ */}
      {activeTab === "leaderboard" && (
        <div style={{ overflowX: "auto" }}>
          {leaderboard.length === 0 ? (
            <div className={styles.emptyState}>No participants have completed Tech Relay yet.</div>
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
                    <td>{entry.branch || "—"}</td>
                    <td>
                      <span className={styles.roundBadge}>Round {entry.current_round}</span>
                    </td>
                    <td>{entry.rounds_completed} / 5</td>
                    <td>{entry.total_attempts}</td>
                    <td>
                      <span className={entry.is_completed ? styles.completedBadge : styles.inProgressBadge}>
                        {entry.is_completed ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {entry.completed_at ? new Date(entry.completed_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FORCE UNLOCK MODAL
         ══════════════════════════════════════════════════════════ */}
      {forceUnlockStudent && (
        <div className={styles.modalOverlay} onClick={() => setForceUnlockStudent(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <h2 className={styles.modalTitle}>⚡ Force Unlock Round</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 20 }}>
              Advance <strong>{forceUnlockStudent.name}</strong> ({forceUnlockStudent.usn}) to any round instantly.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Target Round</label>
              <select
                className={styles.formSelect}
                value={selectedUnlockRound}
                onChange={(e) => setSelectedUnlockRound(Number(e.target.value))}
              >
                <option value={2}>Round 2 (Solve Puzzle)</option>
                <option value={3}>Round 3 (Find Code Error)</option>
                <option value={4}>Round 4 (Speed Tech Quiz)</option>
                <option value={5}>Round 5 (Decode Vault Password)</option>
                <option value={6}>🏆 Mark All 5 Rounds Complete</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.btnSecondary} onClick={() => setForceUnlockStudent(null)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleConfirmForceUnlock}>
                ⚡ Unlock Round {selectedUnlockRound > 5 ? "All (Complete)" : selectedUnlockRound}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MULTI-QUESTION ROUND EDITOR MODAL
         ══════════════════════════════════════════════════════════ */}
      {editingRound && (
        <div className={styles.modalOverlay} onClick={() => setEditingRound(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className={styles.modalTitle} style={{ margin: 0 }}>
                {editingRound.id ? `Edit Round ${editingRound.round_number}` : `Configure Round ${editingRound.round_number}`}
              </h2>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className={`${styles.tab} ${editorMode === "visual" ? styles.tabActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setEditorMode("visual")}
                >
                  Visual Builder
                </button>
                <button
                  className={`${styles.tab} ${editorMode === "json" ? styles.tabActive : ""}`}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => {
                    setContentJson(JSON.stringify({ questions: questionsList }, null, 2));
                    setEditorMode("json");
                  }}
                >
                  Raw JSON
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Title</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={editingRound.round_title || ""}
                  onChange={(e) => setEditingRound({ ...editingRound, round_title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Round Type</label>
                <select
                  className={styles.formSelect}
                  value={editingRound.round_type || "puzzle"}
                  onChange={(e) => setEditingRound({ ...editingRound, round_type: e.target.value as any })}
                >
                  <option value="gadget">Round 1: Identity Gadgets (Character Clues)</option>
                  <option value="puzzle">Round 2: Solve Puzzle (Problem Statement)</option>
                  <option value="debug">Round 3: Find Code Error (Code Snippet)</option>
                  <option value="mcq">Round 4: Speed Tech Quiz (MCQs)</option>
                  <option value="password">Round 5: Decode Password (Cipher)</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Time Limit (Seconds)</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={editingRound.time_limit_seconds || 300}
                  onChange={(e) => setEditingRound({ ...editingRound, time_limit_seconds: Number(e.target.value) })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Questions in this Round</label>
                <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 14, color: "#a5b4fc", fontWeight: 700 }}>
                  {questionsList.length} {questionsList.length === 1 ? "Question" : "Questions"}
                </div>
              </div>
            </div>

            {/* Visual Builder Mode */}
            {editorMode === "visual" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
                    📋 Questions in Round {editingRound.round_number}
                  </div>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ padding: "5px 12px", fontSize: 12 }}
                    onClick={handleAddQuestion}
                  >
                    ➕ Add Question
                  </button>
                </div>

                {questionsList.map((q, qIdx) => (
                  <div key={q.id || qIdx} className={styles.questionCard}>
                    <div className={styles.questionCardHeader}>
                      <span className={styles.questionBadge}>Question #{qIdx + 1}</span>
                      {questionsList.length > 1 && (
                        <button
                          type="button"
                          className={styles.iconBtn}
                          style={{ width: 24, height: 24, fontSize: 11 }}
                          onClick={() => handleRemoveQuestion(qIdx)}
                          title="Remove question"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Form for Gadget */}
                    {editingRound.round_type === "gadget" && (
                      <>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Gadget Answer (e.g. CAMERA)</label>
                          <input
                            className={styles.formInput}
                            type="text"
                            value={q.gadget_name || q.correct_answer || ""}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              handleUpdateQuestion(qIdx, "gadget_name", val);
                              handleUpdateQuestion(qIdx, "correct_answer", val);
                            }}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label className={styles.formLabel} style={{ margin: 0 }}>Character Clues</label>
                            <button
                              type="button"
                              className={styles.backButton}
                              style={{ padding: "2px 8px", fontSize: 11 }}
                              onClick={() => {
                                const currentClues = q.clues || [];
                                handleUpdateQuestion(qIdx, "clues", [...currentClues, { letter: "", clue: "" }]);
                              }}
                            >
                              + Add Letter Clue
                            </button>
                          </div>

                          {(q.clues || []).map((clue: any, cIdx: number) => (
                            <div key={cIdx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                              <input
                                style={{ width: 60 }}
                                className={styles.formInput}
                                placeholder="Letter"
                                value={clue.letter || ""}
                                maxLength={2}
                                onChange={(e) => {
                                  const cluesCopy = [...(q.clues || [])];
                                  cluesCopy[cIdx] = { ...cluesCopy[cIdx], letter: e.target.value.toUpperCase() };
                                  handleUpdateQuestion(qIdx, "clues", cluesCopy);
                                }}
                              />
                              <input
                                className={styles.formInput}
                                placeholder="Clue or description line..."
                                value={clue.clue || ""}
                                onChange={(e) => {
                                  const cluesCopy = [...(q.clues || [])];
                                  cluesCopy[cIdx] = { ...cluesCopy[cIdx], clue: e.target.value };
                                  handleUpdateQuestion(qIdx, "clues", cluesCopy);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.iconBtn}
                                style={{ width: 28, height: 28 }}
                                onClick={() => {
                                  const cluesCopy = (q.clues || []).filter((_: any, idx: number) => idx !== cIdx);
                                  handleUpdateQuestion(qIdx, "clues", cluesCopy);
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Form for Puzzle */}
                    {editingRound.round_type === "puzzle" && (
                      <>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Problem Statement</label>
                          <textarea
                            className={styles.formTextarea}
                            rows={3}
                            placeholder="Enter puzzle problem statement..."
                            value={q.problem_statement || ""}
                            onChange={(e) => handleUpdateQuestion(qIdx, "problem_statement", e.target.value)}
                          />
                        </div>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hint (Optional)</label>
                            <input
                              className={styles.formInput}
                              placeholder="Hint for student..."
                              value={q.hint || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "hint", e.target.value)}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Correct Answer</label>
                            <input
                              className={styles.formInput}
                              placeholder="Expected definitive answer..."
                              value={q.correct_answer || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "correct_answer", e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Form for Debug */}
                    {editingRound.round_type === "debug" && (
                      <>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Language</label>
                            <input
                              className={styles.formInput}
                              placeholder="python / javascript / cpp..."
                              value={q.language || "python"}
                              onChange={(e) => handleUpdateQuestion(qIdx, "language", e.target.value)}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Correct Fix (Expected Answer)</label>
                            <input
                              className={styles.formInput}
                              placeholder="The exact corrected line or term..."
                              value={q.correct_answer || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "correct_answer", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Buggy Code Snippet</label>
                          <textarea
                            className={styles.formTextarea}
                            rows={4}
                            value={q.code || ""}
                            onChange={(e) => handleUpdateQuestion(qIdx, "code", e.target.value)}
                          />
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Bug Description</label>
                            <input
                              className={styles.formInput}
                              placeholder="What is wrong in the snippet..."
                              value={q.bug_description || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "bug_description", e.target.value)}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hint (Optional)</label>
                            <input
                              className={styles.formInput}
                              placeholder="Debugging hint..."
                              value={q.hint || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "hint", e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Form for MCQ */}
                    {editingRound.round_type === "mcq" && (
                      <>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Question Text</label>
                          <textarea
                            className={styles.formTextarea}
                            rows={2}
                            placeholder="Enter MCQ question..."
                            value={q.question || ""}
                            onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Options & Correct Answer</label>
                          {(q.options || ["", "", "", ""]).map((opt: string, oIdx: number) => (
                            <div key={oIdx} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                              <input
                                type="radio"
                                name={`mcq_correct_${qIdx}`}
                                checked={q.correct === oIdx}
                                onChange={() => handleUpdateQuestion(qIdx, "correct", oIdx)}
                              />
                              <input
                                className={styles.formInput}
                                placeholder={`Option ${oIdx + 1}...`}
                                value={opt}
                                onChange={(e) => {
                                  const opts = [...(q.options || ["", "", "", ""])];
                                  opts[oIdx] = e.target.value;
                                  handleUpdateQuestion(qIdx, "options", opts);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Form for Password */}
                    {editingRound.round_type === "password" && (
                      <>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Cipher Text</label>
                            <input
                              className={styles.formInput}
                              placeholder="e.g. GVXSIVOZB"
                              value={q.cipher_text || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "cipher_text", e.target.value)}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Cipher Type</label>
                            <input
                              className={styles.formInput}
                              placeholder="e.g. Atbash Cipher / Caesar Cipher"
                              value={q.cipher_type || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "cipher_type", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Hint (Optional)</label>
                            <input
                              className={styles.formInput}
                              placeholder="Decryption hint..."
                              value={q.hint || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "hint", e.target.value)}
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Decoded Password (Answer)</label>
                            <input
                              className={styles.formInput}
                              placeholder="Decrypted plaintext password..."
                              value={q.correct_answer || ""}
                              onChange={(e) => handleUpdateQuestion(qIdx, "correct_answer", e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className={styles.addQBtn}
                  onClick={handleAddQuestion}
                >
                  ➕ Add Another Question to Round {editingRound.round_number}
                </button>
              </div>
            )}

            {/* JSON Mode */}
            {editorMode === "json" && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Raw Content JSON</label>
                <textarea
                  className={styles.formTextarea}
                  rows={14}
                  value={contentJson}
                  onChange={(e) => {
                    setContentJson(e.target.value);
                    setJsonError("");
                  }}
                />
                {jsonError && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{jsonError}</p>
                )}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setEditingRound(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSaveRound}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Round"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
