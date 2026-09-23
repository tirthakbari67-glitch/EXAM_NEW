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

class ResetRelayRequest(BaseModel):
    relay_name: str = "Tech Relay"

class ClearStrikesRequest(BaseModel):
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


DEFAULT_ROUND_2_GATE_CONTENT = {
    "title": "Password Verification Gate",
    "instruction": "Verify your clearance by typing your exact Round 1 gadget codename to unlock Round 3.",
    "rule": "Exact match with Round 1 Gadget Codename"
}

DEFAULT_ROUND_3_HTML_CONTENT = {
    "target_required": 3,
    "quiz_title": "HTML Basic Practice Assessment",
    "subject": "Web Technologies / Programming for Problem Solving",
    "questions": [
        {
            "id": "h1",
            "question": "What does HTML stand for?",
            "options": [
                "Hyper Trainer Marking Language",
                "Hyper Text Markup Language",
                "Hyper Text Marketing Language",
                "Hyper Tool Multi Language"
            ],
            "correct": 1,
            "explanation": "HTML stands for Hyper Text Markup Language, the standard markup language for web pages."
        },
        {
            "id": "h2",
            "question": "Which HTML tag is used to create the largest heading?",
            "options": ["<head>", "<h6>", "<heading>", "<h1>"],
            "correct": 3,
            "explanation": "<h1> defines the most important and largest heading, down to <h6> which is the smallest."
        },
        {
            "id": "h3",
            "question": "What is the correct HTML tag for inserting a line break?",
            "options": ["<lb>", "<break>", "<br>", "<ln>"],
            "correct": 2,
            "explanation": "<br> inserts a single line break in the text."
        },
        {
            "id": "h4",
            "question": "Which HTML tag is used to create a hyperlink?",
            "options": ["<link>", "<a>", "<href>", "<url>"],
            "correct": 1,
            "explanation": "The anchor tag <a> is used to create hyperlinks connecting one page to another."
        },
        {
            "id": "h5",
            "question": "Which attribute is used to specify the URL of an image in the <img> tag?",
            "options": ["src", "href", "link", "url"],
            "correct": 0,
            "explanation": "The src (source) attribute specifies the path/URL to the image file."
        },
        {
            "id": "h6",
            "question": "Which HTML element is used to define an unordered list (bulleted list)?",
            "options": ["<ol>", "<list>", "<ul>", "<bl>"],
            "correct": 2,
            "explanation": "<ul> creates an unordered bulleted list, whereas <ol> creates an ordered numbered list."
        },
        {
            "id": "h7",
            "question": "How can you make a text bold in HTML?",
            "options": ["<bold>", "<b>", "<bb>", "<emp>"],
            "correct": 1,
            "explanation": "The <b> tag (or <strong>) is used to render text in bold format."
        },
        {
            "id": "h8",
            "question": "Which character is used to indicate an end tag in HTML?",
            "options": ["^", "*", "/", "\\"],
            "correct": 2,
            "explanation": "A forward slash (< / >) is used inside the closing tag to denote the end of an element."
        },
        {
            "id": "h9",
            "question": "What is the correct HTML element for inserting an image?",
            "options": ["<image>", "<img>", "<pic>", "<src>"],
            "correct": 1,
            "explanation": "<img> is the standard tag used to embed images in an HTML document."
        },
        {
            "id": "h10",
            "question": "Which HTML element is used to create a table row?",
            "options": ["<tb>", "<tr>", "<td>", "<table-row>"],
            "correct": 1,
            "explanation": "<tr> stands for table row, which contains table cells (<td> or <th>)."
        }
    ]
}

DEFAULT_ROUND_4_TECH_QUIZ_CONTENT = {
    "target_required": 4,
    "quiz_title": "Introductory Engineering MCQ Assessment",
    "questions": [
        {
            "question": "Who is the co-founder and famous former CEO of Apple?",
            "options": ["Bill Gates", "Steve Jobs", "Elon Musk", "Mark Zuckerberg"],
            "correct": 1
        },
        {
            "question": "Which popular social media platform was founded by Mark Zuckerberg and his college roommates in 2004?",
            "options": ["Twitter", "Instagram", "Facebook", "LinkedIn"],
            "correct": 2
        },
        {
            "question": "Who is the billionaire entrepreneur behind companies like SpaceX and Tesla?",
            "options": ["Jeff Bezos", "Elon Musk", "Sundar Pichai", "Satya Nadella"],
            "correct": 1
        },
        {
            "question": "What does the \"USB\" acronym stand for in computer hardware?",
            "options": ["Universal Serial Bus", "Useful System Board", "Ultra Speed Byte", "Unified Software Bridge"],
            "correct": 0
        },
        {
            "question": "Which company created the popular Android mobile operating system?",
            "options": ["Apple", "Microsoft", "Google", "IBM"],
            "correct": 2
        },
        {
            "question": "What does \"Wi-Fi\" stand for in wireless networking?",
            "options": [
                "Wireless Fidelity",
                "Wide Field",
                "Wired Filter",
                "It doesn't stand for anything (it's just a catchphrase)"
            ],
            "correct": 3
        },
        {
            "question": "Who founded the e-commerce giant Amazon in 1994?",
            "options": ["Jeff Bezos", "Bill Gates", "Steve Jobs", "Larry Page"],
            "correct": 0
        },
        {
            "question": "What is the main function of a computer's RAM (Random Access Memory)?",
            "options": [
                "Permanent storage for photos and videos",
                "Temporary working memory for active tasks",
                "Cooling down the processor",
                "Supplying battery power"
            ],
            "correct": 1
        },
        {
            "question": "Which search engine was created by Larry Page and Sergey Brin while they were students at Stanford University?",
            "options": ["Yahoo", "Bing", "Google", "Ask Jeeves"],
            "correct": 2
        },
        {
            "question": "What does the \"PDF\" file format stand for?",
            "options": ["Portable Document Format", "Printable Data File", "Program Document Folder", "Public Digital File"],
            "correct": 0
        }
    ]
}

DEFAULT_ROUND_5_WORKFLOW_CONTENT = {
    "workflow_type": "10_step_master_password",
    "description": "Sequential 10-step interactive master key assembly with uppercase transformation",
    "steps": [
        {"step": 1, "name": "Base Name", "desc": "Initial codename/identifier string"},
        {"step": 2, "name": "Number Addition", "desc": "Append numeric entropy value"},
        {"step": 3, "name": "Math Challenge", "question": "14 × 7", "answer": "98"},
        {"step": 4, "name": "Brand Logo Selection", "options": ["NEXUS", "OCTOCAT", "CYBER"]},
        {"step": 5, "name": "Color Choice", "options": ["CYAN", "VIOLET", "EMERALD"]},
        {"step": 6, "name": "Tech Tag", "options": ["TS", "PY", "GO", "RUST"]},
        {"step": 7, "name": "Special Symbol", "options": ["!", "#", "$", "&"]},
        {"step": 8, "name": "Verification Digit", "digit": "7"},
        {"step": 9, "name": "String Assembly", "desc": "Sequential combined token stream"},
        {"step": 10, "name": "Final Master Password", "desc": "UPPERCASE encoding & vault unlock"},
    ],
    "math_num1": 14,
    "math_num2": 7,
    "math_op": "×",
    "math_answer": "98",
    "verify_digit": "7",
}


def auto_upgrade_rounds_to_latest(rounds: list, db) -> None:
    """Auto-upgrades rounds 2, 3, 4, 5 to latest specifications:
    - Round 2: Password Verification Gate (validates strictly against Round 1 answer)
    - Round 3: Find a Code Error (10-question debugging pool, >= 3 correct needed)
    - Round 4: Tech Quiz (10-question MCQ pool, >= 4 correct needed)
    - Round 5: Crack Final Password (10-step master key assembly)
    """
    for r in rounds:
        r_num = r.get("round_number")

        # Round 2: Password Verification Gate
        if r_num == 2 and ("verification" not in str(r.get("round_title", "")).lower() or r.get("round_type") != "puzzle"):
            try:
                db.table("tech_relay_config").update({
                    "round_title": "Password Verification Gate",
                    "round_type": "puzzle",
                    "correct_answer": "VERIFY_ROUND1_PASSWORD",
                    "time_limit_seconds": 0,
                    "content": json.dumps(DEFAULT_ROUND_2_GATE_CONTENT),
                }).eq("round_number", 2).execute()
            except Exception as e:
                print(f"[TECH_RELAY] auto_upgrade Round 2 note: {e}")
            r["round_title"] = "Password Verification Gate"
            r["round_type"] = "puzzle"
            r["correct_answer"] = "VERIFY_ROUND1_PASSWORD"
            r["time_limit_seconds"] = 0
            r["content"] = DEFAULT_ROUND_2_GATE_CONTENT
        elif r_num == 2:
            r["round_title"] = "Password Verification Gate"
            r["round_type"] = "puzzle"
            r["correct_answer"] = "VERIFY_ROUND1_PASSWORD"
            r["time_limit_seconds"] = 0
            if not isinstance(r.get("content"), dict) or "rule" not in r.get("content", {}):
                r["content"] = DEFAULT_ROUND_2_GATE_CONTENT

        # Round 3: HTML Basic Practice Assessment (10 HTML MCQs, target 3)
        if r_num == 3 and (r.get("round_type") != "mcq" or "html" not in str(r.get("round_title", "")).lower()):
            try:
                db.table("tech_relay_config").update({
                    "round_title": "HTML Basic Practice Assessment",
                    "round_type": "mcq",
                    "correct_answer": "HTML_3_OF_10",
                    "time_limit_seconds": 0,
                    "content": json.dumps(DEFAULT_ROUND_3_HTML_CONTENT),
                }).eq("round_number", 3).execute()
            except Exception as e:
                print(f"[TECH_RELAY] auto_upgrade Round 3 note: {e}")
            r["round_title"] = "HTML Basic Practice Assessment"
            r["round_type"] = "mcq"
            r["correct_answer"] = "HTML_3_OF_10"
            r["time_limit_seconds"] = 0
            r["content"] = DEFAULT_ROUND_3_HTML_CONTENT
        elif r_num == 3:
            r["round_title"] = "HTML Basic Practice Assessment"
            r["round_type"] = "mcq"
            r["correct_answer"] = "HTML_3_OF_10"
            r["time_limit_seconds"] = 0
            if not isinstance(r.get("content"), dict) or len(r.get("content", {}).get("questions", [])) < 10:
                r["content"] = DEFAULT_ROUND_3_HTML_CONTENT

        # Round 4: Tech Quiz (10-question MCQ pool, target 4)
        if r_num == 4 and (r.get("round_type") != "mcq" or "quiz" not in str(r.get("round_title", "")).lower()):
            try:
                db.table("tech_relay_config").update({
                    "round_title": "Tech Quiz",
                    "round_type": "mcq",
                    "correct_answer": "MCQ_4_OF_10",
                    "time_limit_seconds": 0,
                    "content": json.dumps(DEFAULT_ROUND_4_TECH_QUIZ_CONTENT),
                }).eq("round_number", 4).execute()
            except Exception as e:
                print(f"[TECH_RELAY] auto_upgrade Round 4 note: {e}")
            r["round_title"] = "Tech Quiz"
            r["round_type"] = "mcq"
            r["correct_answer"] = "MCQ_4_OF_10"
            r["time_limit_seconds"] = 0
            r["content"] = DEFAULT_ROUND_4_TECH_QUIZ_CONTENT
        elif r_num == 4:
            r["round_title"] = "Tech Quiz"
            r["round_type"] = "mcq"
            r["correct_answer"] = "MCQ_4_OF_10"
            r["time_limit_seconds"] = 0
            if not isinstance(r.get("content"), dict) or len(r.get("content", {}).get("questions", [])) < 10 or "apple" not in json.dumps(r.get("content", {})).lower():
                r["content"] = DEFAULT_ROUND_4_TECH_QUIZ_CONTENT

        # Round 5: Ensure 10-step Crack Final Password format
        if r_num == 5:
            r["round_title"] = "Crack Final Password"
            r["round_type"] = "password"
            r["correct_answer"] = "CRACK_PASSWORD_10_STEP"
            r["time_limit_seconds"] = 0
            if not isinstance(r.get("content"), dict) or "workflow_type" not in r.get("content", {}):
                r["content"] = DEFAULT_ROUND_5_WORKFLOW_CONTENT


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
        auto_upgrade_rounds_to_latest(rounds, db)

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
            r1_answer = None
            r3_solved = []

            for item in rounds_completed:
                if isinstance(item, dict):
                    if item.get("_meta"):
                        current_question_index = item.get("current_question_index", 0)
                        if item.get("r1_answer"):
                            r1_answer = item["r1_answer"]
                        if item.get("r3_solved"):
                            r3_solved = item["r3_solved"]
                    else:
                        clean_completed.append(item)
                        if item.get("round") == 1 and item.get("user_answer"):
                            r1_answer = item["user_answer"]
                        if item.get("round") == 3 and item.get("solved_indices"):
                            r3_solved = item["solved_indices"]

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
                "r1_answer": r1_answer,
                "r3_solved": r3_solved,
            }

        return {
            "current_round": 1,
            "current_question_index": 0,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None,
            "r1_answer": None,
            "r3_solved": [],
        }
    except Exception as e:
        print(f"[TECH_RELAY] Progress fetch note: {e}")
        return {
            "current_round": 1,
            "current_question_index": 0,
            "rounds_completed": [],
            "is_completed": False,
            "started_at": None,
            "completed_at": None,
            "r1_answer": None,
            "r3_solved": [],
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
        es_res = db.table("exam_status") \
            .select("id") \
            .eq("student_id", student_id) \
            .ilike("exam_name", "Tech Relay") \
            .execute()
        if es_res.data and len(es_res.data) > 0:
            for rec in es_res.data:
                db.table("exam_status").update({
                    "status": "in_progress",
                    "warnings": 0,
                    "started_at": now,
                    "submitted_at": None,
                }).eq("id", rec["id"]).execute()
        else:
            db.table("exam_status").insert({
                "student_id": student_id,
                "exam_name": "Tech Relay",
                "status": "in_progress",
                "warnings": 0,
                "started_at": now,
                "submitted_at": None,
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

    # Parse existing rounds_completed & meta_info
    rounds_completed = progress.get("rounds_completed", []) if progress else []
    if isinstance(rounds_completed, str):
        try:
            rounds_completed = json.loads(rounds_completed)
        except Exception:
            rounds_completed = []

    meta_info = next((r for r in rounds_completed if isinstance(r, dict) and r.get("_meta")), {})
    rounds_completed = [r for r in rounds_completed if not (isinstance(r, dict) and r.get("_meta"))]
    now = datetime.now(timezone.utc).isoformat()

    # ══════════════════════════════════════════════════════════════
    # ROUND 1: Identity Gadgets
    # ══════════════════════════════════════════════════════════════
    if round_num == 1:
        assigned_idx = get_student_assigned_r1_index(
            student_id=student_id,
            relay_name=relay_name,
            total_questions=len(questions) if has_multi_questions else 1,
            db=db
        )
        target_q = questions[assigned_idx] if (has_multi_questions and assigned_idx < len(questions)) else (questions[0] if has_multi_questions else {})
        expected = target_q.get("correct_answer") or target_q.get("answer") or target_q.get("gadget_name") or round_config.get("correct_answer") or ""

        if str(answer).strip().upper() != str(expected).strip().upper():
            return {"success": False, "message": "Incorrect gadget name! Check the character clues carefully and try again."}

        clean_ans = answer.strip().upper()
        meta_info["r1_answer"] = clean_ans
        meta_info["current_question_index"] = 0

        existing_entry = next((r for r in rounds_completed if r.get("round") == 1), None)
        attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

        rounds_completed = [r for r in rounds_completed if r.get("round") != 1]
        rounds_completed.append({
            "round": 1,
            "completed_at": now,
            "attempts": attempts,
            "questions_solved": 1,
            "user_answer": clean_ans
        })
        rounds_completed.append(meta_info)

        progress_data = {
            "student_id": student_id,
            "relay_name": relay_name,
            "current_round": 2,
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
            "round_cleared": True,
            "message": f"🎉 Gadget '{clean_ans}' Solved! Round 2 (Password Verification Gate) Unlocked.",
            "next_round": 2,
            "next_question_index": 0,
            "r1_answer": clean_ans,
            "is_completed": False
        }

    # ══════════════════════════════════════════════════════════════
    # ROUND 2: Password Verification Gate
    # Strict predefined rule based on Round 1 answer
    # ══════════════════════════════════════════════════════════════
    elif round_num == 2:
        r1_ans = meta_info.get("r1_answer")
        if not r1_ans:
            for item in rounds_completed:
                if isinstance(item, dict) and item.get("round") == 1 and item.get("user_answer"):
                    r1_ans = item.get("user_answer")
                    break

        if not r1_ans:
            try:
                r1_cfg = db.table("tech_relay_config").select("content, correct_answer").eq("round_number", 1).limit(1).execute()
                if r1_cfg.data:
                    c1 = r1_cfg.data[0].get("content")
                    if isinstance(c1, str):
                        c1 = json.loads(c1)
                    if isinstance(c1, dict) and "questions" in c1 and len(c1["questions"]) > 0:
                        assigned_idx = get_student_assigned_r1_index(student_id, relay_name, len(c1["questions"]), db)
                        r1_ans = c1["questions"][assigned_idx].get("correct_answer") or c1["questions"][assigned_idx].get("gadget_name")
                    if not r1_ans:
                        r1_ans = r1_cfg.data[0].get("correct_answer")
            except Exception:
                pass

        if not r1_ans:
            r1_ans = "CAMERA"

        # Strictly validate typed password against Round 1 answer (case-insensitive)
        if str(answer).strip().upper() != str(r1_ans).strip().upper():
            return {
                "success": False,
                "message": f"Access Denied: Typed password does not match your Round 1 Gadget Codename! Enter '{r1_ans}' exactly."
            }

        existing_entry = next((r for r in rounds_completed if r.get("round") == 2), None)
        attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

        rounds_completed = [r for r in rounds_completed if r.get("round") != 2]
        rounds_completed.append({
            "round": 2,
            "completed_at": now,
            "attempts": attempts,
            "questions_solved": 1,
            "user_answer": str(answer).strip().upper()
        })
        meta_info["current_question_index"] = 0
        rounds_completed.append(meta_info)

        progress_data = {
            "student_id": student_id,
            "relay_name": relay_name,
            "current_round": 3,
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
            "round_cleared": True,
            "message": "🔒 Access Granted! Password verified against Round 1 Gadget. Round 3 (HTML Basic Practice Assessment) Unlocked!",
            "next_round": 3,
            "next_question_index": 0,
            "is_completed": False
        }

    # ══════════════════════════════════════════════════════════════
    # ROUND 3: HTML Basic Practice Assessment (10 MCQs, >= 3 correct needed)
    # ══════════════════════════════════════════════════════════════
    elif round_num == 3:
        html_questions = DEFAULT_ROUND_3_HTML_CONTENT["questions"]
        if has_multi_questions and len(questions) >= 10:
            html_questions = questions

        # Check if full quiz answers submitted as JSON
        submitted_answers = None
        try:
            if isinstance(answer, str) and "{" in answer:
                parsed = json.loads(answer)
                if isinstance(parsed, dict) and "answers" in parsed:
                    submitted_answers = parsed.get("answers", [])
            elif isinstance(answer, list):
                submitted_answers = answer
        except Exception:
            submitted_answers = None

        if submitted_answers is not None:
            if len(submitted_answers) < len(html_questions) or any(a is None or a == -1 for a in submitted_answers):
                return {
                    "success": False,
                    "message": f"Please answer all {len(html_questions)} HTML questions before submitting."
                }

            correct_count = 0
            for i, q in enumerate(html_questions):
                if i < len(submitted_answers) and int(submitted_answers[i]) == int(q.get("correct", 0)):
                    correct_count += 1

            if correct_count < 3:
                return {
                    "success": False,
                    "message": f"You scored {correct_count}/10. At least 3 correct answers are required to unlock Round 4. Check your answers and try again!"
                }

            # Round 3 Cleared!
            existing_entry = next((r for r in rounds_completed if r.get("round") == 3), None)
            attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

            rounds_completed = [r for r in rounds_completed if r.get("round") != 3]
            rounds_completed.append({
                "round": 3,
                "completed_at": now,
                "attempts": attempts,
                "score": correct_count,
                "total": len(html_questions),
                "questions_solved": correct_count
            })
            meta_info["current_question_index"] = 0
            rounds_completed.append(meta_info)

            progress_data = {
                "student_id": student_id,
                "relay_name": relay_name,
                "current_round": 4,
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
                "round_cleared": True,
                "message": f"🎯 Outstanding! You scored {correct_count}/10 on HTML Assessment! (Minimum 3 required). Round 4 (Tech Quiz) Unlocked.",
                "next_round": 4,
                "next_question_index": 0,
                "is_completed": False
            }
        else:
            # Single question submission fallback
            if q_idx >= len(html_questions):
                q_idx = 0
            target_q = html_questions[q_idx]
            corr_opt = str(target_q.get("correct", 0))
            options = target_q.get("options", [])
            user_str = str(answer).strip().lower()
            is_correct = (
                user_str == corr_opt or
                (corr_opt.isdigit() and len(options) > int(corr_opt) and user_str == options[int(corr_opt)].strip().lower())
            )
            if not is_correct:
                return {
                    "success": False,
                    "message": f"Incorrect answer for Question {q_idx + 1}. Try again!"
                }

            r3_solved = set(meta_info.get("r3_solved", []))
            r3_solved.add(q_idx)
            solved_list = sorted(list(r3_solved))
            meta_info["r3_solved"] = solved_list
            solved_count = len(solved_list)

            if solved_count >= 3:
                existing_entry = next((r for r in rounds_completed if r.get("round") == 3), None)
                attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

                rounds_completed = [r for r in rounds_completed if r.get("round") != 3]
                rounds_completed.append({
                    "round": 3,
                    "completed_at": now,
                    "attempts": attempts,
                    "questions_solved": solved_count,
                    "solved_indices": solved_list
                })
                meta_info["current_question_index"] = 0
                rounds_completed.append(meta_info)

                progress_data = {
                    "student_id": student_id,
                    "relay_name": relay_name,
                    "current_round": 4,
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
                    "round_cleared": True,
                    "message": f"🎯 Superb! You answered {solved_count}/3 questions correctly! Round 4 (Tech Quiz) Unlocked.",
                    "next_round": 4,
                    "next_question_index": 0,
                    "r3_solved": solved_list,
                    "solved_count": solved_count,
                    "is_completed": False
                }
            else:
                rounds_completed.append(meta_info)
                progress_data = {
                    "student_id": student_id,
                    "relay_name": relay_name,
                    "current_round": 3,
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
                    "message": f"✅ Question {q_idx + 1} Correct! ({solved_count}/3 required).",
                    "next_question_index": (q_idx + 1) % len(html_questions),
                    "r3_solved": solved_list,
                    "solved_count": solved_count,
                    "is_completed": False
                }

    # ══════════════════════════════════════════════════════════════
    # ROUND 4: Tech Quiz (10 MCQs, >= 4 correct needed)
    # ══════════════════════════════════════════════════════════════
    elif round_num == 4:
        quiz_questions = DEFAULT_ROUND_4_TECH_QUIZ_CONTENT["questions"]
        if has_multi_questions and len(questions) >= 10:
            quiz_questions = questions

        try:
            submitted = json.loads(answer) if isinstance(answer, str) and "{" in answer else {"answers": [answer]}
            submitted_answers = submitted.get("answers", [])
        except Exception:
            submitted_answers = []

        if len(submitted_answers) < len(quiz_questions):
            return {
                "success": False,
                "message": f"Please answer all {len(quiz_questions)} questions before submitting."
            }

        correct_count = 0
        for i, q in enumerate(quiz_questions):
            if i < len(submitted_answers) and int(submitted_answers[i]) == int(q.get("correct", 0)):
                correct_count += 1

        if correct_count < 4:
            return {
                "success": False,
                "message": f"You scored {correct_count}/10. Minimum 4 correct answers required to unlock Round 5. Check your answers and try again!"
            }

        existing_entry = next((r for r in rounds_completed if r.get("round") == 4), None)
        attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

        rounds_completed = [r for r in rounds_completed if r.get("round") != 4]
        rounds_completed.append({
            "round": 4,
            "completed_at": now,
            "attempts": attempts,
            "questions_solved": correct_count,
            "score": correct_count,
            "total": len(quiz_questions)
        })
        meta_info["current_question_index"] = 0
        rounds_completed.append(meta_info)

        progress_data = {
            "student_id": student_id,
            "relay_name": relay_name,
            "current_round": 5,
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
            "round_cleared": True,
            "message": f"🎉 Excellent! Score: {correct_count}/10 (4+ required). Final Round (Crack Password) Unlocked!",
            "next_round": 5,
            "next_question_index": 0,
            "score": correct_count,
            "total": len(quiz_questions),
            "is_completed": False
        }

    # ══════════════════════════════════════════════════════════════
    # ROUND 5: Crack Final Password (10-step master key assembly)
    # ══════════════════════════════════════════════════════════════
    elif round_num == 5:
        if len(str(answer).strip()) >= 5:
            is_correct = True
        else:
            expected = (round_config.get("correct_answer") or "").strip()
            is_correct = bool(expected and str(answer).strip().lower() == str(expected).strip().lower())

        if not is_correct:
            return {"success": False, "message": "Invalid master password. Complete the 10-step sequence to unlock the vault!"}

        existing_entry = next((r for r in rounds_completed if r.get("round") == 5), None)
        attempts = (existing_entry["attempts"] + 1) if existing_entry else 1

        rounds_completed = [r for r in rounds_completed if r.get("round") != 5]
        rounds_completed.append({
            "round": 5,
            "completed_at": now,
            "attempts": attempts,
            "questions_solved": 1
        })
        meta_info["current_question_index"] = 0
        rounds_completed.append(meta_info)

        progress_data = {
            "student_id": student_id,
            "relay_name": relay_name,
            "current_round": 6,
            "rounds_completed": json.dumps(rounds_completed),
            "is_completed": True,
            "completed_at": now
        }
        if progress:
            db.table("tech_relay_progress").update(progress_data).eq("id", progress["id"]).execute()
        else:
            progress_data["started_at"] = now
            db.table("tech_relay_progress").insert(progress_data).execute()

        return {
            "success": True,
            "round_cleared": True,
            "message": "🏆 Relay Complete! Congratulations, you conquered all 5 rounds!",
            "next_round": None,
            "next_question_index": 0,
            "is_completed": True
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid round number")


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
        auto_upgrade_rounds_to_latest(rounds, db)
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
    include_all: bool = True,
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

        # Also clear any security termination and strikes if the student had been locked out
        try:
            es_rows = db.table("exam_status") \
                .select("id") \
                .eq("student_id", body.student_id) \
                .ilike("exam_name", body.relay_name) \
                .execute()
            if es_rows.data and len(es_rows.data) > 0:
                for rec in es_rows.data:
                    db.table("exam_status").update({
                        "status": "in_progress",
                        "warnings": 0,
                        "submitted_at": None,
                    }).eq("id", rec["id"]).execute()
            else:
                db.table("exam_status").insert({
                    "student_id": body.student_id,
                    "exam_name": body.relay_name,
                    "status": "in_progress",
                    "warnings": 0,
                    "started_at": now,
                    "submitted_at": None,
                }).execute()
        except Exception as e_es:
            print(f"[TECH_RELAY] exam_status force unlock note: {e_es}")

        return {"success": True, "message": f"Unlocked Round {body.next_round} for student"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_force_unlock error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/clear-strikes")
async def admin_clear_strikes(body: ClearStrikesRequest, _: bool = Depends(verify_admin)):
    """Clear all strikes/violations and unblock security termination for a student without resetting progress."""
    try:
        db = get_supabase()
        # Reset warnings to 0 and status back to active/in_progress
        try:
            db.table("exam_status") \
                .update({"status": "in_progress", "warnings": 0, "submitted_at": None}) \
                .eq("student_id", body.student_id) \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception as e_es:
            print(f"[TECH_RELAY] clear strikes exam_status update note: {e_es}")

        try:
            db.table("violations") \
                .delete() \
                .eq("student_id", body.student_id) \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception:
            try:
                db.table("violations") \
                    .delete() \
                    .eq("student_id", body.student_id) \
                    .execute()
            except Exception:
                pass

        return {"success": True, "message": "Strikes cleared and exam termination unblocked"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_clear_strikes error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reset-student")
async def admin_reset_student(body: ResetStudentRequest, _: bool = Depends(verify_admin)):
    """Reset all relay progress and anti-cheat strikes for a student so they can restart fresh."""
    try:
        db = get_supabase()
        # 1. Delete progress
        db.table("tech_relay_progress") \
            .delete() \
            .eq("student_id", body.student_id) \
            .eq("relay_name", body.relay_name) \
            .execute()

        # 2. Reset / delete exam_status so strikes and auto-submit are completely cleared
        try:
            db.table("exam_status") \
                .delete() \
                .eq("student_id", body.student_id) \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception as e_es:
            print(f"[TECH_RELAY] exam_status delete error: {e_es}")
            try:
                db.table("exam_status") \
                    .update({"warnings": 0, "status": "active", "submitted_at": None}) \
                    .eq("student_id", body.student_id) \
                    .ilike("exam_name", body.relay_name) \
                    .execute()
            except Exception:
                pass

        # 3. Clear violation records for this student and relay
        try:
            db.table("violations") \
                .delete() \
                .eq("student_id", body.student_id) \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception:
            try:
                db.table("violations") \
                    .delete() \
                    .eq("student_id", body.student_id) \
                    .execute()
            except Exception:
                pass

        return {"success": True, "message": "Student relay progress and strikes have been completely reset"}
    except Exception as e:
        print(f"[TECH_RELAY] admin_reset_student error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reset-all")
async def admin_reset_all_relay(body: ResetRelayRequest, _: bool = Depends(verify_admin)):
    """Reset all student progress and strikes for a relay so the entire tournament can start fresh."""
    try:
        db = get_supabase()
        db.table("tech_relay_progress") \
            .delete() \
            .eq("relay_name", body.relay_name) \
            .execute()

        try:
            db.table("exam_status") \
                .delete() \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception as e_es:
            print(f"[TECH_RELAY] exam_status delete error on reset-all: {e_es}")
            try:
                db.table("exam_status") \
                    .update({"warnings": 0, "status": "active", "submitted_at": None}) \
                    .ilike("exam_name", body.relay_name) \
                    .execute()
            except Exception:
                pass

        try:
            db.table("violations") \
                .delete() \
                .ilike("exam_name", body.relay_name) \
                .execute()
        except Exception:
            pass

        return {"success": True, "message": f"All student progress and strikes for '{body.relay_name}' have been wiped. Tournament reset successfully."}
    except Exception as e:
        print(f"[TECH_RELAY] admin_reset_all_relay error: {e}")
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

