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
        "options": ["Wireless Fidelity", "Wide Field", "Wired Filter", "It doesn''t stand for anything (it''s just a catchphrase)"],
        "correct": 3
      },
      {
        "question": "Who founded the e-commerce giant Amazon in 1994?",
        "options": ["Jeff Bezos", "Bill Gates", "Steve Jobs", "Larry Page"],
        "correct": 0
      },
      {
        "question": "What is the main function of a computer''s RAM (Random Access Memory)?",
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
  }'::jsonb
WHERE round_number = 4;
