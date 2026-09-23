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

-- Round 3: HTML Basic Practice Assessment (10 MCQs, >= 3 correct needed)
UPDATE tech_relay_config
SET 
  round_title = 'HTML Basic Practice Assessment',
  round_type = 'mcq',
  time_limit_seconds = 0,
  correct_answer = 'HTML_3_OF_10',
  content = '{
    "target_required": 3,
    "quiz_title": "HTML Basic Practice Assessment",
    "subject": "Web Technologies / Programming for Problem Solving",
    "questions": [
      {
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
        "question": "Which HTML tag is used to create the largest heading?",
        "options": ["<head>", "<h6>", "<heading>", "<h1>"],
        "correct": 3,
        "explanation": "<h1> defines the most important and largest heading, down to <h6> which is the smallest."
      },
      {
        "question": "What is the correct HTML tag for inserting a line break?",
        "options": ["<lb>", "<break>", "<br>", "<ln>"],
        "correct": 2,
        "explanation": "<br> inserts a single line break in the text."
      },
      {
        "question": "Which HTML tag is used to create a hyperlink?",
        "options": ["<link>", "<a>", "<href>", "<url>"],
        "correct": 1,
        "explanation": "The anchor tag <a> is used to create hyperlinks connecting one page to another."
      },
      {
        "question": "Which attribute is used to specify the URL of an image in the <img> tag?",
        "options": ["src", "href", "link", "url"],
        "correct": 0,
        "explanation": "The src (source) attribute specifies the path/URL to the image file."
      },
      {
        "question": "Which HTML element is used to define an unordered list (bulleted list)?",
        "options": ["<ol>", "<list>", "<ul>", "<bl>"],
        "correct": 2,
        "explanation": "<ul> creates an unordered bulleted list, whereas <ol> creates an ordered numbered list."
      },
      {
        "question": "How can you make a text bold in HTML?",
        "options": ["<bold>", "<b>", "<bb>", "<emp>"],
        "correct": 1,
        "explanation": "The <b> tag (or <strong>) is used to render text in bold format."
      },
      {
        "question": "Which character is used to indicate an end tag in HTML?",
        "options": ["^", "*", "/", "\\"],
        "correct": 2,
        "explanation": "A forward slash (< / >) is used inside the closing tag to denote the end of an element."
      },
      {
        "question": "What is the correct HTML element for inserting an image?",
        "options": ["<image>", "<img>", "<pic>", "<src>"],
        "correct": 1,
        "explanation": "<img> is the standard tag used to embed images in an HTML document."
      },
      {
        "question": "Which HTML element is used to create a table row?",
        "options": ["<tb>", "<tr>", "<td>", "<table-row>"],
        "correct": 1,
        "explanation": "<tr> stands for table row, which contains table cells (<td> or <th>)."
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
