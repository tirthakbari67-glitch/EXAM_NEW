from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import json

from core.config import get_settings
from core.security import get_current_student
from db.supabase_client import get_supabase

router = APIRouter(prefix="/tech-relay", tags=["tech-relay"])
settings = get_settings()


# ── Schemas ──────────────────────────────────────────────────────

class RoundSubmission(BaseModel):
    round_number: int
    answer: str
    relay_name: str = "Tech Relay"
    question_index: Optional[int] = 0

class RoundConfigCreate(BaseModel):
    id: Optional[str] = None
    relay_name: str = "Tech Relay"
    round_number: int
    round_title: str
    round_type: str
    content: dict = {}
    correct_answer: Optional[str] = None
    time_limit_seconds: int = 0
    is_active: bool = False

class RelayToggle(BaseModel):
    relay_name: str = "Tech Relay"
    is_active: bool

class ForceUnlockRequest(BaseModel):
    student_id: str
    next_round: int
    relay_name: str = "Tech Relay"

class ResetStudentRequest(BaseModel):
    student_id: str
    relay_name: str = "Tech Relay"

class StartRelayRequest(BaseModel):
    start_code: str
    relay_name: str = "Tech Relay"



# ── Admin Dependency ─────────────────────────────────────────────

async def verify_admin(x_admin_secret: str = Header(...)):
    if x_admin_secret != settings.admin_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    return True


# ══════════════════════════════════════════════════════════════════
#  STUDENT ENDPOINTS
# ══════════════════════════════════════════════════════════════════

def get_student_assigned_r1_index(student_id: str, relay_name: str, total_questions: int, db) -> int:
    """
    Get or compute assigned Round 1 question index for a student.
    Uses stored index in tech_relay_progress._meta if available.
    Fallback: deterministic hash based on student_id to ensure consistency.
    """
    if total_questions <= 1:
        return 0
    try:
        res = db.table("tech_relay_progress") \
            .select("rounds_completed") \
            .eq("student_id", student_id) \
            .eq("relay_name", relay_name) \
            .limit(1) \
            .execute()
        if res.data and len(res.data) > 0:
            rounds_completed = res.data[0].get("rounds_completed", [])
            if isinstance(rounds_completed, str):
                try:
                    rounds_completed = json.loads(rounds_completed)
                except Exception:
                    rounds_completed = []
            for item in rounds_completed:
                if isinstance(item, dict) and item.get("_meta"):
                    if "assigned_r1_index" in item and item["assigned_r1_index"] is not None:
                        return int(item["assigned_r1_index"]) % total_questions
    except Exception as e:
        print(f"[TECH_RELAY] get_assigned_r1_index note: {e}")

    # Fallback deterministic hash
    hash_val = sum(ord(c) for c in str(student_id))
    return hash_val % total_questions


@router.get("/config")
async def get_relay_config(current: dict = Depends(get_current_student)):
    """Get active relay config with all rounds (strips correct answers for anti-cheat)."""
    db = get_supabase()
    try:
        result = db.table("tech_relay_config") \
            .select("id, relay_name, is_active, round_number, round_title, round_type, content, time_limit_seconds") \
            .eq("is_active", True) \
            .order("round_number") \
            .execute()
        rounds = result.data or []

        sanitized_rounds = []
        for r in rounds:
            r_copy = dict(r)
            r_copy.pop("correct_answer", None)
            r_copy["time_limit_seconds"] = 0  # No time limit on any round
            round_num = r_copy.get("round_number")
            content = r_copy.get("content")
            if isinstance(content, str):
                try:
                    content = json.loads(content)
                except Exception:
                    content = {}
            if isinstance(content, dict):
                content_copy = dict(content)
                # If there are sub-questions in content, sanitize each question
                if "questions" in content_copy and isinstance(content_copy["questions"], list):
                    clean_questions = []
                    for q in content_copy["questions"]:
                        if isinstance(q, dict):
                            qc = dict(q)
                            qc.pop("correct_answer", None)
                            qc.pop("correct", None)
                            qc.pop("answer", None)
                            clean_questions.append(qc)
                        else:
                            clean_questions.append(q)

                    # Special Rule for Round 1:
                    # Each user gets ONLY ONE question assigned from the pool so different users get different questions!
                    if round_num == 1 and len(clean_questions) > 1:
                        assigned_idx = get_student_assigned_r1_index(
                            student_id=current["student_id"],
                            relay_name=r_copy.get("relay_name", "Tech Relay"),
                            total_questions=len(clean_questions),
                            db=db
                        )
                        content_copy["questions"] = [clean_questions[assigned_idx]]
                        content_copy["assigned_question_index"] = assigned_idx
                    else:
                        content_copy["questions"] = clean_questions

                r_copy["content"] = content_copy
            sanitized_rounds.append(r_copy)

        return {"rounds": sanitized_rounds}
    except Exception as e:
        print(f"[TECH_RELAY] Config fetch note: {e}")
        return {"rounds": []}


@router.get("/progress")
async def get_relay_progress(current: dict = Depends(get_current_student)):
    """Get current student's relay progress including sub-question index."""
    db = get_supabase()
    student_id = current["student_id"]
    try:
        result = db.table("tech_relay_progress") \
            .select("*") \
            .eq("student_id", student_id) \
            .execute()

        if result.data and len(result.data) > 0:
            row = result.data[0]
            rounds_completed = row.get("rounds_completed", [])
            if isinstance(rounds_completed, str):
                try:
                    rounds_completed = json.loads(rounds_completed)
                except Exception:
                    rounds_completed = []

            current_question_index = 0
            clean_completed = []
            for item in rounds_completed:
                if isinstance(item, dict) and item.get("_meta"):
                    current_question_index = item.get("current_question_index", 0)
                else:
                    clean_completed.append(item)

            return {
                "id": row.get("id"),
                "student_id": row.get("student_id"),
                "relay_name": row.get("relay_name", "Tech Relay"),
                "current_round": row.get("current_round", 1),
                "current_question_index": current_question_index,
                "rounds_completed": clean_completed,
                "is_completed": row.get("is_completed", False),
                "started_at": row.get("started_at"),
                "completed_at": row.get("completed_at"),
            }

        return {
            "current_round": 1,
            "current_question_index": 0,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None
        }
    except Exception as e:
        print(f"[TECH_RELAY] Progress fetch note: {e}")
        return {
            "current_round": 1,
            "current_question_index": 0,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None
        }


@router.post("/start")
async def start_relay(body: StartRelayRequest, current: dict = Depends(get_current_student)):
    """Start Tech Relay by verifying access code ('Meet') and initializing student progress."""
    db = get_supabase()
    student_id = current["student_id"]
    relay_name = body.relay_name
    submitted_code = body.start_code.strip()

    # Validate start code ("Meet", case-insensitive)
    if submitted_code.lower() != "meet":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect Start Code! Please enter 'Meet' to start the challenge."
        )

    # Check if relay is active
    active_check = db.table("tech_relay_config") \
        .select("is_active") \
        .eq("relay_name", relay_name) \
        .eq("is_active", True) \
        .limit(1) \
        .execute()

    if not active_check.data or len(active_check.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tech Relay is currently inactive. Please wait for the admin to activate it."
        )

    now = datetime.now(timezone.utc).isoformat()

    # Check existing progress
    existing = db.table("tech_relay_progress") \
        .select("*") \
        .eq("student_id", student_id) \
        .eq("relay_name", relay_name) \
        .execute()

    if existing.data and len(existing.data) > 0:
        row = existing.data[0]
        return {
            "success": True,
            "message": "Welcome back to Tech Relay!",
            "current_round": row.get("current_round", 1),
            "is_completed": row.get("is_completed", False),
            "started_at": row.get("started_at") or now
        }

    # Determine assigned Round 1 question for this participant (round-robin among existing pool)
    assigned_r1_index = 0
    try:
        count_res = db.table("tech_relay_progress") \
            .select("id") \
            .eq("relay_name", relay_name) \
            .execute()
        student_count = len(count_res.data) if (count_res.data and isinstance(count_res.data, list)) else 0

        r1_cfg = db.table("tech_relay_config") \
            .select("content") \
            .eq("relay_name", relay_name) \
            .eq("round_number", 1) \
            .limit(1) \
            .execute()
        if r1_cfg.data and len(r1_cfg.data) > 0:
            r1_content = r1_cfg.data[0].get("content", {})
            if isinstance(r1_content, str):
                try:
                    r1_content = json.loads(r1_content)
                except Exception:
                    r1_content = {}
            if isinstance(r1_content, dict) and "questions" in r1_content and isinstance(r1_content["questions"], list):
                pool_size = len(r1_content["questions"])
                if pool_size > 1:
                    assigned_r1_index = student_count % pool_size
    except Exception as e:
        print(f"[TECH_RELAY] start_relay assignment note: {e}")
        assigned_r1_index = sum(ord(c) for c in str(student_id)) % 5

    progress_data = {
        "student_id": student_id,
        "relay_name": relay_name,
        "current_round": 1,
        "rounds_completed": json.dumps([{
            "_meta": True,
            "assigned_r1_index": assigned_r1_index,
            "current_question_index": 0
        }]),
        "is_completed": False,
        "started_at": now,
        "completed_at": None,
    }

    insert_res = db.table("tech_relay_progress").insert(progress_data).execute()
    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to initialize relay progress")

    try:
        db.table("exam_status").upsert({
            "student_id": student_id,
            "exam_name": "Tech Relay",
            "status": "in_progress",
            "started_at": now,
        }).execute()
    except Exception as e:
        print(f"[TECH_RELAY] exam_status note: {e}")

    return {
        "success": True,
        "message": "Start Code verified! Welcome to Tech Relay.",
        "current_round": 1,
        "is_completed": False,
        "started_at": now
    }


@router.post("/submit-round")
async def submit_round(body: RoundSubmission, current: dict = Depends(get_current_student)):
    """Submit answer for a round or sub-question. Validates and advances progress."""
    db = get_supabase()
    student_id = current["student_id"]
    relay_name = body.relay_name
    round_num = body.round_number
    answer = body.answer.strip()
    q_idx = max(0, body.question_index or 0)

    # 1. Fetch the round config
    config_result = db.table("tech_relay_config") \
        .select("*") \
        .eq("relay_name", relay_name) \
        .eq("round_number", round_num) \
        .eq("is_active", True) \
        .limit(1) \
        .execute()

    if not config_result.data or len(config_result.data) == 0:
        raise HTTPException(status_code=404, detail="Round not found or not active")

    round_config = config_result.data[0]
    round_type = round_config["round_type"]

    # 2. Check student is on this round (no skipping)
    progress_result = db.table("tech_relay_progress") \
        .select("*") \
        .eq("student_id", student_id) \
        .eq("relay_name", relay_name) \
        .execute()

    progress = progress_result.data[0] if (progress_result.data and len(progress_result.data) > 0) else None
    current_round = progress["current_round"] if progress else 1

    if round_num != current_round:
        raise HTTPException(status_code=400, detail=f"You must complete Round {current_round} first")

    if progress and progress.get("is_completed"):
        raise HTTPException(status_code=400, detail="You have already completed this relay")

    # 3. Parse content & check for multiple questions
    content = round_config.get("content", {})
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except Exception:
            content = {}

    questions = content.get("questions") if isinstance(content, dict) else None
    has_multi_questions = isinstance(questions, list) and len(questions) > 0

    is_correct = False

    if has_multi_questions:
        # For Round 1, retrieve the student's assigned question index from the pool
        if round_num == 1 and len(questions) > 1:
            assigned_idx = get_student_assigned_r1_index(
                student_id=student_id,
                relay_name=relay_name,
                total_questions=len(questions),
                db=db
            )
            target_q = questions[assigned_idx]
        else:
            if q_idx >= len(questions):
                raise HTTPException(status_code=400, detail="Invalid question index for this round")
            target_q = questions[q_idx]

        if round_type == "mcq":
            expected = target_q.get("correct")
            if expected is None:
                expected = target_q.get("correct_answer")
            try:
                submitted_val = int(answer)
                is_correct = (submitted_val == int(expected))
            except (ValueError, TypeError):
                is_correct = str(answer).strip().lower() == str(expected).strip().lower()
        else:
            expected = target_q.get("correct_answer") or target_q.get("answer") or target_q.get("correct") or ""
            is_correct = str(answer).strip().lower() == str(expected).strip().lower()

        if not is_correct:
            return {"success": False, "message": "Incorrect answer. Try again!"}

        # If correct, check if more questions remain in this round
        # Special rule for Round 1: Solving the assigned single question clears Round 1 immediately!
        if round_num == 1:
            pass  # Advance directly to clearing Round 1 below
        elif q_idx + 1 < len(questions):
            next_q_idx = q_idx + 1
            now = datetime.now(timezone.utc).isoformat()
            rounds_completed = progress.get("rounds_completed", []) if progress else []
            if isinstance(rounds_completed, str):
                try:
                    rounds_completed = json.loads(rounds_completed)
                except Exception:
                    rounds_completed = []

            meta_info = next((r for r in rounds_completed if isinstance(r, dict) and r.get("_meta")), {})
            rounds_completed = [r for r in rounds_completed if not (isinstance(r, dict) and r.get("_meta"))]
            meta_info["current_question_index"] = next_q_idx
            rounds_completed.append(meta_info)

            progress_data = {
                "student_id": student_id,
                "relay_name": relay_name,
                "current_round": round_num,
                "rounds_completed": json.dumps(rounds_completed),
                "is_completed": False
            }
            if progress:
                db.table("tech_relay_progress").update(progress_data).eq("id", progress["id"]).execute()
            else:
                progress_data["started_at"] = now
                db.table("tech_relay_progress").insert(progress_data).execute()

            return {
                "success": True,
                "round_cleared": False,
                "next_question_index": next_q_idx,
                "total_questions": len(questions),
                "message": f"🎉 Question {q_idx + 1} Solved! Question {next_q_idx + 1} Unlocked."
            }

    else:
        # Legacy single question format
        if round_type == "mcq":
            try:
                submitted = json.loads(answer)
                submitted_answers = submitted.get("answers", [])
                quiz_questions = content.get("questions", [])
                if len(submitted_answers) == len(quiz_questions):
                    is_correct = all(
                        submitted_answers[i] == quiz_questions[i].get("correct")
                        for i in range(len(quiz_questions))
                    )
            except Exception:
                is_correct = False
        else:
            correct = (round_config.get("correct_answer") or "").strip().lower()
            is_correct = answer.lower() == correct

        if not is_correct:
            return {"success": False, "message": "Incorrect answer. Try again!"}

    # 4. Round successfully cleared! Update progress & advance round
    now = datetime.now(timezone.utc).isoformat()
    rounds_completed = progress.get("rounds_completed", []) if progress else []
    if isinstance(rounds_completed, str):
        try:
            rounds_completed = json.loads(rounds_completed)
        except Exception:
            rounds_completed = []

    meta_info = next((r for r in rounds_completed if isinstance(r, dict) and r.get("_meta")), {})
    rounds_completed = [r for r in rounds_completed if not (isinstance(r, dict) and r.get("_meta"))]

    existing_entry = next((r for r in rounds_completed if r.get("round") == round_num), None)
    attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

    rounds_completed = [r for r in rounds_completed if r.get("round") != round_num]
    rounds_completed.append({
        "round": round_num,
        "completed_at": now,
        "attempts": attempts,
        "questions_solved": 1 if round_num == 1 else (len(questions) if has_multi_questions else 1)
    })

    # Reset question index for next round while preserving meta (assigned_r1_index)
    meta_info["current_question_index"] = 0
    rounds_completed.append(meta_info)

    next_round = round_num + 1
    is_relay_complete = round_num >= 5

    progress_data = {
        "student_id": student_id,
        "relay_name": relay_name,
        "current_round": 6 if is_relay_complete else next_round,
        "rounds_completed": json.dumps(rounds_completed),
        "is_completed": is_relay_complete,
        "completed_at": now if is_relay_complete else None,
    }

    if progress:
        db.table("tech_relay_progress") \
            .update(progress_data) \
            .eq("id", progress["id"]) \
            .execute()
    else:
        progress_data["started_at"] = now
        db.table("tech_relay_progress") \
            .insert(progress_data) \
            .execute()

    return {
        "success": True,
        "round_cleared": True,
        "message": "🏆 Relay Complete! Congratulations!" if is_relay_complete else f"Round {round_num} cleared! Round {next_round} unlocked.",
        "next_round": None if is_relay_complete else next_round,
        "next_question_index": 0,
        "is_completed": is_relay_complete
    }


# ══════════════════════════════════════════════════════════════════
#  ADMIN ENDPOINTS (OBSERVER & CONFIG)
# ══════════════════════════════════════════════════════════════════

@router.get("/admin/config")
async def admin_get_config(_: bool = Depends(verify_admin)):
    """Get all relay configs for admin management."""
    try:
        db = get_supabase()
        result = db.table("tech_relay_config") \
            .select("*") \
            .order("relay_name") \
            .order("round_number") \
            .execute()
        rounds = result.data or []
        for r in rounds:
            if isinstance(r.get("content"), str):
                try:
                    r["content"] = json.loads(r["content"])
                except Exception:
                    pass
        return {"rounds": rounds}
    except Exception as e:
        print(f"[TECH_RELAY] admin_get_config note: {e}")
        return {"rounds": []}


@router.post("/admin/config")
async def admin_save_round(body: RoundConfigCreate, _: bool = Depends(verify_admin)):
    """Create or update a relay round config."""
    try:
        db = get_supabase()

        existing = db.table("tech_relay_config") \
            .select("id") \
            .eq("relay_name", body.relay_name) \
            .eq("round_number", body.round_number) \
            .execute()

        data = body.model_dump()
        target_id = data.pop("id", None)

        if isinstance(data.get("content"), str):
            try:
                data["content"] = json.loads(data["content"])
            except Exception:
                data["content"] = {}

        if existing.data and len(existing.data) > 0:
            row_id = existing.data[0]["id"]
            result = db.table("tech_relay_config") \
                .update(data) \
                .eq("id", row_id) \
                .execute()
        elif target_id:
            result = db.table("tech_relay_config") \
                .update(data) \
                .eq("id", target_id) \
                .execute()
        else:
            result = db.table("tech_relay_config") \
                .insert(data) \
                .execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save round: no data returned from database")

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        err_msg = str(e)
        print(f"[TECH_RELAY] admin_save_round failed: {err_msg}")
        if "tech_relay_config" in err_msg or "PGRST205" in err_msg or "does not exist" in err_msg:
            raise HTTPException(
                status_code=400,
                detail="Database table 'tech_relay_config' does not exist yet! Please run migration_v17_tech_relay.sql in your Supabase SQL Editor."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {err_msg}")


@router.delete("/admin/config/{config_id}")
async def admin_delete_round(config_id: str, _: bool = Depends(verify_admin)):
    """Delete a relay round config."""
    try:
        db = get_supabase()
        db.table("tech_relay_config").delete().eq("id", config_id).execute()
        return {"status": "deleted"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_delete_round failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/toggle")
async def admin_toggle_relay(body: RelayToggle, _: bool = Depends(verify_admin)):
    """Activate or deactivate all rounds for a relay."""
    try:
        db = get_supabase()
        db.table("tech_relay_config") \
            .update({"is_active": body.is_active}) \
            .eq("relay_name", body.relay_name) \
            .execute()
        return {"status": "active" if body.is_active else "inactive", "relay_name": body.relay_name}
    except Exception as e:
        print(f"[TECH_RELAY] admin_toggle_relay failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/students")
async def admin_get_relay_students(
    relay_name: str = "Tech Relay",
    include_all: bool = False,
    _: bool = Depends(verify_admin)
):
    """Fetch students for Tech Relay live observer. Defaults to only students who have started."""
    try:
        db = get_supabase()

        # 1. Fetch progress for this relay
        progress_res = db.table("tech_relay_progress") \
            .select("*") \
            .eq("relay_name", relay_name) \
            .execute()
        progress_list = progress_res.data or []
        progress_map = {p["student_id"]: p for p in progress_list}

        if not include_all and not progress_map:
            return {"students": []}

        # 2. Fetch student profiles
        if include_all:
            students_res = db.table("students").select("id, usn, name, branch, is_blocked").execute()
            students_list = students_res.data or []
        else:
            student_ids = list(progress_map.keys())
            students_res = db.table("students") \
                .select("id, usn, name, branch, is_blocked") \
                .in_("id", student_ids) \
                .execute()
            students_list = students_res.data or []

        # 3. Fetch violations count for strikes
        try:
            viol_res = db.table("violations").select("student_id").execute()
            viol_counts = {}
            for v in (viol_res.data or []):
                sid = v["student_id"]
                viol_counts[sid] = viol_counts.get(sid, 0) + 1
        except Exception:
            viol_counts = {}

        # 4. Assemble participant list
        participants = []
        for s in students_list:
            sid = s["id"]
            p = progress_map.get(sid)

            if not include_all and not p:
                continue

            rounds_completed = []
            current_q_idx = 0
            if p:
                raw_rc = p.get("rounds_completed", [])
                if isinstance(raw_rc, str):
                    try:
                        raw_rc = json.loads(raw_rc)
                    except Exception:
                        raw_rc = []
                for item in raw_rc:
                    if isinstance(item, dict) and item.get("_meta"):
                        current_q_idx = item.get("current_question_index", 0)
                    else:
                        rounds_completed.append(item)

            participants.append({
                "student_id": sid,
                "usn": s.get("usn", ""),
                "name": s.get("name", "Unknown"),
                "branch": s.get("branch", ""),
                "is_blocked": s.get("is_blocked", False),
                "has_started": p is not None,
                "current_round": p.get("current_round", 1) if p else 1,
                "current_question_index": current_q_idx,
                "rounds_completed": rounds_completed,
                "is_completed": p.get("is_completed", False) if p else False,
                "started_at": p.get("started_at") if p else None,
                "completed_at": p.get("completed_at") if p else None,
                "warnings": viol_counts.get(sid, 0),
            })

        # Sort: Completed first, then by current round descending
        participants.sort(key=lambda x: (
            1 if x["has_started"] else 0,
            1 if x["is_completed"] else 0,
            x["current_round"]
        ), reverse=True)

        return {"students": participants}
    except Exception as e:
        print(f"[TECH_RELAY] admin_get_relay_students error: {e}")
        return {"students": []}


@router.post("/admin/force-unlock")
async def admin_force_unlock(body: ForceUnlockRequest, _: bool = Depends(verify_admin)):
    """Force unlock or advance a student to a specific round."""
    try:
        db = get_supabase()
        now = datetime.now(timezone.utc).isoformat()

        existing = db.table("tech_relay_progress") \
            .select("*") \
            .eq("student_id", body.student_id) \
            .eq("relay_name", body.relay_name) \
            .execute()

        is_complete = body.next_round > 5

        rounds_completed = []
        for r in range(1, min(body.next_round, 6)):
            rounds_completed.append({
                "round": r,
                "completed_at": now,
                "attempts": 1,
                "forced": True
            })
        rounds_completed.append({"_meta": True, "current_question_index": 0})

        data = {
            "student_id": body.student_id,
            "relay_name": body.relay_name,
            "current_round": 6 if is_complete else body.next_round,
            "rounds_completed": json.dumps(rounds_completed),
            "is_completed": is_complete,
            "completed_at": now if is_complete else None,
        }

        if existing.data and len(existing.data) > 0:
            db.table("tech_relay_progress").update(data).eq("id", existing.data[0]["id"]).execute()
        else:
            data["started_at"] = now
            db.table("tech_relay_progress").insert(data).execute()

        return {"success": True, "message": f"Unlocked Round {body.next_round} for student"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_force_unlock error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reset-student")
async def admin_reset_student(body: ResetStudentRequest, _: bool = Depends(verify_admin)):
    """Reset all relay progress for a student so they can restart."""
    try:
        db = get_supabase()
        db.table("tech_relay_progress") \
            .delete() \
            .eq("student_id", body.student_id) \
            .eq("relay_name", body.relay_name) \
            .execute()
        return {"success": True, "message": "Student relay progress has been reset"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_reset_student error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/student/{student_id}")
async def admin_remove_student(student_id: str, relay_name: str = "Tech Relay", _: bool = Depends(verify_admin)):
    """Remove student record from tech_relay_progress."""
    try:
        db = get_supabase()
        db.table("tech_relay_progress") \
            .delete() \
            .eq("student_id", student_id) \
            .eq("relay_name", relay_name) \
            .execute()
        return {"success": True, "message": "Student removed from relay"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_remove_student error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/leaderboard")
async def admin_leaderboard(relay_name: str = "Tech Relay", _: bool = Depends(verify_admin)):
    """Get leaderboard of completed students."""
    try:
        db = get_supabase()

        progress_result = db.table("tech_relay_progress") \
            .select("student_id, current_round, rounds_completed, is_completed, started_at, completed_at") \
            .eq("relay_name", relay_name) \
            .order("is_completed", desc=True) \
            .order("completed_at") \
            .execute()

        if not progress_result.data:
            return {"leaderboard": []}

        student_ids = [p["student_id"] for p in progress_result.data]
        students_result = db.table("students") \
            .select("id, usn, name, branch") \
            .in_("id", student_ids) \
            .execute()
        students_map = {s["id"]: s for s in (students_result.data or [])}

        leaderboard = []
        for p in progress_result.data:
            student = students_map.get(p["student_id"], {})
            rounds_completed = p.get("rounds_completed", [])
            if isinstance(rounds_completed, str):
                try:
                    rounds_completed = json.loads(rounds_completed)
                except Exception:
                    rounds_completed = []

            clean_rc = [r for r in rounds_completed if not (isinstance(r, dict) and r.get("_meta"))]
            total_attempts = sum(r.get("attempts", 1) for r in clean_rc)

            leaderboard.append({
                "student_id": p["student_id"],
                "usn": student.get("usn", ""),
                "name": student.get("name", "Unknown"),
                "branch": student.get("branch", ""),
                "current_round": p["current_round"],
                "rounds_completed": len(clean_rc),
                "total_attempts": total_attempts,
                "is_completed": p["is_completed"],
                "started_at": p["started_at"],
                "completed_at": p["completed_at"],
            })

        return {"leaderboard": leaderboard}
    except Exception as e:
        print(f"[TECH_RELAY] admin_leaderboard note: {e}")
        return {"leaderboard": []}

