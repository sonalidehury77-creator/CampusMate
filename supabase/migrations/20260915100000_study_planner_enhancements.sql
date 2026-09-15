-- ============================================================
-- CampusMate
-- Phase 15: Smart Study Planner & Focus Mode
-- Database performance enhancements
-- ============================================================

-- ============================================================
-- 1. STUDY PLANS
-- ============================================================

create index if not exists study_plans_student_updated_idx
on public.study_plans (
  student_id,
  updated_at desc
);

create index if not exists study_plans_student_dates_idx
on public.study_plans (
  student_id,
  start_date,
  end_date
);

-- ============================================================
-- 2. STUDY PLAN ITEMS
-- ============================================================

create index if not exists study_plan_items_plan_idx
on public.study_plan_items (
  study_plan_id
);

create index if not exists study_plan_items_student_date_idx
on public.study_plan_items (
  study_plan_id,
  study_date
);

create index if not exists study_plan_items_subject_date_idx
on public.study_plan_items (
  subject_id,
  study_date
);

create index if not exists study_plan_items_status_date_idx
on public.study_plan_items (
  status,
  study_date
);

-- ============================================================
-- 3. FOCUS SESSIONS
-- ============================================================

create index if not exists focus_sessions_student_started_idx
on public.focus_sessions (
  student_id,
  started_at desc
);

create index if not exists focus_sessions_student_completed_idx
on public.focus_sessions (
  student_id,
  completed,
  started_at desc
);

create index if not exists focus_sessions_subject_started_idx
on public.focus_sessions (
  subject_id,
  started_at desc
);

-- ============================================================
-- 4. EXAMS
-- ============================================================

create index if not exists exams_semester_date_idx
on public.exams (
  semester_id,
  exam_date
);

create index if not exists exams_subject_date_idx
on public.exams (
  subject_id,
  exam_date
);

-- ============================================================
-- 5. STUDY PLANNER DATA INTEGRITY
-- ============================================================

-- A study-plan item must belong to a study plan.
-- This already exists through the NOT NULL constraint.

-- Duration must always be positive.
-- Add the constraint only if it does not already exist.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'study_plan_items_duration_positive'
      and conrelid = 'public.study_plan_items'::regclass
  ) then
    alter table public.study_plan_items
      add constraint study_plan_items_duration_positive
      check (duration_minutes > 0);
  end if;
end
$$;

-- ============================================================
-- END OF PHASE 15 DATABASE ENHANCEMENTS
-- ============================================================