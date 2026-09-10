# CampusMate — Academic Management

## Purpose

Phase 9 introduces the real academic management module.

## Academic hierarchy

Student
  ↓
Semester
  ↓
Student Subjects
  ↓
Subjects
  ↓
Syllabus Units
  ↓
Syllabus Topics

## Academic progress

Unit progress is stored per student.

Unit progress
  ↓
Subject progress
  ↓
Overall academic progress

## Features

- Current semester information
- Programme information
- Subject list
- Subject search
- Subject filtering
- Credits
- Syllabus units
- Syllabus topics
- Unit progress
- Subject progress
- Completion tracking
- Automatic subject progress calculation
- Responsive UI
- Server-side data loading
- Server Actions
- Zod validation
- Supabase RLS protection

## Data strategy

CampusMate first checks student_subjects for explicitly assigned
subjects.

If no student-specific subject mapping exists, the application
falls back to subjects belonging to the student's current semester.

## Security

Academic data is accessed through the authenticated Supabase server
client.

Progress updates validate:

- authenticated user
- student ownership
- subject existence
- syllabus unit existence
- progress range

Database RLS remains the final security boundary.

## Database

Phase 9 uses the existing initial schema.

No modification is made to:

20260905034901_initial_schema.sql

No database reset is required.

## Result

The Academics module is now a real data-driven CampusMate feature
rather than a static placeholder.