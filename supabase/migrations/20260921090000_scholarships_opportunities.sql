-- ============================================================
-- CampusMate
-- Phase 23 — Scholarships & Opportunities
-- ============================================================

create extension if not exists pg_trgm;

-- ============================================================
-- 1. OPPORTUNITIES
-- ============================================================

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  opportunity_type text not null
    check (
      opportunity_type in (
        'scholarship',
        'internship',
        'hackathon',
        'competition',
        'workshop',
        'certification',
        'placement',
        'government',
        'fellowship',
        'research',
        'other'
      )
    ),

  provider_name text,
  source_name text,
  source_url text,
  application_url text,

  eligibility text,
  required_documents jsonb not null default '[]'::jsonb,

  organization_type text,
  industry text,
  location text,
  mode text
    check (
      mode is null
      or mode in (
        'online',
        'offline',
        'hybrid'
      )
    ),

  amount numeric(12,2),
  currency text not null default 'INR',

  deadline timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,

  tags text[] not null default '{}',

  is_verified boolean not null default false,
  is_featured boolean not null default false,

  status text not null default 'published'
    check (
      status in (
        'draft',
        'published',
        'closed',
        'archived'
      )
    ),

  academic_year text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  search_vector tsvector
    generated always as (
      to_tsvector(
        'english',
        coalesce(title, '')
        || ' '
        || coalesce(description, '')
        || ' '
        || coalesce(provider_name, '')
        || ' '
        || coalesce(source_name, '')
        || ' '
        || coalesce(eligibility, '')
        || ' '
        || coalesce(industry, '')
        || ' '
        || coalesce(location, '')
      )
    ) stored
);

-- ============================================================
-- 2. OPPORTUNITY APPLICATIONS
-- ============================================================

create table if not exists public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),

  opportunity_id uuid not null
    references public.opportunities(id)
    on delete cascade,

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  status text not null default 'saved'
    check (
      status in (
        'saved',
        'applied',
        'shortlisted',
        'selected',
        'rejected',
        'withdrawn'
      )
    ),

  applied_at timestamptz,
  notes text,

  completed_documents jsonb not null default '[]'::jsonb,

  reminder_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (opportunity_id, student_id)
);

-- ============================================================
-- 3. OPPORTUNITY PREFERENCES
-- ============================================================

create table if not exists public.opportunity_preferences (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null unique
    references public.students(id)
    on delete cascade,

  preferred_types text[] not null default '{}',
  preferred_keywords text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  preferred_modes text[] not null default '{}',

  minimum_amount numeric(12,2),

  notifications_enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

create index if not exists opportunities_type_idx
  on public.opportunities(opportunity_type);

create index if not exists opportunities_deadline_idx
  on public.opportunities(deadline);

create index if not exists opportunities_status_idx
  on public.opportunities(status);

create index if not exists opportunities_verified_idx
  on public.opportunities(is_verified);

create index if not exists opportunities_featured_idx
  on public.opportunities(is_featured);

create index if not exists opportunities_tags_idx
  on public.opportunities
  using gin(tags);

create index if not exists opportunities_search_vector_idx
  on public.opportunities
  using gin(search_vector);

create index if not exists opportunities_title_trgm_idx
  on public.opportunities
  using gin(title gin_trgm_ops);

create index if not exists opportunity_applications_student_idx
  on public.opportunity_applications(student_id);

create index if not exists opportunity_applications_opportunity_idx
  on public.opportunity_applications(opportunity_id);

create index if not exists opportunity_applications_status_idx
  on public.opportunity_applications(status);

create index if not exists opportunity_preferences_student_idx
  on public.opportunity_preferences(student_id);

-- ============================================================
-- 5. UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_opportunity_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists opportunities_updated_at
on public.opportunities;

create trigger opportunities_updated_at
before update on public.opportunities
for each row
execute function public.set_opportunity_updated_at();

drop trigger if exists opportunity_applications_updated_at
on public.opportunity_applications;

create trigger opportunity_applications_updated_at
before update on public.opportunity_applications
for each row
execute function public.set_opportunity_updated_at();

drop trigger if exists opportunity_preferences_updated_at
on public.opportunity_preferences;

create trigger opportunity_preferences_updated_at
before update on public.opportunity_preferences
for each row
execute function public.set_opportunity_updated_at();

-- ============================================================
-- 6. RLS
-- ============================================================

alter table public.opportunities
enable row level security;

alter table public.opportunity_applications
enable row level security;

alter table public.opportunity_preferences
enable row level security;

-- ============================================================
-- OPPORTUNITIES POLICIES
-- ============================================================

drop policy if exists "Students can view published opportunities"
on public.opportunities;

create policy "Students can view published opportunities"
on public.opportunities
for select
to authenticated
using (
  status = 'published'
);

drop policy if exists "Admins can manage opportunities"
on public.opportunities;

create policy "Admins can manage opportunities"
on public.opportunities
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  )
);

-- ============================================================
-- APPLICATION POLICIES
-- ============================================================

drop policy if exists "Students can view their opportunity applications"
on public.opportunity_applications;

create policy "Students can view their opportunity applications"
on public.opportunity_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_applications.student_id
      and s.profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can create their opportunity applications"
on public.opportunity_applications;

create policy "Students can create their opportunity applications"
on public.opportunity_applications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_applications.student_id
      and s.profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update their opportunity applications"
on public.opportunity_applications;

create policy "Students can update their opportunity applications"
on public.opportunity_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_applications.student_id
      and s.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_applications.student_id
      and s.profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can delete their opportunity applications"
on public.opportunity_applications;

create policy "Students can delete their opportunity applications"
on public.opportunity_applications
for delete
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_applications.student_id
      and s.profile_id = (select auth.uid())
  )
);

-- ============================================================
-- PREFERENCES POLICIES
-- ============================================================

drop policy if exists "Students can view their opportunity preferences"
on public.opportunity_preferences;

create policy "Students can view their opportunity preferences"
on public.opportunity_preferences
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_preferences.student_id
      and s.profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can create their opportunity preferences"
on public.opportunity_preferences;

create policy "Students can create their opportunity preferences"
on public.opportunity_preferences
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_preferences.student_id
      and s.profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update their opportunity preferences"
on public.opportunity_preferences;

create policy "Students can update their opportunity preferences"
on public.opportunity_preferences
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_preferences.student_id
      and s.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = opportunity_preferences.student_id
      and s.profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 7. REAL VERIFIED INITIAL DATA
-- ============================================================

insert into public.opportunities (
  title,
  description,
  opportunity_type,
  provider_name,
  source_name,
  source_url,
  application_url,
  eligibility,
  required_documents,
  organization_type,
  industry,
  location,
  mode,
  deadline,
  tags,
  is_verified,
  is_featured,
  status,
  academic_year
)
select
  'PM-USP – Central Sector Scheme of Scholarship for College and University Students (CSSS)',
  'Official National Scholarship Portal listing for the 2026-27 academic year. Students should verify the current scheme eligibility, application requirements and timeline on the official portal before applying.',
  'scholarship',
  'Department of Higher Education',
  'National Scholarship Portal',
  'https://scholarships.gov.in/All-Scholarships',
  'https://scholarships.gov.in/Students',
  'Check the official NSP scheme eligibility and current application requirements before applying.',
  '["NSP OTR", "academic documents", "bank/DBT information", "institution verification documents"]'::jsonb,
  'Government',
  'Higher Education',
  'India',
  'online',
  '2026-10-31 23:59:59+05:30',
  array[
    'scholarship',
    'college',
    'university',
    'undergraduate',
    'merit',
    'government',
    'NSP',
    'CSSS'
  ],
  true,
  true,
  'published',
  '2026-27'
where not exists (
  select 1
  from public.opportunities
  where title =
    'PM-USP – Central Sector Scheme of Scholarship for College and University Students (CSSS)'
);

insert into public.opportunities (
  title,
  description,
  opportunity_type,
  provider_name,
  source_name,
  source_url,
  application_url,
  eligibility,
  required_documents,
  organization_type,
  industry,
  location,
  mode,
  deadline,
  tags,
  is_verified,
  is_featured,
  status,
  academic_year
)
select
  'AICTE – Pragati Scholarship Scheme for Girl Students (Technical Degree)',
  'Official National Scholarship Portal listing for the AICTE Pragati Scholarship Scheme for technical degree students. Verify the current scheme eligibility and application requirements on the official portal before applying.',
  'scholarship',
  'All India Council for Technical Education',
  'National Scholarship Portal',
  'https://scholarships.gov.in/All-Scholarships',
  'https://scholarships.gov.in/Students',
  'Check the official NSP and AICTE scheme eligibility and current application requirements before applying.',
  '["NSP OTR", "academic documents", "institution documents", "bank/DBT information"]'::jsonb,
  'Government',
  'Technical Education',
  'India',
  'online',
  '2026-10-31 23:59:59+05:30',
  array[
    'scholarship',
    'AICTE',
    'Pragati',
    'girl students',
    'technical degree',
    'engineering',
    'technology',
    'government'
  ],
  true,
  true,
  'published',
  '2026-27'
where not exists (
  select 1
  from public.opportunities
  where title =
    'AICTE – Pragati Scholarship Scheme for Girl Students (Technical Degree)'
);

-- ============================================================
-- 8. GRANTS
-- ============================================================

revoke all
on table public.opportunities
from anon;

revoke all
on table public.opportunity_applications
from anon;

revoke all
on table public.opportunity_preferences
from anon;

grant select
on table public.opportunities
to authenticated;

grant select, insert, update, delete
on table public.opportunity_applications
to authenticated;

grant select, insert, update
on table public.opportunity_preferences
to authenticated;

grant select, insert, update, delete
on table public.opportunities
to authenticated;