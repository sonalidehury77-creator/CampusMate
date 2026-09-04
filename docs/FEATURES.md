# CampusMate — Feature Specification

# V1 — CORE FEATURES

## 1. Authentication

### Student

* Registration
* Login
* Logout
* Password recovery
* Session management
* Profile

### Faculty

* Login
* Logout
* Profile
* Role-specific access

### Admin

* Login
* Logout
* Role-specific access

### Security

Authentication must be handled by Supabase Auth.

Authorization must be enforced independently from the visual interface.

---

# 2. Student Profile

A student profile contains:

* Name
* Profile image
* Student identifier
* Department
* Program
* Semester
* Academic information
* Skills
* Projects

Some advanced fields will be added later.

---

# 3. Smart Dashboard

The dashboard is the central screen.

It should display:

* Greeting
* Current date
* Next class
* Today's timetable
* Today's tasks
* Upcoming assignments
* Important notices
* Attendance summary
* Academic progress
* Upcoming deadlines
* Notifications
* CampusMate AI recommendation

The dashboard should be personalized.

It should not simply be a collection of links.

---

# 4. Academic Management

Academic structure:

Semester → Subjects → Academic Resources

Each subject can contain:

* Subject name
* Code
* Faculty
* Credits
* Syllabus
* Units
* Notes
* Resources
* Assignments
* PYQs
* Attendance
* Study progress

---

# 5. Subjects

Students can view subjects belonging to their semester/program.

Subject information can include:

* Name
* Code
* Faculty
* Semester
* Department
* Description
* Syllabus
* Progress
* Attendance

---

# 6. Syllabus

A syllabus can be organized into:

* Unit 1
* Unit 2
* Unit 3
* Unit 4
* Unit 5

Each unit can have:

* Topics
* Resources
* Notes
* Study progress

---

# 7. Assignments

Assignments contain:

* Title
* Description
* Subject
* Faculty
* Created date
* Due date
* Priority
* Status

Statuses:

* Pending
* In progress
* Completed
* Overdue

Students should be able to mark permitted assignments as completed.

The system should automatically identify upcoming and overdue assignments.

---

# 8. Timetable

Timetable contains:

* Day
* Start time
* End time
* Subject
* Faculty
* Room
* Schedule type

Views:

* Today
* Tomorrow
* Weekly timetable

Smart functionality:

* Next class
* Current class
* Free period
* Remaining classes

---

# 9. Attendance

Attendance should support:

* Subject-wise attendance
* Overall attendance
* Classes attended
* Classes conducted
* Attendance percentage
* Target percentage

Smart calculations:

* Classes that can be missed
* Classes required to reach target
* Attendance warning

Example:

42 attended / 50 conducted × 100 = 84%

---

# 10. Notes and Resources

Resources can include:

* PDF
* Image
* Link
* Document
* Personal note
* Faculty material
* Previous-year question paper

Organization:

Semester → Subject → Unit → Resource

---

# 11. Notices

Notices can contain:

* Title
* Description
* Category
* Priority
* Published date
* Deadline
* Attachment
* Source
* Status

Categories:

* Examination
* Assignment
* Scholarship
* Placement
* Event
* Holiday
* Administrative
* Academic
* General

Priority:

* Urgent
* Important
* Normal

---

# 12. Smart Notice Reader

Future implementation:

Upload:

* PDF
* Image

AI processes the notice and extracts:

* Important dates
* Deadlines
* Event information
* Examination information
* Required actions
* Category
* Priority

The extracted information must be reviewed before being treated as authoritative when necessary.

---

# 13. Notifications

Notification priority:

### Urgent

Requires immediate attention.

### Important

Requires attention soon.

### Normal

Informational.

Notifications can originate from:

* Assignments
* Notices
* Timetable
* Events
* Reminders
* Academic alerts

Users should be able to manage notification preferences.

---

# 14. CampusMate AI

The AI assistant should not be a generic chatbot.

It should be context-aware.

Possible questions:

* What should I study today?
* What assignments are due soon?
* Explain this topic.
* Summarize this PDF.
* Generate questions from this material.
* How many classes can I miss?
* What should I prioritize?
* What should I revise before my exam?

The AI must only receive information the current user is authorized to access.

---

# 15. AI Study Planner

Inputs:

* Exam date
* Subject
* Syllabus
* Study progress
* Available time
* Assignment deadlines

Output:

* Study schedule
* Topics
* Breaks
* Priority
* Revision sessions

---

# 16. Academic Analytics

Initial analytics:

* Attendance
* Assignment completion
* Study progress
* Subject progress

Future analytics:

* Performance trends
* Academic health
* Risk detection
* Improvement recommendations

---

# 17. Student Productivity

Initial useful productivity features:

* Study sessions
* Goals
* Focus timer
* Study streak
* Task tracking

These should remain connected to academic information.

---

# V2 FEATURES

## 18. Student Finance

* Expenses
* Categories
* Monthly budget
* Spending history
* Charts
* AI spending insights

## 19. Scholarships and Opportunities

* Scholarships
* Internships
* Hackathons
* Competitions
* Workshops
* Certifications
* Placement opportunities

## 20. Career Center

* Skills
* Certifications
* Projects
* Resume
* Internship tracking
* Placement preparation
* AI learning recommendations

## 21. Events and Clubs

* Events
* Registrations
* Calendar
* Reminders
* Clubs
* Club profiles

## 22. Complaints

Workflow:

Submitted → Under Review → In Progress → Resolved

Categories:

* Hostel
* Library
* Classroom
* Transport
* Facilities
* Other

## 23. Campus Services

* Library
* Hostel
* Mess
* Transport
* Labs
* Clubs
* Facilities

---

# V3 FEATURES

## 24. Marketplace

Potential items:

* Books
* Calculators
* Notes
* Hostel items
* Electronics
* Furniture

Requires moderation and reporting.

## 25. Student Community

* Study groups
* Subject discussions
* Peer questions
* Peer help

Requires moderation and privacy controls.

## 26. Global Campus Search

One search interface across authorized resources:

* Notes
* Notices
* Subjects
* Resources
* Events
* Opportunities

## 27. Voice AI

Future voice interface for selected AI functions.

## 28. Advanced Campus Intelligence

The system can combine multiple authorized signals and provide proactive recommendations.

---

# SPECIAL CAMPUSMATE FEATURES

## 29. What Should I Do Now?

A central action:

> Help me decide.

CampusMate evaluates the student's authorized current context and recommends the highest-value next action.

## 30. Smart Notice Reader

Notice → AI → important information → deadline → reminder.

## 31. Notice Camera

Photo → AI → extracted information → confirmation → reminder.

## 32. Smart Academic Risk Detection

Potentially identify:

* Attendance risk
* Assignment backlog
* Low preparation
* Upcoming deadlines

## 33. Context-Aware AI

AI recommendations use relevant authorized CampusMate data rather than generic responses.

## 34. Unified Campus Search

One search instead of navigating through many modules.

---

# FEATURE PRIORITY

## Must Have — V1

* Authentication
* Profiles
* Dashboard
* Subjects
* Academic management
* Assignments
* Timetable
* Attendance
* Resources
* Notices
* Notifications
* CampusMate AI

## Should Have — V1/V1.5

* Study planner
* PDF assistant
* Notice reader
* Productivity
* Academic analytics

## Later

* Finance
* Career
* Scholarships
* Events
* Clubs
* Complaints
* Campus services
* Marketplace
* Community
* Voice AI
