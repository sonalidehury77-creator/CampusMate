-- ============================================================
-- CAMPUSMATE
-- PHASE 29 — ATTENDANCE INTELLIGENCE
-- ============================================================


-- ============================================================
-- 1. ALLOW "late" ATTENDANCE STATUS
-- ============================================================

alter table public.attendance_records
drop constraint if exists attendance_records_status_check;

alter table public.attendance_records
add constraint attendance_records_status_check
check (
  status in (
    'present',
    'absent',
    'late',
    'excused'
  )
);


-- ============================================================
-- 2. ATTENDANCE POLICIES
-- ============================================================

create table if not exists public.attendance_policies (
  id uuid primary key default gen_random_uuid(),

  subject_id uuid not null
    references public.subjects(id)
    on delete cascade,

  required_percentage numeric(5,2)
    not null
    default 75,

  warning_percentage numeric(5,2)
    not null
    default 75,

  prediction_window_days integer
    not null
    default 30,

  enabled boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint attendance_policy_percentage_valid
  check (
    required_percentage >= 0
    and required_percentage <= 100
  ),

  constraint attendance_policy_warning_valid
  check (
    warning_percentage >= 0
    and warning_percentage <= 100
  ),

  constraint attendance_policy_window_valid
  check (
    prediction_window_days > 0
    and prediction_window_days <= 365
  ),

  unique(subject_id)
);


-- ============================================================
-- 3. INDEXES
-- ============================================================

create index if not exists
attendance_policies_subject_idx
on public.attendance_policies(subject_id);

create index if not exists
attendance_records_student_status_idx
on public.attendance_records(
  student_id,
  status
);

create index if not exists
attendance_records_marked_at_idx
on public.attendance_records(marked_at);

create index if not exists
attendance_sessions_subject_date_idx
on public.attendance_sessions(
  subject_id,
  session_date
);


-- ============================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================

drop trigger if exists
attendance_policies_updated_at
on public.attendance_policies;

create or replace function public.update_attendance_policy_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger attendance_policies_updated_at
before update on public.attendance_policies
for each row
execute function public.update_attendance_policy_updated_at();

-- ============================================================
-- 5. RLS
-- ============================================================

alter table public.attendance_policies
enable row level security;


-- ============================================================
-- 6. REMOVE OLD POLICIES IF RE-RUN
-- ============================================================

drop policy if exists
"attendance_policies_authenticated_read"
on public.attendance_policies;

drop policy if exists
"attendance_policies_admin_insert"
on public.attendance_policies;

drop policy if exists
"attendance_policies_admin_update"
on public.attendance_policies;

drop policy if exists
"attendance_policies_admin_delete"
on public.attendance_policies;


-- ============================================================
-- 7. POLICY READ
-- ============================================================

create policy
"attendance_policies_authenticated_read"
on public.attendance_policies
for select
to authenticated
using (true);


-- ============================================================
-- 8. ADMIN CREATE
-- ============================================================

create policy
"attendance_policies_admin_insert"
on public.attendance_policies
for insert
to authenticated
with check (
  public.is_admin()
);


-- ============================================================
-- 9. ADMIN UPDATE
-- ============================================================

create policy
"attendance_policies_admin_update"
on public.attendance_policies
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 10. ADMIN DELETE
-- ============================================================

create policy
"attendance_policies_admin_delete"
on public.attendance_policies
for delete
to authenticated
using (
  public.is_admin()
);


-- ============================================================
-- 11. DEFAULT POLICY FOR EXISTING SUBJECTS
-- ============================================================

insert into public.attendance_policies (
  subject_id,
  required_percentage,
  warning_percentage,
  prediction_window_days,
  enabled
)
select
  s.id,
  75,
  75,
  30,
  true
from public.subjects s
where not exists (
  select 1
  from public.attendance_policies ap
  where ap.subject_id = s.id
);


-- ============================================================
-- END PHASE 29 MIGRATION
-- ============================================================