-- ============================================================
-- Migration V20: Tech Relay Rounds 1 to 4 Redefinition
-- 1. Round 1: Identity Gadgets (Word/Gadget identification)
-- 2. Round 2: Password Verification Gate (Validates based on Round 1 answer)
-- 3. Round 3: Find a Code Error (10 debugging questions, >= 3 correct required)
-- 4. Round 4: Tech Quiz (10 MCQs, >= 4 correct required)
-- ============================================================

-- Disable RLS to allow backend service operations
ALTER TABLE IF EXISTS tech_relay_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tech_relay_progress DISABLE ROW LEVEL SECURITY;

-- Round 2: Password Verification Gate
UPDATE tech_relay_config
SET 
  round_title = 'Password Verification Gate',
  round_type = 'puzzle',
  time_limit_seconds = 0,
  correct_answer = 'VERIFY_ROUND1_PASSWORD',
  content = '{
    "title": "Password Verification Gate",
    "instruction": "Verify your clearance by typing your exact Round 1 gadget codename to unlock Round 3.",
    "rule": "Exact match with Round 1 Gadget Codename"
  }'::jsonb
WHERE round_number = 2;

-- Round 3: Find a Code Error (Pool of 10 debugging questions, >= 3 correct needed)
UPDATE tech_relay_config
SET 
  round_title = 'Find a Code Error',
  round_type = 'debug',
  time_limit_seconds = 0,
  correct_answer = 'DEBUG_3_OF_10',
  content = '{
    "target_required": 3,
    "questions": [
      {
        "id": "d1",
        "title": "Off-by-One Loop Error",
        "language": "python",
        "code": "def sum_numbers(n):\n    total = 0\n    for i in range(1, n):  # Bug: excludes n\n        total += i\n    return total",
        "bug_description": "The loop stops at n - 1 instead of including n in the total sum.",
        "hint": "Change range stop value to include n.",
        "options": [
          "for i in range(1, n + 1):",
          "for i in range(0, n - 1):",
          "for i in range(n):",
          "for i in range(1, total):"
        ],
        "correct": 0,
        "correct_answer": "range(1, n + 1)"
      },
      {
        "id": "d2",
        "title": "Array Index Out of Bounds",
        "language": "javascript",
        "code": "function getLastElement(arr) {\n    return arr[arr.length]; // Bug: undefined\n}",
        "bug_description": "Array indexing is zero-based; arr[arr.length] accesses an undefined index.",
        "hint": "Last index is length minus one.",
        "options": [
          "return arr[arr.length + 1];",
          "return arr[arr.length - 1];",
          "return arr[-1];",
          "return arr[0];"
        ],
        "correct": 1,
        "correct_answer": "arr[arr.length - 1]"
      },
      {
        "id": "d3",
        "title": "Mutable Default Argument",
        "language": "python",
        "code": "def append_to_list(val, my_list=[]):\n    my_list.append(val)\n    return my_list",
        "bug_description": "Default list argument is evaluated once at definition, accumulating across calls.",
        "hint": "Use None as default and initialize inside function.",
        "options": [
          "def append_to_list(val, my_list=None):",
          "def append_to_list(val, my_list=tuple()):",
          "def append_to_list(val, my_list=dict()):",
          "def append_to_list(val, my_list=\"\"):"
        ],
        "correct": 0,
        "correct_answer": "None"
      },
      {
        "id": "d4",
        "title": "Type Mismatch Concatenation",
        "language": "python",
        "code": "def get_user_badge(name, score):\n    return name + \" - Score: \" + score  # TypeError",
        "bug_description": "Cannot concatenate str and int objects directly in Python.",
        "hint": "Convert score to string before concatenation.",
        "options": [
          "return name + \" - Score: \" + str(score)",
          "return name + \" - Score: \" + int(score)",
          "return name + \" - Score: \" + [score]",
          "return name + \" - Score: \" + (score)"
        ],
        "correct": 0,
        "correct_answer": "str(score)"
      },
      {
        "id": "d5",
        "title": "UnboundLocalError in Variable Scope",
        "language": "python",
        "code": "counter = 0\ndef increment():\n    counter += 1  # UnboundLocalError\n    return counter",
        "bug_description": "Modifying global counter inside function without global declaration raises UnboundLocalError.",
        "hint": "Declare counter as global inside increment.",
        "options": [
          "local counter",
          "global counter",
          "static counter",
          "var counter"
        ],
        "correct": 1,
        "correct_answer": "global counter"
      },
      {
        "id": "d6",
        "title": "Missing Return Statement",
        "language": "javascript",
        "code": "function calculateDiscount(price, percentage) {\n    const discount = price * (percentage / 100);\n    const finalPrice = price - discount;\n}",
        "bug_description": "Function calculates finalPrice but returns undefined because return statement is missing.",
        "hint": "Return finalPrice at the end of the function.",
        "options": [
          "return finalPrice;",
          "output finalPrice;",
          "export finalPrice;",
          "yield finalPrice;"
        ],
        "correct": 0,
        "correct_answer": "return finalPrice"
      },
      {
        "id": "d7",
        "title": "Dictionary KeyError Crash",
        "language": "python",
        "code": "def get_user_role(profile):\n    return profile[\"role\"]  # Crashes if missing",
        "bug_description": "Direct bracket access raises KeyError if \"role\" key is absent.",
        "hint": "Use safe dictionary access with default fallback.",
        "options": [
          "return profile.get(\"role\", \"guest\")",
          "return profile[\"role\"] or None",
          "return profile.find(\"role\")",
          "return profile.index(\"role\")"
        ],
        "correct": 0,
        "correct_answer": "profile.get(\"role\", \"guest\")"
      },
      {
        "id": "d8",
        "title": "Strict Equality Type Coercion",
        "language": "javascript",
        "code": "function isZero(val) {\n    return val === 0;  // Fails if val is \"0\"\n}",
        "bug_description": "Strict equality operator does not coerce string \"0\" to number 0.",
        "hint": "Cast val to Number before comparison.",
        "options": [
          "return Number(val) === 0;",
          "return val == \"0\" && val === 0;",
          "return typeof val === 0;",
          "return String(val) === 0;"
        ],
        "correct": 0,
        "correct_answer": "Number(val) === 0"
      },
      {
        "id": "d9",
        "title": "Tuple Immutability TypeError",
        "language": "python",
        "code": "coords = (12.5, 77.2)\ncoords[0] = 13.0  # TypeError: tuple does not support item assignment",
        "bug_description": "Tuples are immutable in Python; elements cannot be reassigned in-place.",
        "hint": "Create a new tuple or use a list for mutable coordinates.",
        "options": [
          "coords = (13.0, coords[1])",
          "coords.append(13.0)",
          "coords.update(0, 13.0)",
          "set(coords)[0] = 13.0"
        ],
        "correct": 0,
        "correct_answer": "coords = (13.0, coords[1])"
      },
      {
        "id": "d10",
        "title": "Division by Zero Exception",
        "language": "python",
        "code": "def compute_ratio(a, b):\n    return a / b  # Crashes if b is 0",
        "bug_description": "ZeroDivisionError raised when b equals zero.",
        "hint": "Check if denominator b is not zero before dividing.",
        "options": [
          "return a / b if b != 0 else 0",
          "return a // 0",
          "return b / a",
          "return a % b"
        ],
        "correct": 0,
        "correct_answer": "return a / b if b != 0 else 0"
      }
    ]
  }'::jsonb
WHERE round_number = 3;

-- Round 4: Tech Quiz (Pool of 10 MCQs, >= 4 correct needed)
UPDATE tech_relay_config
SET 
  round_title = 'Tech Quiz',
  round_type = 'mcq',
  time_limit_seconds = 0,
  correct_answer = 'MCQ_4_OF_10',
  content = '{
    "target_required": 4,
    "questions": [
      {
        "question": "What is the return type of type(None) in Python?",
        "options": ["<class ''NoneType''>", "<class ''null''>", "<class ''void''>", "<class ''undefined''>"],
        "correct": 0
      },
      {
        "question": "Which data structure operates strictly on a LIFO (Last In, First Out) principle?",
        "options": ["Queue", "Stack", "Array", "Hash Table"],
        "correct": 1
      },
      {
        "question": "What is the average time complexity of searching an element in a balanced Binary Search Tree?",
        "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        "correct": 2
      },
      {
        "question": "Which HTTP status code officially signifies \"Unauthorized\" access?",
        "options": ["403 Forbidden", "401 Unauthorized", "400 Bad Request", "404 Not Found"],
        "correct": 1
      },
      {
        "question": "In SQL, which keyword is used to eliminate duplicate rows from a query result?",
        "options": ["UNIQUE", "DISTINCT", "DIFFERENT", "FILTER"],
        "correct": 1
      },
      {
        "question": "Which JavaScript equality operator checks both value and type without coercion?",
        "options": ["==", "===", "!=", "=:"],
        "correct": 1
      },
      {
        "question": "Which of the following is NOT a standard valid IP protocol version?",
        "options": ["IPv4", "IPv6", "IPv5", "All of these are standard"],
        "correct": 2
      },
      {
        "question": "In Git, which command creates a new branch and immediately switches to it?",
        "options": ["git branch -n <name>", "git checkout -b <name>", "git fetch -new <name>", "git push -b <name>"],
        "correct": 1
      },
      {
        "question": "Which clause in a Python try...except...finally block ALWAYS executes regardless of exceptions?",
        "options": ["except", "else", "finally", "pass"],
        "correct": 2
      },
      {
        "question": "In a relational database table, which key uniquely identifies each record in the table?",
        "options": ["Foreign Key", "Primary Key", "Candidate Index", "Composite View"],
        "correct": 1
      }
    ]
  }'::jsonb
WHERE round_number = 4;
