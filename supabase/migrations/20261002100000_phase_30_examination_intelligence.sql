/*
============================================================
PHASE 30 — EXAMINATION INTELLIGENCE
============================================================

Purpose:
- Store exam-specific preparation progress
- Track syllabus/topic coverage
- Track student confidence
- Detect weak topics
- Store revision plans
- Store revision tasks
- Store exam performance
- Support future AI-generated preparation plans

Important:
- Existing `exams` table is NOT replaced.
- Existing `subjects` table is NOT replaced.
- Existing syllabus tables are NOT replaced.
============================================================
*/


/*
============================================================
1. EXAM TOPIC PROGRESS
============================================================
Tracks how well a student has prepared each topic
for a particular exam.
*/

create table if not exists public.exam_topic_progress (
  id uuid primary key default gen_random_uuid(),

  exam_id uuid not null
    references public.exams(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  topic_id uuid not null
    references public.syllabus_topics(id)
    on delete cascade,

  status text not null default 'not_started'
    check (
      status in (
        'not_started',
        'learning',
        'revising',
        'completed'
      )
    ),

  coverage_percentage numeric(5,2) not null default 0
    check (
      coverage_percentage >= 0
      and coverage_percentage <= 100
    ),

  confidence_level numeric(5,2) not null default 0
    check (
      confidence_level >= 0
      and confidence_level <= 100
    ),

  estimated_minutes integer not null default 0
    check (
      estimated_minutes >= 0
    ),

  actual_minutes integer not null default 0
    check (
      actual_minutes >= 0
    ),

  last_studied_at timestamptz,

  notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    exam_id,
    student_id,
    topic_id
  )
);


/*
============================================================
2. EXAM REVISION PLANS
============================================================
One preparation plan can exist for an exam.
*/

create table if not exists public.exam_revision_plans (
  id uuid primary key default gen_random_uuid(),

  exam_id uuid not null
    references public.exams(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  title text not null,

  description text,

  start_date date,

  end_date date,

  available_minutes_per_day integer not null default 60
    check (
      available_minutes_per_day >= 0
    ),

  status text not null default 'active'
    check (
      status in (
        'draft',
        'active',
        'completed',
        'archived'
      )
    ),

  generated_by text not null default 'manual'
    check (
      generated_by in (
        'manual',
        'rule_engine',
        'ai'
      )
    ),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    exam_id,
    student_id
  )
);


/*
============================================================
3. EXAM REVISION ITEMS
============================================================
Individual daily revision tasks.
*/

create table if not exists public.exam_revision_items (
  id uuid primary key default gen_random_uuid(),

  plan_id uuid not null
    references public.exam_revision_plans(id)
    on delete cascade,

  topic_id uuid
    references public.syllabus_topics(id)
    on delete set null,

  scheduled_date date not null,

  title text not null,

  description text,

  planned_minutes integer not null default 30
    check (
      planned_minutes >= 0
    ),

  actual_minutes integer not null default 0
    check (
      actual_minutes >= 0
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'critical'
      )
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'in_progress',
        'completed',
        'skipped'
      )
    ),

  completed_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


/*
============================================================
4. EXAM PERFORMANCE
============================================================
Stores actual performance after an exam.
*/

create table if not exists public.exam_performance (
  id uuid primary key default gen_random_uuid(),

  exam_id uuid not null
    references public.exams(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  marks numeric(8,2),

  max_marks numeric(8,2),

  percentage numeric(6,2),

  grade text,

  rank integer,

  performance_status text not null default 'not_available'
    check (
      performance_status in (
        'not_available',
        'entered',
        'evaluated'
      )
    ),

  strengths text[] not null default '{}',

  weaknesses text[] not null default '{}',

  faculty_feedback text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    exam_id,
    student_id
  )
);


/*
============================================================
5. EXAM AI GENERATION HISTORY
============================================================
Stores generated preparation plans so AI usage is auditable
and the user can regenerate plans later.
*/

create table if not exists public.exam_ai_generations (
  id uuid primary key default gen_random_uuid(),

  exam_id uuid not null
    references public.exams(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  generation_type text not null
    check (
      generation_type in (
        'preparation_plan',
        'revision_plan',
        'weak_topic_analysis',
        'performance_analysis'
      )
    ),

  input_snapshot jsonb not null default '{}'::jsonb,

  output jsonb not null default '{}'::jsonb,

  model text,

  created_at timestamptz not null default now()
);


/*
============================================================
6. INDEXES
============================================================
*/

create index if not exists
  exam_topic_progress_exam_student_idx
on public.exam_topic_progress (
  exam_id,
  student_id
);

create index if not exists
  exam_topic_progress_topic_idx
on public.exam_topic_progress (
  topic_id
);

create index if not exists
  exam_revision_plans_student_idx
on public.exam_revision_plans (
  student_id
);

create index if not exists
  exam_revision_items_plan_date_idx
on public.exam_revision_items (
  plan_id,
  scheduled_date
);

create index if not exists
  exam_revision_items_topic_idx
on public.exam_revision_items (
  topic_id
);

create index if not exists
  exam_performance_student_idx
on public.exam_performance (
  student_id
);

create index if not exists
  exam_ai_generations_student_exam_idx
on public.exam_ai_generations (
  student_id,
  exam_id
);


/*
============================================================
7. UPDATED_AT FUNCTION
============================================================
*/

create or replace function public.update_exam_intelligence_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


/*
============================================================
8. UPDATED_AT TRIGGERS
============================================================
*/

drop trigger if exists
  exam_topic_progress_updated_at
on public.exam_topic_progress;

create trigger
  exam_topic_progress_updated_at
before update on public.exam_topic_progress
for each row
execute function
  public.update_exam_intelligence_updated_at();


drop trigger if exists
  exam_revision_plans_updated_at
on public.exam_revision_plans;

create trigger
  exam_revision_plans_updated_at
before update on public.exam_revision_plans
for each row
execute function
  public.update_exam_intelligence_updated_at();


drop trigger if exists
  exam_revision_items_updated_at
on public.exam_revision_items;

create trigger
  exam_revision_items_updated_at
before update on public.exam_revision_items
for each row
execute function
  public.update_exam_intelligence_updated_at();


drop trigger if exists
  exam_performance_updated_at
on public.exam_performance;

create trigger
  exam_performance_updated_at
before update on public.exam_performance
for each row
execute function
  public.update_exam_intelligence_updated_at();


/*
============================================================
9. ROW LEVEL SECURITY
============================================================
*/

alter table public.exam_topic_progress
enable row level security;

alter table public.exam_revision_plans
enable row level security;

alter table public.exam_revision_items
enable row level security;

alter table public.exam_performance
enable row level security;

alter table public.exam_ai_generations
enable row level security;


/*
============================================================
10. STUDENT POLICIES
============================================================
*/


/*
-------------------------
Topic Progress
-------------------------
*/

drop policy if exists
  "students can read own exam topic progress"
on public.exam_topic_progress;

create policy
  "students can read own exam topic progress"
on public.exam_topic_progress
for select
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


drop policy if exists
  "students can insert own exam topic progress"
on public.exam_topic_progress;

create policy
  "students can insert own exam topic progress"
on public.exam_topic_progress
for insert
to authenticated
with check (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


drop policy if exists
  "students can update own exam topic progress"
on public.exam_topic_progress;

create policy
  "students can update own exam topic progress"
on public.exam_topic_progress
for update
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
)
with check (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


/*
-------------------------
Revision Plans
-------------------------
*/

drop policy if exists
  "students can read own exam revision plans"
on public.exam_revision_plans;

create policy
  "students can read own exam revision plans"
on public.exam_revision_plans
for select
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


drop policy if exists
  "students can insert own exam revision plans"
on public.exam_revision_plans;

create policy
  "students can insert own exam revision plans"
on public.exam_revision_plans
for insert
to authenticated
with check (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


drop policy if exists
  "students can update own exam revision plans"
on public.exam_revision_plans;

create policy
  "students can update own exam revision plans"
on public.exam_revision_plans
for update
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
)
with check (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


/*
-------------------------
Revision Items
-------------------------
*/

drop policy if exists
  "students can read own exam revision items"
on public.exam_revision_items;

create policy
  "students can read own exam revision items"
on public.exam_revision_items
for select
to authenticated
using (
  exists (
    select 1
    from public.exam_revision_plans p
    where p.id = plan_id
      and p.student_id = (
        select id
        from public.students
        where profile_id = auth.uid()
        limit 1
      )
  )
);


drop policy if exists
  "students can insert own exam revision items"
on public.exam_revision_items;

create policy
  "students can insert own exam revision items"
on public.exam_revision_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.exam_revision_plans p
    where p.id = plan_id
      and p.student_id = (
        select id
        from public.students
        where profile_id = auth.uid()
        limit 1
      )
  )
);


drop policy if exists
  "students can update own exam revision items"
on public.exam_revision_items;

create policy
  "students can update own exam revision items"
on public.exam_revision_items
for update
to authenticated
using (
  exists (
    select 1
    from public.exam_revision_plans p
    where p.id = plan_id
      and p.student_id = (
        select id
        from public.students
        where profile_id = auth.uid()
        limit 1
      )
  )
)
with check (
  exists (
    select 1
    from public.exam_revision_plans p
    where p.id = plan_id
      and p.student_id = (
        select id
        from public.students
        where profile_id = auth.uid()
        limit 1
      )
  )
);


/*
-------------------------
Exam Performance
-------------------------
*/

drop policy if exists
  "students can read own exam performance"
on public.exam_performance;

create policy
  "students can read own exam performance"
on public.exam_performance
for select
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


/*
-------------------------
AI Generations
-------------------------
*/

drop policy if exists
  "students can read own exam ai generations"
on public.exam_ai_generations;

create policy
  "students can read own exam ai generations"
on public.exam_ai_generations
for select
to authenticated
using (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);


drop policy if exists
  "students can insert own exam ai generations"
on public.exam_ai_generations;

create policy
  "students can insert own exam ai generations"
on public.exam_ai_generations
for insert
to authenticated
with check (
  student_id = (
    select id
    from public.students
    where profile_id = auth.uid()
    limit 1
  )
);