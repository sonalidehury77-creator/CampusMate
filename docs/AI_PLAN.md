# CampusMate — AI Architecture and Plan

# 1. Purpose

Artificial intelligence is one of the major differentiating features of CampusMate.

However, CampusMate AI will not simply be a generic chatbot.

The objective is to create a context-aware academic assistant that can use relevant authorized CampusMate information to provide useful answers, plans, summaries, and recommendations.

---

# 2. AI Philosophy

CampusMate AI should answer two different types of questions.

## General Questions

Example:

> Explain normalization in DBMS.

The AI can provide a normal educational explanation.

## Context-Aware Questions

Example:

> What should I study today?

For this question, the AI should use relevant CampusMate information such as:

* Student subjects
* Timetable
* Assignments
* Exam dates
* Study progress
* Deadlines
* Available study time

This is what makes CampusMate AI different.

---

# 3. AI Technology

Primary AI provider:

OpenAI API

The application should communicate with the AI through secure server-side code.

The API key must never be exposed in browser/client-side code.

---

# 4. AI Architecture

High-level flow:

```text
Student
   ↓
CampusMate UI
   ↓
Server-side AI endpoint
   ↓
Authentication check
   ↓
Authorization check
   ↓
Retrieve relevant CampusMate data
   ↓
Prepare AI context
   ↓
OpenAI API
   ↓
Validate/process response
   ↓
CampusMate UI
```

---

# 5. Important Security Rule

The AI system must never receive unrestricted access to the database.

Instead:

```text
User Request
     ↓
Determine required information
     ↓
Check user authorization
     ↓
Retrieve only required data
     ↓
Send relevant context
     ↓
AI
```

This follows the principle of least privilege.

---

# 6. CampusMate AI Features

V1 AI features:

1. AI Chat
2. AI Study Planner
3. PDF Summarizer
4. Question Generator
5. Notice Reader
6. Smart Recommendations
7. Academic Assistance

---

# 7. AI Chat

The student can ask questions such as:

* Explain DBMS normalization.
* Explain this mathematics topic.
* What assignments are due this week?
* What should I study today?
* What should I prioritize?

The assistant should distinguish between:

* General educational questions
* Questions requiring CampusMate context

---

# 8. Context-Aware AI

Example:

Student asks:

> What should I study today?

CampusMate retrieves relevant data:

```text
Today's timetable
Upcoming assignments
Exam dates
Subject progress
Pending tasks
Available time
```

Then sends structured context to the AI.

The AI produces:

```text
Today's Smart Plan

6:00–6:45
Discrete Mathematics
Group Theory

6:45–7:00
Break

7:00–7:45
DBMS
Normalization

7:45–8:00
Review assignment
```

The AI should not invent actual CampusMate facts.

---

# 9. AI Study Planner

Inputs:

* Subject
* Exam date
* Syllabus
* Completed units
* Remaining units
* Available time
* Assignment deadlines
* Preferred study duration

Output:

* Study schedule
* Priority topics
* Revision sessions
* Breaks
* Practice sessions
* Review sessions

The generated plan should be saved when the user chooses to save it.

---

# 10. AI PDF Assistant

User uploads an academic PDF.

Flow:

```text
PDF
 ↓
Secure file upload
 ↓
Text extraction
 ↓
Relevant content
 ↓
AI processing
 ↓
Answer
```

Possible actions:

* Summarize
* Explain
* Generate questions
* Generate revision notes
* Extract important topics
* Create flashcards
* Create exam-oriented questions

---

# 11. AI Notice Reader

Flow:

```text
Notice PDF/Image
       ↓
Text extraction / OCR
       ↓
AI analysis
       ↓
Important information
       ↓
Deadline
       ↓
Category
       ↓
Priority
       ↓
User/Admin review where necessary
       ↓
Notice/reminder
```

Example:

```text
Original Notice

Semester Examination Form

Last date: September 5

CampusMate AI

Category:
Examination

Deadline:
September 5

Priority:
Urgent
```

Important institutional facts should remain tied to the original notice.

AI extraction should not be treated as more authoritative than the source notice.

---

# 12. AI Question Generator

User can select:

* Subject
* Unit
* Difficulty
* Number of questions
* Question type

Possible output:

* Short questions
* Long questions
* MCQs
* Viva questions
* Numerical problems
* Revision questions

---

# 13. AI Explanation Mode

The student can ask:

> Explain this like a beginner.

The system can adapt explanation style.

Possible modes:

* Beginner
* Detailed
* Exam-oriented
* Short revision
* Numerical practice
* Viva preparation

---

# 14. AI Academic Assistant

Possible prompts:

> Explain this topic.

> Give me an example.

> Ask me five questions.

> Check my answer.

> Give me a revision plan.

> What are the most important topics?

> Make this easier to understand.

This should make AI useful for actual studying rather than entertainment.

---

# 15. Smart Recommendation Engine

This is one of the most important CampusMate features.

CampusMate can combine:

```text
Attendance
+
Assignments
+
Timetable
+
Exams
+
Study progress
+
Deadlines
+
Available time
```

and generate recommendations.

Example:

```text
You have a DBMS assignment due tomorrow.

Your DBMS Unit 3 progress is 40%.

You have a 90-minute free period.

Recommendation:

45 minutes → Complete assignment
30 minutes → Revise Unit 3
15 minutes → Review important questions
```

---

# 16. Recommendation Priority

The system should consider factors such as:

1. Urgency
2. Deadline
3. Academic importance
4. Student progress
5. Available time
6. Attendance risk
7. Exam proximity

The exact scoring model can evolve during development.

---

# 17. Academic Health

CampusMate can eventually calculate a high-level academic status.

Example:

```text
Academic Health

Attendance       🟢 Good
Assignments      🟡 Needs Attention
DBMS Preparation 🔴 Low
Mathematics      🟢 Good
```

This is intended as an informative summary rather than a medical or official institutional score.

---

# 18. AI Memory

CampusMate should distinguish between:

### Temporary context

Information needed only for one request.

### Saved user information

Information deliberately stored in the student's CampusMate profile or settings.

The AI should not permanently remember arbitrary private conversations unless the product explicitly supports and explains such storage.

---

# 19. AI Conversation History

If conversation history is enabled:

```text
Conversation
   ↓
User
   ↓
AI response
   ↓
Saved conversation
```

Users should be able to delete their AI conversations where supported.

---

# 20. AI Data Privacy

CampusMate should minimize unnecessary transmission of personal information to the AI provider.

When possible:

* Use only required fields
* Avoid unnecessary identifiers
* Do not send passwords
* Do not send authentication secrets
* Do not send unrelated private information
* Do not expose internal database credentials

---

# 21. AI Error Handling

AI can fail.

Possible failures:

* API unavailable
* Timeout
* Rate limit
* Invalid response
* Network failure
* File processing failure

The application should show useful messages.

Example:

> CampusMate AI is temporarily unavailable. Your saved academic data is safe. Please try again shortly.

---

# 22. AI Hallucination Protection

The AI may sometimes generate incorrect information.

For important CampusMate information:

* Preserve source documents
* Show original notices where appropriate
* Clearly distinguish generated suggestions from official information
* Avoid presenting AI-generated institutional facts as authoritative
* Allow users to verify important deadlines

---

# 23. AI Cost Control

AI requests can become expensive.

We will therefore implement:

* Request limits
* Appropriate model selection
* Context size limits
* File size limits
* Caching where useful
* Usage monitoring
* Abuse prevention

The exact limits will be configured later.

---

# 24. AI Prompt Architecture

Prompts should not be scattered throughout random frontend files.

AI-related server-side logic should eventually be organized in a dedicated area.

Conceptual structure:

```text
lib/
└── ai/
    ├── client.ts
    ├── prompts.ts
    ├── context.ts
    ├── planner.ts
    ├── notice-reader.ts
    └── pdf-assistant.ts
```

The exact structure may evolve as implementation progresses.

---

# 25. AI Tools

The AI may eventually be able to request specific controlled actions.

For example:

```text
get_today_schedule
get_upcoming_assignments
get_attendance
get_subject_progress
get_exam_dates
```

The application, not the AI itself, controls access to these tools.

Example:

```text
AI
 ↓
Request: get_attendance
 ↓
Server validates user
 ↓
Database query
 ↓
Only authorized data returned
 ↓
AI
```

---

# 26. AI and Database

The AI should never directly execute arbitrary SQL generated by a user or model.

Instead:

```text
AI
 ↓
Controlled application function
 ↓
Validated parameters
 ↓
Authorized database query
```

This reduces security risks.

---

# 27. AI and File Uploads

Uploaded files should be validated before processing.

Checks can include:

* File type
* File size
* Authentication
* Authorization
* Storage permissions
* Processing limits

Malicious or unsupported files should be rejected.

---

# 28. AI Development Order

AI should not be the first thing we build.

Recommended order:

```text
Authentication
      ↓
Database
      ↓
Academic features
      ↓
Assignments
      ↓
Timetable
      ↓
Attendance
      ↓
Resources
      ↓
Notices
      ↓
Real student data
      ↓
AI foundation
      ↓
AI Chat
      ↓
PDF Assistant
      ↓
Study Planner
      ↓
Smart Recommendations
```

This ensures the AI has meaningful data to work with.

---

# 29. Future AI Features

Possible V2/V3 features:

* Voice assistant
* AI career advisor
* AI resume assistant
* AI interview practice
* Personalized learning recommendations
* Exam prediction support
* Advanced academic analytics
* Automatic resource categorization
* Intelligent campus search
* Multilingual assistance

---

# 30. AI Goal

The ultimate goal is:

> CampusMate should help students decide what to do next, not merely answer questions.

The AI layer should therefore connect the application's existing features into a useful student assistant.
