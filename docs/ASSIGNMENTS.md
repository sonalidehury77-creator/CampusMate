# CampusMate — Assignment Management

## Purpose

Phase 11 introduces the assignment management system for students.

The module allows students to:

- View assignments
- View assignment descriptions
- View subjects
- View deadlines
- View priority
- Track personal assignment status
- Mark assignments as pending
- Mark assignments as in progress
- Mark assignments as completed
- Detect overdue assignments
- Detect assignments due soon
- Add personal notes
- Search assignments
- Filter by subject
- Filter by status

---

## Database

The assignment system uses the existing tables:

- `assignments`
- `assignment_status`

The `assignments` table contains academic assignment information.

The `assignment_status` table stores student-specific progress.

Relationship:

```text
subjects
    |
    v
assignments
    |
    v
assignment_status
    |
    v
students