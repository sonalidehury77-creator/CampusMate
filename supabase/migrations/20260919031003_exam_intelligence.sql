-- ============================================================
-- CampusMate
-- Phase 20 — Exam & Assessment Intelligence
-- ============================================================

-- ============================================================
-- 1. INDEXES
-- ============================================================

create index if not exists exams_subject_date_idx
on public.exams (subject_id, exam_date);

create index if not exists exams_semester_date_idx
on public.exams (semester_id, exam_date);


-- ============================================================
-- 2. COMMENTS
-- ============================================================

comment on table public.exams is
'CampusMate exam schedule used by Exam & Assessment Intelligence.';

comment on index public.exams_subject_date_idx is
'Speeds up subject-specific exam lookups ordered by date.';

comment on index public.exams_semester_date_idx is
'Speeds up upcoming exam lookups for a semester.';