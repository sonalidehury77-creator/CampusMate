-- ============================================================
-- CAMPUSMATE
-- PHASE 27 — ADVANCED FACULTY WORKSPACE
-- ============================================================

-- ============================================================
-- 1. RLS HELPER FUNCTIONS
-- ============================================================

create or replace function public.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.students
  where profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_faculty_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.faculty
  where profile_id = auth.uid()
  limit 1;
$$;

grant execute
on function public.current_student_id()
to authenticated;

grant execute
on function public.current_faculty_id()
to authenticated;


-- ============================================================
-- 2. ASSIGNMENT SUBMISSIONS
-- ============================================================

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),

  assignment_id uuid not null
    references public.assignments(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  status text not null default 'submitted'
    check (
      status in (
        'submitted',
        'late',
        'graded',
        'returned',
        'missing'
      )
    ),

  submission_text text,

  attachment_path text,

  submitted_at timestamptz,

  marks numeric(6,2),

  max_marks numeric(6,2),

  feedback text,

  graded_by uuid
    references public.profiles(id)
    on delete set null,

  graded_at timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (assignment_id, student_id)
);


-- ============================================================
-- 3. ATTENDANCE CORRECTION HISTORY
-- ============================================================

create table if not exists public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),

  attendance_record_id uuid not null
    references public.attendance_records(id)
    on delete cascade,

  old_status text not null,

  new_status text not null,

  reason text,

  corrected_by uuid not null
    references public.profiles(id)
    on delete restrict,

  corrected_at timestamptz not null default now()
);


-- ============================================================
-- 4. INDEXES
-- ============================================================

create index if not exists assignment_submissions_assignment_idx
on public.assignment_submissions(assignment_id);

create index if not exists assignment_submissions_student_idx
on public.assignment_submissions(student_id);

create index if not exists assignment_submissions_status_idx
on public.assignment_submissions(status);

create index if not exists attendance_corrections_record_idx
on public.attendance_corrections(attendance_record_id);

create index if not exists attendance_corrections_corrected_by_idx
on public.attendance_corrections(corrected_by);


-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_assignment_submission_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assignment_submissions_updated_at
on public.assignment_submissions;

create trigger assignment_submissions_updated_at
before update
on public.assignment_submissions
for each row
execute function public.set_assignment_submission_updated_at();


-- ============================================================
-- 6. ENABLE RLS
-- ============================================================

alter table public.assignment_submissions enable row level security;

alter table public.attendance_corrections enable row level security;


-- ============================================================
-- 7. ASSIGNMENT SUBMISSION POLICIES
-- ============================================================

drop policy if exists
"assignment_submissions_student_select_own"
on public.assignment_submissions;

create policy
"assignment_submissions_student_select_own"
on public.assignment_submissions
for select
to authenticated
using (
  student_id = public.current_student_id()
  or public.is_admin()
  or (
    public.is_faculty()
    and exists (
      select 1
      from public.assignments a
      where a.id = public.assignment_submissions.assignment_id
        and a.faculty_id = public.current_faculty_id()
    )
  )
);


drop policy if exists
"assignment_submissions_student_insert_own"
on public.assignment_submissions;

create policy
"assignment_submissions_student_insert_own"
on public.assignment_submissions
for insert
to authenticated
with check (
  student_id = public.current_student_id()
);


drop policy if exists
"assignment_submissions_student_update_own"
on public.assignment_submissions;

create policy
"assignment_submissions_student_update_own"
on public.assignment_submissions
for update
to authenticated
using (
  student_id = public.current_student_id()
)
with check (
  student_id = public.current_student_id()
);


drop policy if exists
"assignment_submissions_faculty_update"
on public.assignment_submissions;

create policy
"assignment_submissions_faculty_update"
on public.assignment_submissions
for update
to authenticated
using (
  public.is_admin()
  or (
    public.is_faculty()
    and exists (
      select 1
      from public.assignments a
      where a.id = public.assignment_submissions.assignment_id
        and a.faculty_id = public.current_faculty_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    public.is_faculty()
    and exists (
      select 1
      from public.assignments a
      where a.id = public.assignment_submissions.assignment_id
        and a.faculty_id = public.current_faculty_id()
    )
  )
);


drop policy if exists
"assignment_submissions_faculty_delete"
on public.assignment_submissions;

create policy
"assignment_submissions_faculty_delete"
on public.assignment_submissions
for delete
to authenticated
using (
  public.is_admin()
  or (
    public.is_faculty()
    and exists (
      select 1
      from public.assignments a
      where a.id = public.assignment_submissions.assignment_id
        and a.faculty_id = public.current_faculty_id()
    )
  )
);


-- ============================================================
-- 8. ATTENDANCE CORRECTION POLICIES
-- ============================================================

drop policy if exists
"attendance_corrections_faculty_select"
on public.attendance_corrections;

create policy
"attendance_corrections_faculty_select"
on public.attendance_corrections
for select
to authenticated
using (
  public.is_admin()
  or (
    public.is_faculty()
    and corrected_by = auth.uid()
  )
);


drop policy if exists
"attendance_corrections_faculty_insert"
on public.attendance_corrections;

create policy
"attendance_corrections_faculty_insert"
on public.attendance_corrections
for insert
to authenticated
with check (
  public.is_admin()
  or (
    public.is_faculty()
    and corrected_by = auth.uid()
  )
);


-- ============================================================
-- 9. TABLE PRIVILEGES
-- ============================================================

grant select, insert, update, delete
on public.assignment_submissions
to authenticated;

grant select, insert
on public.attendance_corrections
to authenticated;