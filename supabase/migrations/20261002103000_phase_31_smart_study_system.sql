-- ============================================================
-- CAMPUSMATE
-- PHASE 31 — SMART STUDY SYSTEM
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. SMART STUDY PLANS
-- ============================================================

create table if not exists public.smart_study_plans (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    plan_date date not null,

    plan_type text not null default 'daily'
        check (
            plan_type in (
                'daily',
                'weekly',
                'revision',
                'exam_preparation',
                'recovery'
            )
        ),

    status text not null default 'draft'
        check (
            status in (
                'draft',
                'active',
                'completed',
                'expired',
                'cancelled'
            )
        ),

    available_minutes integer not null default 0
        check (available_minutes >= 0),

    planned_minutes integer not null default 0
        check (planned_minutes >= 0),

    completed_minutes integer not null default 0
        check (completed_minutes >= 0),

    completion_percentage numeric(5,2)
        not null default 0
        check (
            completion_percentage >= 0
            and completion_percentage <= 100
        ),

    generated_by text not null default 'rule_engine'
        check (
            generated_by in (
                'manual',
                'rule_engine',
                'ai'
            )
        ),

    generation_reason jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (
        student_id,
        plan_date,
        plan_type
    )
);

-- ============================================================
-- 2. SMART STUDY ITEMS
-- ============================================================

create table if not exists public.smart_study_items (
    id uuid primary key default gen_random_uuid(),

    plan_id uuid not null
        references public.smart_study_plans(id)
        on delete cascade,

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    subject_id uuid
        references public.subjects(id)
        on delete set null,

    topic_id uuid
        references public.syllabus_topics(id)
        on delete set null,

    exam_id uuid
        references public.exams(id)
        on delete set null,

    assignment_id uuid
        references public.assignments(id)
        on delete set null,

    title text not null,

    description text,

    study_type text not null default 'study'
        check (
            study_type in (
                'study',
                'revision',
                'practice',
                'assignment',
                'exam_preparation',
                'weak_topic',
                'catch_up'
            )
        ),

    priority text not null default 'normal'
        check (
            priority in (
                'critical',
                'high',
                'medium',
                'normal'
            )
        ),

    scheduled_date date not null,

    start_time time,

    end_time time,

    planned_minutes integer not null default 30
        check (planned_minutes > 0),

    actual_minutes integer not null default 0
        check (actual_minutes >= 0),

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'in_progress',
                'completed',
                'partially_completed',
                'skipped',
                'cancelled'
            )
        ),

    completion_percentage numeric(5,2)
        not null default 0
        check (
            completion_percentage >= 0
            and completion_percentage <= 100
        ),

    priority_score numeric(8,2)
        not null default 0,

    difficulty_score numeric(5,2)
        not null default 0,

    confidence_before numeric(5,2),

    confidence_after numeric(5,2),

    recommendation_reason jsonb not null default '{}'::jsonb,

    completed_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- ============================================================
-- 3. SUBJECT GOALS
-- ============================================================

create table if not exists public.smart_subject_goals (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    subject_id uuid not null
        references public.subjects(id)
        on delete cascade,

    target_coverage_percentage numeric(5,2)
        not null default 100
        check (
            target_coverage_percentage >= 0
            and target_coverage_percentage <= 100
        ),

    target_confidence_percentage numeric(5,2)
        not null default 80
        check (
            target_confidence_percentage >= 0
            and target_confidence_percentage <= 100
        ),

    target_exam_percentage numeric(5,2),

    weekly_minutes integer
        not null default 180
        check (weekly_minutes >= 0),

    priority text not null default 'normal'
        check (
            priority in (
                'critical',
                'high',
                'medium',
                'normal'
            )
        ),

    status text not null default 'active'
        check (
            status in (
                'active',
                'completed',
                'paused',
                'cancelled'
            )
        ),

    target_date date,

    notes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (
        student_id,
        subject_id
    )
);

-- ============================================================
-- 4. FOCUS SESSIONS
-- ============================================================

create table if not exists public.smart_focus_sessions (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    study_item_id uuid
        references public.smart_study_items(id)
        on delete set null,

    subject_id uuid
        references public.subjects(id)
        on delete set null,

    topic_id uuid
        references public.syllabus_topics(id)
        on delete set null,

    started_at timestamptz not null,

    ended_at timestamptz,

    planned_minutes integer not null default 25
        check (planned_minutes > 0),

    actual_minutes integer not null default 0
        check (actual_minutes >= 0),

    status text not null default 'active'
        check (
            status in (
                'active',
                'paused',
                'completed',
                'abandoned'
            )
        ),

    interruption_count integer not null default 0
        check (interruption_count >= 0),

    completion_percentage numeric(5,2)
        not null default 0
        check (
            completion_percentage >= 0
            and completion_percentage <= 100
        ),

    self_rating integer
        check (
            self_rating is null
            or (
                self_rating >= 1
                and self_rating <= 5
            )
        ),

    difficulty_rating integer
        check (
            difficulty_rating is null
            or (
                difficulty_rating >= 1
                and difficulty_rating <= 5
            )
        ),

    confidence_before numeric(5,2),

    confidence_after numeric(5,2),

    notes text,

    created_at timestamptz not null default now()
);

-- ============================================================
-- 5. STUDY FEEDBACK
-- ============================================================

create table if not exists public.smart_study_feedback (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    study_item_id uuid
        references public.smart_study_items(id)
        on delete cascade,

    focus_session_id uuid
        references public.smart_focus_sessions(id)
        on delete cascade,

    difficulty integer
        check (
            difficulty is null
            or (
                difficulty >= 1
                and difficulty <= 5
            )
        ),

    confidence integer
        check (
            confidence is null
            or (
                confidence >= 1
                and confidence <= 5
            )
        ),

    understanding integer
        check (
            understanding is null
            or (
                understanding >= 1
                and understanding <= 5
            )
        ),

    completion_status text
        check (
            completion_status is null
            or completion_status in (
                'complete',
                'partial',
                'not_complete'
            )
        ),

    feedback text,

    created_at timestamptz not null default now()
);

-- ============================================================
-- 6. STUDY PREFERENCES
-- ============================================================

create table if not exists public.smart_study_preferences (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null
        references public.students(id)
        on delete cascade,

    daily_target_minutes integer not null default 120
        check (daily_target_minutes > 0),

    minimum_session_minutes integer not null default 25
        check (minimum_session_minutes > 0),

    maximum_session_minutes integer not null default 60
        check (maximum_session_minutes >= minimum_session_minutes),

    preferred_start_time time,

    preferred_end_time time,

    preferred_session_type text not null default 'pomodoro'
        check (
            preferred_session_type in (
                'pomodoro',
                'deep_work',
                'flexible'
            )
        ),

    break_minutes integer not null default 5
        check (break_minutes >= 0),

    include_weekends boolean not null default true,

    auto_generate_daily_plan boolean not null default true,

    auto_generate_weekly_plan boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique(student_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_smart_study_plans_student_date
on public.smart_study_plans(student_id, plan_date);

create index if not exists idx_smart_study_items_student_date
on public.smart_study_items(student_id, scheduled_date);

create index if not exists idx_smart_study_items_plan
on public.smart_study_items(plan_id);

create index if not exists idx_smart_study_items_subject
on public.smart_study_items(subject_id);

create index if not exists idx_smart_study_items_topic
on public.smart_study_items(topic_id);

create index if not exists idx_smart_study_items_exam
on public.smart_study_items(exam_id);

create index if not exists idx_smart_focus_sessions_student
on public.smart_focus_sessions(student_id, started_at);

create index if not exists idx_smart_subject_goals_student
on public.smart_subject_goals(student_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.update_smart_study_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_smart_study_plans_updated_at
on public.smart_study_plans;

create trigger trg_smart_study_plans_updated_at
before update on public.smart_study_plans
for each row
execute function public.update_smart_study_updated_at();

drop trigger if exists trg_smart_study_items_updated_at
on public.smart_study_items;

create trigger trg_smart_study_items_updated_at
before update on public.smart_study_items
for each row
execute function public.update_smart_study_updated_at();

drop trigger if exists trg_smart_subject_goals_updated_at
on public.smart_subject_goals;

create trigger trg_smart_subject_goals_updated_at
before update on public.smart_subject_goals
for each row
execute function public.update_smart_study_updated_at();

drop trigger if exists trg_smart_study_preferences_updated_at
on public.smart_study_preferences;

create trigger trg_smart_study_preferences_updated_at
before update on public.smart_study_preferences
for each row
execute function public.update_smart_study_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.smart_study_plans enable row level security;
alter table public.smart_study_items enable row level security;
alter table public.smart_subject_goals enable row level security;
alter table public.smart_focus_sessions enable row level security;
alter table public.smart_study_feedback enable row level security;
alter table public.smart_study_preferences enable row level security;

-- ============================================================
-- RLS POLICIES
--
-- The student is identified through students.profile_id.
-- ============================================================

create policy "students can view own smart study plans"
on public.smart_study_plans
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_plans.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own smart study plans"
on public.smart_study_plans
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_plans.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can update own smart study plans"
on public.smart_study_plans
for update
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_plans.student_id
          and s.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_plans.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can view own smart study items"
on public.smart_study_items
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_items.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own smart study items"
on public.smart_study_items
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_items.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can update own smart study items"
on public.smart_study_items
for update
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_items.student_id
          and s.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_items.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can view own subject goals"
on public.smart_subject_goals
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_subject_goals.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own subject goals"
on public.smart_subject_goals
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_subject_goals.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can update own subject goals"
on public.smart_subject_goals
for update
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_subject_goals.student_id
          and s.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_subject_goals.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can view own focus sessions"
on public.smart_focus_sessions
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_focus_sessions.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own focus sessions"
on public.smart_focus_sessions
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_focus_sessions.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can update own focus sessions"
on public.smart_focus_sessions
for update
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_focus_sessions.student_id
          and s.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_focus_sessions.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can view own study feedback"
on public.smart_study_feedback
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_feedback.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own study feedback"
on public.smart_study_feedback
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_feedback.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can view own study preferences"
on public.smart_study_preferences
for select
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_preferences.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can insert own study preferences"
on public.smart_study_preferences
for insert
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_preferences.student_id
          and s.profile_id = auth.uid()
    )
);

create policy "students can update own study preferences"
on public.smart_study_preferences
for update
using (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_preferences.student_id
          and s.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.students s
        where s.id = smart_study_preferences.student_id
          and s.profile_id = auth.uid()
    )
);