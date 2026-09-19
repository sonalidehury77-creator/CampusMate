# CampusMate — Intelligent Reminder Engine

## Purpose

Phase 19 introduces an intelligent notification and reminder
engine that connects academic activity with actionable student
notifications.

## Data Sources

The reminder engine reads:

- assignments
- assignment_status
- exams
- notices
- study_plans
- study_plan_items
- attendance_sessions
- attendance_records
- timetable_entries
- student_subjects
- notification_preferences

## Reminder Categories

### Assignments

The system can generate reminders for:

- overdue assignments
- assignments due today
- assignments due tomorrow
- assignments due within three days

Completed assignments are excluded.

### Exams

The system can generate reminders for:

- exams today
- exams tomorrow
- exams within three days
- exams within seven days

### Notices

Published notices with deadlines can generate:

- overdue reminders
- deadline-today reminders
- deadline-tomorrow reminders
- deadline-soon reminders

### Study Tasks

Planned study tasks can generate:

- missed-task reminders
- today's study-task reminders

### Attendance

Attendance warnings are generated when sufficient attendance
data exists.

Current thresholds:

- below 75%: urgent
- 75% to below 80%: important
- 80% or above: no warning

### Timetable

The engine can generate an upcoming-class reminder when the
next class is within the configured reminder window.

## Preferences

Students can control notification categories through:

notification_preferences

Preferences include:

- assignments
- notices
- attendance
- timetable
- events
- AI
- exams
- study tasks
- smart reminders
- email
- push

## Deduplication

Notifications use:

dedupe_key

The unique combination:

recipient_profile_id + dedupe_key

prevents duplicate reminder creation.

## Security

The current-user reminder function requires:

auth.uid()

The function is executable by authenticated users.

It generates reminders only for the authenticated student's own
academic data.

## Architecture

Student
  ↓
Authenticated CampusMate session
  ↓
Next.js server
  ↓
Supabase RPC
  ↓
generate_my_smart_reminders()
  ↓
Business rules
  ↓
notifications
  ↓
Notification Center

## Future Enhancements

Future versions can add:

- scheduled background execution
- browser push notifications
- mobile push notifications
- email reminders
- quiet hours
- notification grouping
- adaptive reminder timing
- AI-generated reminder summaries
- cross-module priority scoring
- user-configurable reminder windows