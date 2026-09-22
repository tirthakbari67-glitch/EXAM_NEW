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

class RoundConfigCreate(BaseModel):
    id: Optional[str] = None
    relay_name: str = "Tech Relay"
    round_number: int
    round_title: str
    round_type: str
    content: dict = {}
    correct_answer: Optional[str] = None
    time_limit_seconds: int = 300
    is_active: bool = False

class RelayToggle(BaseModel):
    relay_name: str = "Tech Relay"
    is_active: bool


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

@router.get("/config")
async def get_relay_config(current: dict = Depends(get_current_student)):
    """Get active relay config with all rounds (strips correct_answer)."""
    db = get_supabase()
    try:
        result = db.table("tech_relay_config") \
            .select("id, relay_name, is_active, round_number, round_title, round_type, content, time_limit_seconds") \
            .eq("is_active", True) \
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
        print(f"[TECH_RELAY] Config fetch note: {e}")
        return {"rounds": []}


@router.get("/progress")
async def get_relay_progress(current: dict = Depends(get_current_student)):
    """Get current student's relay progress."""
    db = get_supabase()
    student_id = current["student_id"]
    try:
        result = db.table("tech_relay_progress") \
            .select("*") \
            .eq("student_id", student_id) \
            .execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {
            "current_round": 1,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None
        }
    except Exception as e:
        print(f"[TECH_RELAY] Progress fetch note: {e}")
        return {
            "current_round": 1,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None
        }


@router.post("/submit-round")
async def submit_round(body: RoundSubmission, current: dict = Depends(get_current_student)):
    """Submit answer for a round. Validates and advances progress if correct."""
    db = get_supabase()
    student_id = current["student_id"]
    relay_name = body.relay_name
    round_num = body.round_number
    answer = body.answer.strip()

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

    # 3. Validate the answer based on round type
    is_correct = False

    if round_type == "mcq":
        # For MCQ rounds, answer is JSON: {"answers": [0, 1, 2, 0, 3]}
        try:
            submitted = json.loads(answer)
            submitted_answers = submitted.get("answers", [])
            content = round_config["content"]
            questions = content.get("questions", [])
            if len(submitted_answers) == len(questions):
                is_correct = all(
                    submitted_answers[i] == questions[i].get("correct")
                    for i in range(len(questions))
                )
        except (json.JSONDecodeError, KeyError, IndexError):
            is_correct = False
    else:
        # For text-based rounds, case-insensitive exact match
        correct = (round_config.get("correct_answer") or "").strip().lower()
        is_correct = answer.lower() == correct

    if not is_correct:
        return {"success": False, "message": "Incorrect answer. Try again!"}

    # 4. Update progress
    now = datetime.now(timezone.utc).isoformat()
    rounds_completed = progress["rounds_completed"] if progress else []
    if isinstance(rounds_completed, str):
        rounds_completed = json.loads(rounds_completed)

    # Count attempts for this round
    existing_entry = next((r for r in rounds_completed if r.get("round") == round_num), None)
    attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

    # Remove old entry if exists, add new completed entry
    rounds_completed = [r for r in rounds_completed if r.get("round") != round_num]
    rounds_completed.append({
        "round": round_num,
        "completed_at": now,
        "attempts": attempts
    })

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
        "message": "🏆 Relay Complete! Congratulations!" if is_relay_complete else f"Round {round_num} cleared! Round {next_round} unlocked.",
        "next_round": None if is_relay_complete else next_round,
        "is_completed": is_relay_complete
    }


# ══════════════════════════════════════════════════════════════════
#  ADMIN ENDPOINTS
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
    """Create or update a relay round config (upsert on relay_name + round_number)."""
    try:
        db = get_supabase()

        # Check if round exists
        existing = db.table("tech_relay_config") \
            .select("id") \
            .eq("relay_name", body.relay_name) \
            .eq("round_number", body.round_number) \
            .execute()

        data = body.model_dump()
        target_id = data.pop("id", None)

        # Content must be a dict for jsonb in postgrest
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


@router.get("/admin/leaderboard")
async def admin_leaderboard(relay_name: str = "Tech Relay", _: bool = Depends(verify_admin)):
    """Get leaderboard of completed students."""
    try:
        db = get_supabase()

        # Fetch all progress rows for this relay
        progress_result = db.table("tech_relay_progress") \
            .select("student_id, current_round, rounds_completed, is_completed, started_at, completed_at") \
            .eq("relay_name", relay_name) \
            .order("is_completed", desc=True) \
            .order("completed_at") \
            .execute()

        if not progress_result.data:
            return {"leaderboard": []}

        # Fetch student names
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
                rounds_completed = json.loads(rounds_completed)

            total_attempts = sum(r.get("attempts", 1) for r in rounds_completed)

            leaderboard.append({
                "student_id": p["student_id"],
                "usn": student.get("usn", ""),
                "name": student.get("name", "Unknown"),
                "branch": student.get("branch", ""),
                "current_round": p["current_round"],
                "rounds_completed": len(rounds_completed),
                "total_attempts": total_attempts,
                "is_completed": p["is_completed"],
                "started_at": p["started_at"],
                "completed_at": p["completed_at"],
            })

        return {"leaderboard": leaderboard}
    except Exception as e:
        print(f"[TECH_RELAY] admin_leaderboard note: {e}")
        return {"leaderboard": []}
