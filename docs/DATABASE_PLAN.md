# CampusMate — Database Plan

## 1. Purpose

This document defines the database architecture for CampusMate.

CampusMate will use PostgreSQL through Supabase.

The database will be designed to:

* Store structured campus information
* Store student academic information
* Store faculty information
* Store assignments
* Store timetable information
* Store attendance
* Store notices
* Store resources
* Store notifications
* Store study progress
* Support AI features
* Support role-based access
* Maintain data integrity
* Support future expansion

---

# 2. Database Technology

Database:

PostgreSQL

Database platform:

Supabase

Authentication:

Supabase Auth

File storage:

Supabase Storage

The application frontend will communicate with Supabase through secure application code and database policies.

---

# 3. Database Design Principles

The database should be:

### Modular

Different functionality should use separate logical tables.

### Relational

Related information should use foreign keys.

### Secure

Users must only access information they are authorized to access.

### Scalable

The design should support additional departments, semesters, students, faculty, and campuses in the future.

### Maintainable

Table and column names should be clear and consistent.

### Auditable

Important administrative operations should be traceable where required.

---

# 4. Main Database Areas

The database will be divided conceptually into:

```text
Identity
Academic Structure
Student Data
Faculty Data
Timetable
Assignments
Attendance
Resources
Notices
Notifications
Study Progress
AI
Events
Opportunities
Complaints
Marketplace
```

V1 will primarily implement:

```text
Identity
Academic Structure
Student Data
Faculty Data
Timetable
Assignments
Attendance
Resources
Notices
Notifications
Study Progress
AI support
```

---

# 5. Identity Tables

## 5.1 profiles

Stores common information about authenticated users.

Important fields:

* id
* full_name
* email
* avatar_url
* role
* phone
* created_at
* updated_at

The profile ID should correspond to the authenticated Supabase user ID.

Possible roles:

* student
* faculty
* admin

---

# 6. Academic Structure

## 6.1 departments

Stores academic departments.

Example:

Computer Science

Fields:

* id
* name
* code
* description
* created_at
* updated_at

---

## 6.2 programs

Stores academic programs.

Example:

B.Sc. Computer Science

Fields:

* id
* department_id
* name
* code
* duration
* created_at
* updated_at

Relationship:

departments → programs

---

## 6.3 semesters

Stores semester information.

Example:

Semester 5

Fields:

* id
* program_id
* semester_number
* academic_year
* created_at
* updated_at

Relationship:

programs → semesters

---

## 6.4 subjects

Stores subjects.

Fields:

* id
* department_id
* semester_id
* code
* name
* description
* credits
* created_at
* updated_at

Relationship:

semesters → subjects

---

# 7. Student Tables

## 7.1 students

Stores student-specific information.

Fields:

* id
* profile_id
* student_number
* program_id
* semester_id
* enrollment_year
* current_semester
* created_at
* updated_at

Relationship:

profiles → students

programs → students

semesters → students

---

## 7.2 student_subjects

Connects students with subjects.

This is a many-to-many relationship.

Fields:

* id
* student_id
* subject_id
* academic_year
* created_at

Relationship:

students ↔ subjects

---

# 8. Faculty Tables

## 8.1 faculty

Stores faculty-specific information.

Fields:

* id
* profile_id
* department_id
* employee_number
* designation
* created_at
* updated_at

---

## 8.2 faculty_subjects

Connects faculty members to subjects.

Fields:

* id
* faculty_id
* subject_id
* academic_year
* created_at

Relationship:

faculty ↔ subjects

---

# 9. Timetable

## 9.1 timetable_entries

Stores class schedules.

Fields:

* id
* subject_id
* faculty_id
* semester_id
* day_of_week
* start_time
* end_time
* room
* schedule_type
* created_at
* updated_at

Possible schedule types:

* lecture
* laboratory
* tutorial
* seminar
* other

---

# 10. Assignments

## 10.1 assignments

Stores assignments created by faculty or authorized users.

Fields:

* id
* subject_id
* faculty_id
* title
* description
* due_date
* priority
* attachment_url
* created_at
* updated_at

Priority values:

* low
* medium
* high
* urgent

---

## 10.2 assignment_status

Student-specific assignment status may be stored separately.

Fields:

* id
* assignment_id
* student_id
* status
* completed_at
* notes
* created_at
* updated_at

Possible statuses:

* pending
* in_progress
* completed
* overdue

The system may calculate overdue status from the due date when appropriate instead of permanently storing duplicated state.

---

# 11. Attendance

## 11.1 attendance_sessions

Represents a class session.

Fields:

* id
* subject_id
* faculty_id
* timetable_entry_id
* session_date
* created_at

---

## 11.2 attendance_records

Stores attendance for individual students.

Fields:

* id
* session_id
* student_id
* status
* marked_at

Possible status values:

* present
* absent
* excused

Attendance percentage can be calculated from attendance records.

---

# 12. Academic Progress

## 12.1 student_subject_progress

Stores student progress for subjects.

Fields:

* id
* student_id
* subject_id
* progress_percentage
* updated_at

---

## 12.2 unit_progress

Stores progress at syllabus-unit level.

Fields:

* id
* student_id
* subject_id
* unit_number
* progress_percentage
* completed
* updated_at

This allows CampusMate AI to understand which topics a student has completed or still needs to study.

---

# 13. Syllabus

## 13.1 syllabus_units

Stores syllabus units.

Fields:

* id
* subject_id
* unit_number
* title
* description
* created_at
* updated_at

---

## 13.2 syllabus_topics

Stores topics inside syllabus units.

Fields:

* id
* unit_id
* title
* description
* sequence_number
* created_at
* updated_at

Relationship:

subjects → syllabus_units → syllabus_topics

---

# 14. Resources

## 14.1 resources

Stores information about academic resources.

Resources may include:

* PDFs
* Images
* Links
* Documents
* PYQs
* Faculty materials

Fields:

* id
* subject_id
* unit_id
* uploaded_by
* title
* description
* resource_type
* storage_path
* external_url
* visibility
* created_at
* updated_at

Possible resource types:

* pdf
* image
* document
* link
* note
* pyq
* other

---

# 15. Personal Notes

## 15.1 notes

Stores personal student notes.

Fields:

* id
* student_id
* subject_id
* unit_id
* title
* content
* created_at
* updated_at

Personal notes must only be accessible to the appropriate student unless explicitly shared.

---

# 16. Notices

## 16.1 notices

Stores campus notices.

Fields:

* id
* created_by
* title
* description
* category
* priority
* published_at
* deadline
* attachment_path
* source
* status
* created_at
* updated_at

Categories:

* examination
* assignment
* scholarship
* placement
* event
* holiday
* administrative
* academic
* general

Priority:

* urgent
* important
* normal

---

# 17. Notice AI Processing

## 17.1 notice_extractions

Stores information extracted from notices.

Fields:

* id
* notice_id
* extracted_text
* summary
* extracted_dates
* extracted_deadlines
* suggested_category
* suggested_priority
* ai_status
* reviewed_by
* reviewed_at
* created_at

AI-extracted information should not automatically override authoritative institutional information.

Where appropriate, an authorized user should review extracted information before publishing or triggering important reminders.

---

# 18. Notifications

## 18.1 notifications

Stores notifications intended for users.

Fields:

* id
* recipient_profile_id
* title
* message
* type
* priority
* related_entity_type
* related_entity_id
* read_at
* created_at

Types may include:

* assignment
* notice
* timetable
* attendance
* reminder
* event
* system
* ai

---

# 19. Notification Preferences

## 19.1 notification_preferences

Stores user preferences.

Fields:

* id
* profile_id
* assignment_notifications
* notice_notifications
* attendance_notifications
* timetable_notifications
* event_notifications
* ai_notifications
* email_notifications
* push_notifications
* updated_at

---

# 20. Study Planner

## 20.1 study_plans

Stores generated or manually created study plans.

Fields:

* id
* student_id
* title
* subject_id
* exam_date
* available_minutes_per_day
* start_date
* end_date
* created_by
* created_at
* updated_at

---

## 20.2 study_plan_items

Stores individual study sessions.

Fields:

* id
* study_plan_id
* study_date
* start_time
* duration_minutes
* subject_id
* unit_id
* task
* priority
* status
* completed_at
* created_at
* updated_at

Possible statuses:

* planned
* completed
* skipped
* rescheduled

---

# 21. Focus Sessions

## 21.1 focus_sessions

Stores productivity sessions.

Fields:

* id
* student_id
* subject_id
* started_at
* ended_at
* duration_minutes
* session_type
* completed

Possible session types:

* study
* revision
* assignment
* reading
* practice
* other

---

# 22. Exams

## 22.1 exams

Stores examination information.

Fields:

* id
* subject_id
* semester_id
* exam_type
* exam_date
* start_time
* end_time
* room
* created_at
* updated_at

Possible exam types:

* internal
* semester
* practical
* viva
* other

---

# 23. AI Conversations

## 23.1 ai_conversations

Stores AI conversation metadata.

Fields:

* id
* profile_id
* title
* created_at
* updated_at

---

## 23.2 ai_messages

Stores conversation messages when persistent chat history is enabled.

Fields:

* id
* conversation_id
* role
* content
* created_at

Possible roles:

* user
* assistant
* system

Sensitive information should not be stored unnecessarily.

---

# 24. AI Usage

## 24.1 ai_usage

Stores usage information for monitoring and abuse prevention.

Fields:

* id
* profile_id
* feature
* request_count
* tokens_used
* usage_date
* created_at

The exact implementation may change depending on the AI provider and billing model.

---

# 25. Audit Logs

## 25.1 audit_logs

Stores important administrative actions.

Fields:

* id
* profile_id
* action
* entity_type
* entity_id
* metadata
* created_at

Examples:

* notice_created
* notice_updated
* student_updated
* faculty_updated
* resource_deleted

Not every ordinary user action needs an audit record.

---

# 26. Future V2 Tables

Student Finance:

```text
expenses
expense_categories
budgets
```

Scholarships:

```text
opportunities
opportunity_applications
```

Career:

```text
skills
student_skills
certifications
projects
resumes
job_applications
```

Events:

```text
events
event_registrations
```

Clubs:

```text
clubs
club_members
```

Complaints:

```text
complaints
complaint_updates
```

Campus Services:

```text
campus_services
service_information
```

---

# 27. Future V3 Tables

Marketplace:

```text
marketplace_listings
marketplace_images
marketplace_wishlists
marketplace_reports
```

Community:

```text
community_posts
community_comments
community_groups
community_reports
```

Global Search:

Search functionality may use PostgreSQL full-text search initially and a dedicated search service later if scale requires it.

---

# 28. Main Relationships

The high-level relationship is:

```text
profiles
   │
   ├── students
   │      │
   │      ├── student_subjects ─── subjects
   │      │                           │
   │      │                           ├── syllabus_units
   │      │                           │       └── syllabus_topics
   │      │                           │
   │      │                           ├── assignments
   │      │                           ├── attendance_sessions
   │      │                           └── resources
   │      │
   │      ├── attendance_records
   │      ├── assignment_status
   │      ├── unit_progress
   │      ├── study_plans
   │      └── focus_sessions
   │
   └── faculty
          │
          ├── faculty_subjects
          ├── assignments
          ├── attendance_sessions
          └── notices
```

---

# 29. Database Naming Convention

Use:

* lowercase
* snake_case
* singular or plural convention consistently

CampusMate will use plural table names.

Examples:

```text
students
subjects
assignments
notifications
study_plans
```

Columns:

```text
student_id
subject_id
created_at
updated_at
```

---

# 30. Primary Keys

Tables should normally use UUID primary keys.

This works well with Supabase and distributed application architecture.

Example conceptual structure:

```text
id UUID PRIMARY KEY
```

The exact SQL will be written during the database implementation phase.

---

# 31. Timestamps

Important tables should contain:

```text
created_at
updated_at
```

Where relevant.

Timestamps should be stored in a timezone-safe manner.

The application will display dates/times according to the user's appropriate timezone.

---

# 32. Database Security

Supabase Row Level Security will be used where appropriate.

Examples:

Students should only access their own private:

* Notes
* Study plans
* Focus sessions
* Personal profile information
* Assignment status
* Private AI conversations

Public or institution-wide information may have broader read access according to its visibility.

Faculty access will be restricted to authorized academic records.

Admin access will be restricted to authorized administrative operations.

---

# 33. File Storage

Large files should not be stored directly inside normal database rows.

Supabase Storage will be used for:

* PDFs
* Images
* Documents
* Notice attachments
* Resource files
* Profile images

The database will store metadata and storage paths.

---

# 34. Data Integrity

Foreign keys should be used where appropriate.

Important relationships must prevent invalid references.

Examples:

A resource should reference a valid subject.

An attendance record should reference a valid student.

An assignment should reference a valid subject.

A student should reference a valid profile.

---

# 35. Database Migration Strategy

We will not manually make random database changes and forget them.

Database changes will be maintained through migration files.

Example:

```text
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_profiles.sql
    ├── 003_academic_structure.sql
    └── ...
```

The exact migration files will be created during development.

---

# 36. Database Development Rule

Never create a table simply because a feature sounds useful.

Before creating a table, determine:

1. What information is needed?
2. Who owns the information?
3. Who can read it?
4. Who can modify it?
5. How does it relate to existing information?
6. Does it need to be stored permanently?
7. Can the information be calculated instead?

This prevents unnecessary database complexity.

---

# 37. V1 Database Priority

The first database implementation will focus on:

```text
profiles
departments
programs
semesters
subjects
students
student_subjects
faculty
faculty_subjects
timetable_entries
assignments
assignment_status
attendance_sessions
attendance_records
syllabus_units
syllabus_topics
resources
notes
notices
notifications
notification_preferences
student_subject_progress
unit_progress
study_plans
study_plan_items
exams
```

AI-specific tables will be added when the AI layer is implemented.

---

# 38. Database Goal

The database should support the central CampusMate idea:

```text
Student
   ↓
Academic Context
   ↓
Timetable
Assignments
Attendance
Resources
Progress
Exams
Notices
   ↓
CampusMate Intelligence
   ↓
Useful Recommendation
```

The database is therefore not merely a collection of CRUD tables.

It is the structured foundation that allows CampusMate to provide personalized functionality.
