-- ============================================================
-- CampusMate
-- Initial Database Schema
-- ============================================================
--
-- Purpose:
-- Creates the complete V1 database foundation for CampusMate.
--
-- Database:
-- PostgreSQL / Supabase
--
-- Authentication:
-- Supabase Auth
--
-- Security:
-- Row Level Security (RLS)
--
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- 2. COMMON FUNCTION: UPDATED_AT
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 3. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  role text not null default 'student'
    check (role in ('student', 'faculty', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. DEPARTMENTS
-- ============================================================

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 5. PROGRAMS
-- ============================================================

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null
    references public.departments(id) on delete restrict,
  name text not null,
  code text not null unique,
  duration integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 6. SEMESTERS
-- ============================================================

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null
    references public.programs(id) on delete restrict,
  semester_number integer not null
    check (semester_number > 0),
  academic_year text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (program_id, semester_number, academic_year)
);


-- ============================================================
-- 7. SUBJECTS
-- ============================================================

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null
    references public.departments(id) on delete restrict,
  semester_id uuid not null
    references public.semesters(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  credits numeric(4,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (semester_id, code)
);


-- ============================================================
-- 8. STUDENTS
-- ============================================================

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique
    references public.profiles(id) on delete cascade,
  student_number text not null unique,
  program_id uuid not null
    references public.programs(id) on delete restrict,
  semester_id uuid not null
    references public.semesters(id) on delete restrict,
  enrollment_year integer,
  current_semester integer
    check (current_semester is null or current_semester > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 9. STUDENT SUBJECTS
-- ============================================================

create table public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null
    references public.students(id) on delete cascade,
  subject_id uuid not null
    references public.subjects(id) on delete restrict,
  academic_year text not null,
  created_at timestamptz not null default now(),

  unique (student_id, subject_id, academic_year)
);


-- ============================================================
-- 10. FACULTY
-- ============================================================

create table public.faculty (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique
    references public.profiles(id) on delete cascade,
  department_id uuid not null
    references public.departments(id) on delete restrict,
  employee_number text not null unique,
  designation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 11. FACULTY SUBJECTS
-- ============================================================

create table public.faculty_subjects (
  id uuid primary key default gen_random_uuid(),
  faculty_id uuid not null
    references public.faculty(id) on delete cascade,
  subject_id uuid not null
    references public.subjects(id) on delete restrict,
  academic_year text not null,
  created_at timestamptz not null default now(),

  unique (faculty_id, subject_id, academic_year)
);


-- ============================================================
-- 12. TIMETABLE ENTRIES
-- ============================================================

create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id) on delete restrict,

  faculty_id uuid
    references public.faculty(id) on delete set null,

  semester_id uuid not null
    references public.semesters(id) on delete restrict,

  day_of_week integer not null
    check (day_of_week between 0 and 6),

  start_time time not null,
  end_time time not null,

  room text,

  schedule_type text not null default 'lecture'
    check (
      schedule_type in (
        'lecture',
        'laboratory',
        'tutorial',
        'seminar',
        'other'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (end_time > start_time)
);


-- ============================================================
-- 13. ASSIGNMENTS
-- ============================================================

create table public.assignments (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id) on delete restrict,

  faculty_id uuid
    references public.faculty(id) on delete set null,

  title text not null,
  description text,

  due_date timestamptz,

  priority text not null default 'medium'
    check (
      priority in (
        'low',
        'medium',
        'high',
        'urgent'
      )
    ),

  attachment_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 14. ASSIGNMENT STATUS
-- ============================================================

create table public.assignment_status (
  id uuid primary key default gen_random_uuid(),

  assignment_id uuid not null
    references public.assignments(id) on delete cascade,

  student_id uuid not null
    references public.students(id) on delete cascade,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'in_progress',
        'completed',
        'overdue'
      )
    ),

  completed_at timestamptz,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (assignment_id, student_id)
);


-- ============================================================
-- 15. ATTENDANCE SESSIONS
-- ============================================================

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id) on delete restrict,

  faculty_id uuid
    references public.faculty(id) on delete set null,

  timetable_entry_id uuid
    references public.timetable_entries(id) on delete set null,

  session_date date not null,

  created_at timestamptz not null default now(),

  unique (subject_id, session_date, timetable_entry_id)
);


-- ============================================================
-- 16. ATTENDANCE RECORDS
-- ============================================================

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),

  session_id uuid not null
    references public.attendance_sessions(id) on delete cascade,

  student_id uuid not null
    references public.students(id) on delete cascade,

  status text not null
    check (
      status in (
        'present',
        'absent',
        'excused'
      )
    ),

  marked_at timestamptz not null default now(),

  unique (session_id, student_id)
);


-- ============================================================
-- 17. SYLLABUS UNITS
-- ============================================================

create table public.syllabus_units (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  unit_number integer not null
    check (unit_number > 0),

  title text not null,
  description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (subject_id, unit_number)
);


-- ============================================================
-- 18. SYLLABUS TOPICS
-- ============================================================

create table public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),

  unit_id uuid not null
    references public.syllabus_units(id) on delete cascade,

  title text not null,
  description text,

  sequence_number integer not null
    check (sequence_number > 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (unit_id, sequence_number)
);


-- ============================================================
-- 19. RESOURCES
-- ============================================================

create table public.resources (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid
    references public.subjects(id) on delete cascade,

  unit_id uuid
    references public.syllabus_units(id) on delete set null,

  uploaded_by uuid
    references public.profiles(id) on delete set null,

  title text not null,
  description text,

  resource_type text not null default 'other'
    check (
      resource_type in (
        'pdf',
        'image',
        'document',
        'link',
        'note',
        'pyq',
        'other'
      )
    ),

  storage_path text,
  external_url text,

  visibility text not null default 'private'
    check (
      visibility in (
        'private',
        'students',
        'faculty',
        'public'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 20. NOTES
-- ============================================================

create table public.notes (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  subject_id uuid
    references public.subjects(id) on delete set null,

  unit_id uuid
    references public.syllabus_units(id) on delete set null,

  title text not null,
  content text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 21. NOTICES
-- ============================================================

create table public.notices (
  id uuid primary key default gen_random_uuid(),

  created_by uuid
    references public.profiles(id) on delete set null,

  title text not null,
  description text,

  category text not null default 'general'
    check (
      category in (
        'examination',
        'assignment',
        'scholarship',
        'placement',
        'event',
        'holiday',
        'administrative',
        'academic',
        'general'
      )
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'urgent',
        'important',
        'normal'
      )
    ),

  published_at timestamptz,
  deadline timestamptz,

  attachment_path text,
  source text,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'published',
        'archived'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 22. NOTICE EXTRACTIONS
-- ============================================================

create table public.notice_extractions (
  id uuid primary key default gen_random_uuid(),

  notice_id uuid not null unique
    references public.notices(id) on delete cascade,

  extracted_text text,
  summary text,

  extracted_dates jsonb not null default '[]'::jsonb,
  extracted_deadlines jsonb not null default '[]'::jsonb,

  suggested_category text,
  suggested_priority text,

  ai_status text not null default 'pending'
    check (
      ai_status in (
        'pending',
        'processing',
        'completed',
        'failed',
        'reviewed'
      )
    ),

  reviewed_by uuid
    references public.profiles(id) on delete set null,

  reviewed_at timestamptz,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 23. NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  recipient_profile_id uuid not null
    references public.profiles(id) on delete cascade,

  title text not null,
  message text not null,

  type text not null default 'system'
    check (
      type in (
        'assignment',
        'notice',
        'timetable',
        'attendance',
        'reminder',
        'event',
        'system',
        'ai'
      )
    ),

  priority text not null default 'normal'
    check (
      priority in (
        'urgent',
        'important',
        'normal'
      )
    ),

  related_entity_type text,
  related_entity_id uuid,

  read_at timestamptz,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 24. NOTIFICATION PREFERENCES
-- ============================================================

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null unique
    references public.profiles(id) on delete cascade,

  assignment_notifications boolean not null default true,
  notice_notifications boolean not null default true,
  attendance_notifications boolean not null default true,
  timetable_notifications boolean not null default true,
  event_notifications boolean not null default true,
  ai_notifications boolean not null default true,

  email_notifications boolean not null default true,
  push_notifications boolean not null default true,

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 25. STUDENT SUBJECT PROGRESS
-- ============================================================

create table public.student_subject_progress (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  progress_percentage numeric(5,2) not null default 0
    check (
      progress_percentage between 0 and 100
    ),

  updated_at timestamptz not null default now(),

  unique (student_id, subject_id)
);


-- ============================================================
-- 26. UNIT PROGRESS
-- ============================================================

create table public.unit_progress (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  unit_number integer not null
    check (unit_number > 0),

  progress_percentage numeric(5,2) not null default 0
    check (
      progress_percentage between 0 and 100
    ),

  completed boolean not null default false,

  updated_at timestamptz not null default now(),

  unique (student_id, subject_id, unit_number)
);


-- ============================================================
-- 27. STUDY PLANS
-- ============================================================

create table public.study_plans (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  title text not null,

  subject_id uuid
    references public.subjects(id) on delete set null,

  exam_date date,

  available_minutes_per_day integer
    check (
      available_minutes_per_day is null
      or available_minutes_per_day > 0
    ),

  start_date date,
  end_date date,

  created_by uuid
    references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    end_date is null
    or start_date is null
    or end_date >= start_date
  )
);


-- ============================================================
-- 28. STUDY PLAN ITEMS
-- ============================================================

create table public.study_plan_items (
  id uuid primary key default gen_random_uuid(),

  study_plan_id uuid not null
    references public.study_plans(id) on delete cascade,

  study_date date not null,

  start_time time,

  duration_minutes integer not null
    check (duration_minutes > 0),

  subject_id uuid
    references public.subjects(id) on delete set null,

  unit_id uuid
    references public.syllabus_units(id) on delete set null,

  task text not null,

  priority text not null default 'medium'
    check (
      priority in (
        'low',
        'medium',
        'high',
        'urgent'
      )
    ),

  status text not null default 'planned'
    check (
      status in (
        'planned',
        'completed',
        'skipped',
        'rescheduled'
      )
    ),

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 29. FOCUS SESSIONS
-- ============================================================

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id) on delete cascade,

  subject_id uuid
    references public.subjects(id) on delete set null,

  started_at timestamptz not null,
  ended_at timestamptz,

  duration_minutes integer
    check (
      duration_minutes is null
      or duration_minutes >= 0
    ),

  session_type text not null default 'study'
    check (
      session_type in (
        'study',
        'revision',
        'assignment',
        'reading',
        'practice',
        'other'
      )
    ),

  completed boolean not null default false,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 30. EXAMS
-- ============================================================

create table public.exams (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id) on delete cascade,

  semester_id uuid not null
    references public.semesters(id) on delete restrict,

  exam_type text not null default 'other'
    check (
      exam_type in (
        'internal',
        'semester',
        'practical',
        'viva',
        'other'
      )
    ),

  exam_date date not null,

  start_time time,
  end_time time,

  room text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    end_time is null
    or start_time is null
    or end_time > start_time
  )
);


-- ============================================================
-- 31. AI CONVERSATIONS
-- ============================================================

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id) on delete cascade,

  title text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 32. AI MESSAGES
-- ============================================================

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null
    references public.ai_conversations(id) on delete cascade,

  role text not null
    check (
      role in (
        'user',
        'assistant',
        'system'
      )
    ),

  content text not null,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 33. AI USAGE
-- ============================================================

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id) on delete cascade,

  feature text not null,

  request_count integer not null default 1
    check (request_count >= 0),

  tokens_used bigint not null default 0
    check (tokens_used >= 0),

  usage_date date not null default current_date,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 34. AUDIT LOGS
-- ============================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid
    references public.profiles(id) on delete set null,

  action text not null,
  entity_type text,
  entity_id uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 35. INDEXES
-- ============================================================

create index idx_programs_department_id
  on public.programs(department_id);

create index idx_semesters_program_id
  on public.semesters(program_id);

create index idx_subjects_department_id
  on public.subjects(department_id);

create index idx_subjects_semester_id
  on public.subjects(semester_id);

create index idx_students_program_id
  on public.students(program_id);

create index idx_students_semester_id
  on public.students(semester_id);

create index idx_student_subjects_student_id
  on public.student_subjects(student_id);

create index idx_student_subjects_subject_id
  on public.student_subjects(subject_id);

create index idx_faculty_department_id
  on public.faculty(department_id);

create index idx_faculty_subjects_faculty_id
  on public.faculty_subjects(faculty_id);

create index idx_faculty_subjects_subject_id
  on public.faculty_subjects(subject_id);

create index idx_timetable_semester_id
  on public.timetable_entries(semester_id);

create index idx_timetable_subject_id
  on public.timetable_entries(subject_id);

create index idx_timetable_faculty_id
  on public.timetable_entries(faculty_id);

create index idx_assignments_subject_id
  on public.assignments(subject_id);

create index idx_assignments_faculty_id
  on public.assignments(faculty_id);

create index idx_assignments_due_date
  on public.assignments(due_date);

create index idx_assignment_status_student_id
  on public.assignment_status(student_id);

create index idx_attendance_sessions_subject_id
  on public.attendance_sessions(subject_id);

create index idx_attendance_sessions_date
  on public.attendance_sessions(session_date);

create index idx_attendance_records_student_id
  on public.attendance_records(student_id);

create index idx_attendance_records_session_id
  on public.attendance_records(session_id);

create index idx_syllabus_units_subject_id
  on public.syllabus_units(subject_id);

create index idx_syllabus_topics_unit_id
  on public.syllabus_topics(unit_id);

create index idx_resources_subject_id
  on public.resources(subject_id);

create index idx_resources_unit_id
  on public.resources(unit_id);

create index idx_resources_uploaded_by
  on public.resources(uploaded_by);

create index idx_notes_student_id
  on public.notes(student_id);

create index idx_notes_subject_id
  on public.notes(subject_id);

create index idx_notices_category
  on public.notices(category);

create index idx_notices_status
  on public.notices(status);

create index idx_notices_deadline
  on public.notices(deadline);

create index idx_notifications_recipient
  on public.notifications(recipient_profile_id);

create index idx_notifications_created_at
  on public.notifications(created_at desc);

create index idx_student_subject_progress_student
  on public.student_subject_progress(student_id);

create index idx_unit_progress_student
  on public.unit_progress(student_id);

create index idx_study_plans_student
  on public.study_plans(student_id);

create index idx_study_plan_items_plan
  on public.study_plan_items(study_plan_id);

create index idx_study_plan_items_date
  on public.study_plan_items(study_date);

create index idx_focus_sessions_student
  on public.focus_sessions(student_id);

create index idx_focus_sessions_started_at
  on public.focus_sessions(started_at desc);

create index idx_exams_subject
  on public.exams(subject_id);

create index idx_exams_date
  on public.exams(exam_date);

create index idx_ai_conversations_profile
  on public.ai_conversations(profile_id);

create index idx_ai_messages_conversation
  on public.ai_messages(conversation_id);

create index idx_ai_usage_profile_date
  on public.ai_usage(profile_id, usage_date);

create index idx_audit_logs_profile
  on public.audit_logs(profile_id);

create index idx_audit_logs_created_at
  on public.audit_logs(created_at desc);


-- ============================================================
-- 36. UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create trigger departments_updated_at
before update on public.departments
for each row
execute function public.handle_updated_at();

create trigger programs_updated_at
before update on public.programs
for each row
execute function public.handle_updated_at();

create trigger semesters_updated_at
before update on public.semesters
for each row
execute function public.handle_updated_at();

create trigger subjects_updated_at
before update on public.subjects
for each row
execute function public.handle_updated_at();

create trigger students_updated_at
before update on public.students
for each row
execute function public.handle_updated_at();

create trigger faculty_updated_at
before update on public.faculty
for each row
execute function public.handle_updated_at();

create trigger timetable_entries_updated_at
before update on public.timetable_entries
for each row
execute function public.handle_updated_at();

create trigger assignments_updated_at
before update on public.assignments
for each row
execute function public.handle_updated_at();

create trigger assignment_status_updated_at
before update on public.assignment_status
for each row
execute function public.handle_updated_at();

create trigger syllabus_units_updated_at
before update on public.syllabus_units
for each row
execute function public.handle_updated_at();

create trigger syllabus_topics_updated_at
before update on public.syllabus_topics
for each row
execute function public.handle_updated_at();

create trigger resources_updated_at
before update on public.resources
for each row
execute function public.handle_updated_at();

create trigger notes_updated_at
before update on public.notes
for each row
execute function public.handle_updated_at();

create trigger notices_updated_at
before update on public.notices
for each row
execute function public.handle_updated_at();

create trigger notification_preferences_updated_at
before update on public.notification_preferences
for each row
execute function public.handle_updated_at();

create trigger student_subject_progress_updated_at
before update on public.student_subject_progress
for each row
execute function public.handle_updated_at();

create trigger unit_progress_updated_at
before update on public.unit_progress
for each row
execute function public.handle_updated_at();

create trigger study_plans_updated_at
before update on public.study_plans
for each row
execute function public.handle_updated_at();

create trigger study_plan_items_updated_at
before update on public.study_plan_items
for each row
execute function public.handle_updated_at();

create trigger exams_updated_at
before update on public.exams
for each row
execute function public.handle_updated_at();

create trigger ai_conversations_updated_at
before update on public.ai_conversations
for each row
execute function public.handle_updated_at();


-- ============================================================
-- 37. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;

alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;

alter table public.students enable row level security;
alter table public.student_subjects enable row level security;

alter table public.faculty enable row level security;
alter table public.faculty_subjects enable row level security;

alter table public.timetable_entries enable row level security;

alter table public.assignments enable row level security;
alter table public.assignment_status enable row level security;

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

alter table public.syllabus_units enable row level security;
alter table public.syllabus_topics enable row level security;

alter table public.resources enable row level security;
alter table public.notes enable row level security;

alter table public.notices enable row level security;
alter table public.notice_extractions enable row level security;

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

alter table public.student_subject_progress enable row level security;
alter table public.unit_progress enable row level security;

alter table public.study_plans enable row level security;
alter table public.study_plan_items enable row level security;

alter table public.focus_sessions enable row level security;
alter table public.exams enable row level security;

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_usage enable row level security;

alter table public.audit_logs enable row level security;


-- ============================================================
-- 38. HELPER FUNCTIONS FOR RLS
-- ============================================================

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;


create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


create or replace function public.is_faculty()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'faculty'
  );
$$;


-- ============================================================
-- 39. PROFILE POLICIES
-- ============================================================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
)
with check (
  id = auth.uid()
  or public.is_admin()
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);


-- ============================================================
-- 40. PUBLIC ACADEMIC STRUCTURE READ POLICIES
-- ============================================================

create policy "departments_authenticated_read"
on public.departments
for select
to authenticated
using (true);

create policy "programs_authenticated_read"
on public.programs
for select
to authenticated
using (true);

create policy "semesters_authenticated_read"
on public.semesters
for select
to authenticated
using (true);

create policy "subjects_authenticated_read"
on public.subjects
for select
to authenticated
using (true);


-- ============================================================
-- 41. STUDENT POLICIES
-- ============================================================

create policy "students_select_own"
on public.students
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "students_update_own"
on public.students
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
)
with check (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "students_admin_insert"
on public.students
for insert
to authenticated
with check (
  public.is_admin()
);


-- ============================================================
-- 42. STUDENT SUBJECT POLICIES
-- ============================================================

create policy "student_subjects_select_own"
on public.student_subjects
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = student_subjects.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "student_subjects_admin_manage"
on public.student_subjects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 43. FACULTY POLICIES
-- ============================================================

create policy "faculty_select_own"
on public.faculty
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "faculty_admin_manage"
on public.faculty
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 44. FACULTY SUBJECT POLICIES
-- ============================================================

create policy "faculty_subjects_authenticated_read"
on public.faculty_subjects
for select
to authenticated
using (true);

create policy "faculty_subjects_admin_manage"
on public.faculty_subjects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 45. TIMETABLE POLICIES
-- ============================================================

create policy "timetable_authenticated_read"
on public.timetable_entries
for select
to authenticated
using (true);

create policy "timetable_faculty_admin_manage"
on public.timetable_entries
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = timetable_entries.faculty_id
      and f.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = timetable_entries.faculty_id
      and f.profile_id = auth.uid()
  )
);


-- ============================================================
-- 46. ASSIGNMENT POLICIES
-- ============================================================

create policy "assignments_authenticated_read"
on public.assignments
for select
to authenticated
using (true);

create policy "assignments_faculty_admin_manage"
on public.assignments
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = assignments.faculty_id
      and f.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = assignments.faculty_id
      and f.profile_id = auth.uid()
  )
);


-- ============================================================
-- 47. ASSIGNMENT STATUS POLICIES
-- ============================================================

create policy "assignment_status_select_own"
on public.assignment_status
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = assignment_status.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "assignment_status_insert_own"
on public.assignment_status
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = assignment_status.student_id
      and s.profile_id = auth.uid()
  )
);

create policy "assignment_status_update_own"
on public.assignment_status
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = assignment_status.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = assignment_status.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 48. ATTENDANCE POLICIES
-- ============================================================

create policy "attendance_sessions_authenticated_read"
on public.attendance_sessions
for select
to authenticated
using (true);

create policy "attendance_sessions_faculty_admin_manage"
on public.attendance_sessions
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = attendance_sessions.faculty_id
      and f.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.faculty f
    where f.id = attendance_sessions.faculty_id
      and f.profile_id = auth.uid()
  )
);


create policy "attendance_records_select_own"
on public.attendance_records
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = attendance_records.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "attendance_records_faculty_admin_manage"
on public.attendance_records
for all
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.attendance_sessions a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id = attendance_records.session_id
      and f.profile_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.attendance_sessions a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id = attendance_records.session_id
      and f.profile_id = auth.uid()
  )
);


-- ============================================================
-- 49. SYLLABUS POLICIES
-- ============================================================

create policy "syllabus_units_authenticated_read"
on public.syllabus_units
for select
to authenticated
using (true);

create policy "syllabus_topics_authenticated_read"
on public.syllabus_topics
for select
to authenticated
using (true);

create policy "syllabus_units_admin_manage"
on public.syllabus_units
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "syllabus_topics_admin_manage"
on public.syllabus_topics
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 50. RESOURCE POLICIES
-- ============================================================

create policy "resources_authenticated_read"
on public.resources
for select
to authenticated
using (
  visibility = 'public'
  or visibility = 'students'
  or visibility = 'faculty'
  or uploaded_by = auth.uid()
  or public.is_admin()
);

create policy "resources_owner_faculty_admin_manage"
on public.resources
for all
to authenticated
using (
  uploaded_by = auth.uid()
  or public.is_admin()
  or public.is_faculty()
)
with check (
  uploaded_by = auth.uid()
  or public.is_admin()
  or public.is_faculty()
);


-- ============================================================
-- 51. NOTES POLICIES
-- ============================================================

create policy "notes_select_own"
on public.notes
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = notes.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "notes_insert_own"
on public.notes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = notes.student_id
      and s.profile_id = auth.uid()
  )
);

create policy "notes_update_own"
on public.notes
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = notes.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = notes.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "notes_delete_own"
on public.notes
for delete
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = notes.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 52. NOTICE POLICIES
-- ============================================================

create policy "notices_authenticated_read"
on public.notices
for select
to authenticated
using (
  status = 'published'
  or created_by = auth.uid()
  or public.is_admin()
  or public.is_faculty()
);

create policy "notices_faculty_admin_manage"
on public.notices
for all
to authenticated
using (
  public.is_admin()
  or public.is_faculty()
)
with check (
  public.is_admin()
  or public.is_faculty()
);


-- ============================================================
-- 53. NOTICE EXTRACTION POLICIES
-- ============================================================

create policy "notice_extractions_authorized_read"
on public.notice_extractions
for select
to authenticated
using (
  public.is_admin()
  or public.is_faculty()
  or exists (
    select 1
    from public.notices n
    where n.id = notice_extractions.notice_id
      and n.status = 'published'
  )
);

create policy "notice_extractions_admin_faculty_manage"
on public.notice_extractions
for all
to authenticated
using (
  public.is_admin()
  or public.is_faculty()
)
with check (
  public.is_admin()
  or public.is_faculty()
);


-- ============================================================
-- 54. NOTIFICATION POLICIES
-- ============================================================

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (
  recipient_profile_id = auth.uid()
  or public.is_admin()
);

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (
  recipient_profile_id = auth.uid()
  or public.is_admin()
)
with check (
  recipient_profile_id = auth.uid()
  or public.is_admin()
);

create policy "notifications_admin_insert"
on public.notifications
for insert
to authenticated
with check (
  public.is_admin()
);


-- ============================================================
-- 55. NOTIFICATION PREFERENCE POLICIES
-- ============================================================

create policy "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (
  profile_id = auth.uid()
);

create policy "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
)
with check (
  profile_id = auth.uid()
  or public.is_admin()
);


-- ============================================================
-- 56. SUBJECT PROGRESS POLICIES
-- ============================================================

create policy "student_subject_progress_select_own"
on public.student_subject_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = student_subject_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "student_subject_progress_manage_own"
on public.student_subject_progress
for all
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = student_subject_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = student_subject_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 57. UNIT PROGRESS POLICIES
-- ============================================================

create policy "unit_progress_select_own"
on public.unit_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = unit_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "unit_progress_manage_own"
on public.unit_progress
for all
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = unit_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = unit_progress.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 58. STUDY PLAN POLICIES
-- ============================================================

create policy "study_plans_select_own"
on public.study_plans
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = study_plans.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "study_plans_manage_own"
on public.study_plans
for all
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = study_plans.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = study_plans.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 59. STUDY PLAN ITEM POLICIES
-- ============================================================

create policy "study_plan_items_select_own"
on public.study_plan_items
for select
to authenticated
using (
  exists (
    select 1
    from public.study_plans sp
    join public.students s
      on s.id = sp.student_id
    where sp.id = study_plan_items.study_plan_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "study_plan_items_manage_own"
on public.study_plan_items
for all
to authenticated
using (
  exists (
    select 1
    from public.study_plans sp
    join public.students s
      on s.id = sp.student_id
    where sp.id = study_plan_items.study_plan_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.study_plans sp
    join public.students s
      on s.id = sp.student_id
    where sp.id = study_plan_items.study_plan_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 60. FOCUS SESSION POLICIES
-- ============================================================

create policy "focus_sessions_select_own"
on public.focus_sessions
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = focus_sessions.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "focus_sessions_manage_own"
on public.focus_sessions
for all
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = focus_sessions.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = focus_sessions.student_id
      and (
        s.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);


-- ============================================================
-- 61. EXAM POLICIES
-- ============================================================

create policy "exams_authenticated_read"
on public.exams
for select
to authenticated
using (true);

create policy "exams_admin_faculty_manage"
on public.exams
for all
to authenticated
using (
  public.is_admin()
  or public.is_faculty()
)
with check (
  public.is_admin()
  or public.is_faculty()
);


-- ============================================================
-- 62. AI CONVERSATION POLICIES
-- ============================================================

create policy "ai_conversations_select_own"
on public.ai_conversations
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "ai_conversations_insert_own"
on public.ai_conversations
for insert
to authenticated
with check (
  profile_id = auth.uid()
);

create policy "ai_conversations_update_own"
on public.ai_conversations
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
)
with check (
  profile_id = auth.uid()
  or public.is_admin()
);


-- ============================================================
-- 63. AI MESSAGE POLICIES
-- ============================================================

create policy "ai_messages_select_own"
on public.ai_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_conversations c
    where c.id = ai_messages.conversation_id
      and (
        c.profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "ai_messages_insert_own"
on public.ai_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ai_conversations c
    where c.id = ai_messages.conversation_id
      and c.profile_id = auth.uid()
  )
);


-- ============================================================
-- 64. AI USAGE POLICIES
-- ============================================================

create policy "ai_usage_select_own"
on public.ai_usage
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin()
);

create policy "ai_usage_admin_insert"
on public.ai_usage
for insert
to authenticated
with check (
  profile_id = auth.uid()
  or public.is_admin()
);


-- ============================================================
-- 65. AUDIT LOG POLICIES
-- ============================================================

create policy "audit_logs_admin_read"
on public.audit_logs
for select
to authenticated
using (
  public.is_admin()
);

create policy "audit_logs_admin_insert"
on public.audit_logs
for insert
to authenticated
with check (
  public.is_admin()
);


-- ============================================================
-- 66. DEFAULT PROFILE CREATION FOR NEW AUTH USERS
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.email,
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- 67. END OF INITIAL SCHEMA
-- ============================================================