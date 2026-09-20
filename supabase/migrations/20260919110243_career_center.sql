-- ============================================================
-- CampusMate
-- Phase 22 — Career Center + Skill Intelligence
-- ============================================================

-- ============================================================
-- 1. CAREER PROFILES
-- ============================================================

create table if not exists public.career_profiles (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  target_role text,
  target_industry text,
  target_company_type text,

  career_summary text,

  github_url text,
  linkedin_url text,
  portfolio_url text,
  resume_url text,

  availability_status text
    default 'open_to_opportunities'
    check (
      availability_status in (
        'open_to_opportunities',
        'actively_looking',
        'not_looking',
        'open_to_internships'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(student_id)
);

-- ============================================================
-- 2. SKILLS MASTER
-- ============================================================

create table if not exists public.career_skills (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  category text not null,

  description text,

  is_technical boolean not null default true,

  created_at timestamptz not null default now(),

  unique(name)
);

-- ============================================================
-- 3. STUDENT SKILLS
-- ============================================================

create table if not exists public.student_career_skills (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  skill_id uuid not null
    references public.career_skills(id)
    on delete cascade,

  proficiency_level integer not null default 1
    check (proficiency_level between 1 and 5),

  years_experience numeric(4,1)
    check (
      years_experience is null
      or years_experience >= 0
    ),

  evidence text,

  last_used_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(student_id, skill_id)
);

-- ============================================================
-- 4. CAREER PROJECTS
-- ============================================================

create table if not exists public.career_projects (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  title text not null,

  description text,

  project_type text,

  status text not null default 'completed'
    check (
      status in (
        'idea',
        'in_progress',
        'completed'
      )
    ),

  github_url text,
  live_url text,

  started_at date,
  completed_at date,

  featured boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. PROJECT SKILLS
-- ============================================================

create table if not exists public.career_project_skills (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.career_projects(id)
    on delete cascade,

  skill_id uuid not null
    references public.career_skills(id)
    on delete cascade,

  created_at timestamptz not null default now(),

  unique(project_id, skill_id)
);

-- ============================================================
-- 6. CERTIFICATIONS
-- ============================================================

create table if not exists public.career_certifications (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  name text not null,

  issuing_organization text,

  credential_id text,

  credential_url text,

  issue_date date,
  expiry_date date,

  does_not_expire boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 7. CAREER GOALS
-- ============================================================

create table if not exists public.career_goals (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  title text not null,

  description text,

  goal_type text not null
    check (
      goal_type in (
        'job',
        'internship',
        'placement',
        'higher_studies',
        'freelancing',
        'entrepreneurship',
        'certification'
      )
    ),

  target_date date,

  status text not null default 'active'
    check (
      status in (
        'active',
        'completed',
        'paused',
        'cancelled'
      )
    ),

  progress integer not null default 0
    check (progress between 0 and 100),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 8. CAREER LEARNING RECOMMENDATIONS
-- ============================================================

create table if not exists public.career_learning_recommendations (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  skill_id uuid
    references public.career_skills(id)
    on delete set null,

  title text not null,

  description text,

  resource_url text,

  priority text not null default 'normal'
    check (
      priority in (
        'low',
        'normal',
        'high',
        'urgent'
      )
    ),

  estimated_hours numeric(6,2),

  status text not null default 'recommended'
    check (
      status in (
        'recommended',
        'in_progress',
        'completed',
        'dismissed'
      )
    ),

  source text not null default 'system'
    check (
      source in (
        'system',
        'ai',
        'manual'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 9. INDEXES
-- ============================================================

create index if not exists career_profiles_student_idx
on public.career_profiles(student_id);

create index if not exists student_career_skills_student_idx
on public.student_career_skills(student_id);

create index if not exists student_career_skills_skill_idx
on public.student_career_skills(skill_id);

create index if not exists career_projects_student_idx
on public.career_projects(student_id);

create index if not exists career_project_skills_project_idx
on public.career_project_skills(project_id);

create index if not exists career_certifications_student_idx
on public.career_certifications(student_id);

create index if not exists career_goals_student_status_idx
on public.career_goals(student_id, status);

create index if not exists career_recommendations_student_status_idx
on public.career_learning_recommendations(student_id, status);

-- ============================================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists career_profiles_updated_at
on public.career_profiles;

create trigger career_profiles_updated_at
before update on public.career_profiles
for each row
execute function public.handle_updated_at();


drop trigger if exists student_career_skills_updated_at
on public.student_career_skills;

create trigger student_career_skills_updated_at
before update on public.student_career_skills
for each row
execute function public.handle_updated_at();


drop trigger if exists career_projects_updated_at
on public.career_projects;

create trigger career_projects_updated_at
before update on public.career_projects
for each row
execute function public.handle_updated_at();


drop trigger if exists career_certifications_updated_at
on public.career_certifications;

create trigger career_certifications_updated_at
before update on public.career_certifications
for each row
execute function public.handle_updated_at();


drop trigger if exists career_goals_updated_at
on public.career_goals;

create trigger career_goals_updated_at
before update on public.career_goals
for each row
execute function public.handle_updated_at();


drop trigger if exists career_recommendations_updated_at
on public.career_learning_recommendations;

create trigger career_recommendations_updated_at
before update on public.career_learning_recommendations
for each row
execute function public.handle_updated_at();

-- ============================================================
-- 11. ENABLE RLS
-- ============================================================

alter table public.career_profiles
enable row level security;

alter table public.career_skills
enable row level security;

alter table public.student_career_skills
enable row level security;

alter table public.career_projects
enable row level security;

alter table public.career_project_skills
enable row level security;

alter table public.career_certifications
enable row level security;

alter table public.career_goals
enable row level security;

alter table public.career_learning_recommendations
enable row level security;

-- ============================================================
-- 12. CAREER SKILLS MASTER READ POLICY
-- ============================================================

drop policy if exists "Authenticated users can read career skills"
on public.career_skills;

create policy "Authenticated users can read career skills"
on public.career_skills
for select
to authenticated
using (true);

-- ============================================================
-- 13. CAREER PROFILE POLICIES
-- ============================================================

drop policy if exists "Students can read own career profile"
on public.career_profiles;

create policy "Students can read own career profile"
on public.career_profiles
for select
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can create own career profile"
on public.career_profiles;

create policy "Students can create own career profile"
on public.career_profiles
for insert
to authenticated
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update own career profile"
on public.career_profiles;

create policy "Students can update own career profile"
on public.career_profiles
for update
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 14. STUDENT SKILL POLICIES
-- ============================================================

drop policy if exists "Students can read own career skills"
on public.student_career_skills;

create policy "Students can read own career skills"
on public.student_career_skills
for select
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can create own career skills"
on public.student_career_skills;

create policy "Students can create own career skills"
on public.student_career_skills
for insert
to authenticated
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update own career skills"
on public.student_career_skills;

create policy "Students can update own career skills"
on public.student_career_skills
for update
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can delete own career skills"
on public.student_career_skills;

create policy "Students can delete own career skills"
on public.student_career_skills
for delete
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 15. PROJECT POLICIES
-- ============================================================

drop policy if exists "Students can read own career projects"
on public.career_projects;

create policy "Students can read own career projects"
on public.career_projects
for select
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can create own career projects"
on public.career_projects;

create policy "Students can create own career projects"
on public.career_projects
for insert
to authenticated
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update own career projects"
on public.career_projects;

create policy "Students can update own career projects"
on public.career_projects
for update
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can delete own career projects"
on public.career_projects;

create policy "Students can delete own career projects"
on public.career_projects
for delete
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 16. PROJECT SKILL POLICIES
-- ============================================================

drop policy if exists "Students can manage own project skills"
on public.career_project_skills;

create policy "Students can manage own project skills"
on public.career_project_skills
for all
to authenticated
using (
  project_id in (
    select cp.id
    from public.career_projects cp
    join public.students s
      on s.id = cp.student_id
    where s.profile_id = (select auth.uid())
  )
)
with check (
  project_id in (
    select cp.id
    from public.career_projects cp
    join public.students s
      on s.id = cp.student_id
    where s.profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 17. CERTIFICATION POLICIES
-- ============================================================

drop policy if exists "Students can manage own certifications"
on public.career_certifications;

create policy "Students can manage own certifications"
on public.career_certifications
for all
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 18. CAREER GOAL POLICIES
-- ============================================================

drop policy if exists "Students can manage own career goals"
on public.career_goals;

create policy "Students can manage own career goals"
on public.career_goals
for all
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 19. RECOMMENDATION POLICIES
-- ============================================================

drop policy if exists "Students can read own career recommendations"
on public.career_learning_recommendations;

create policy "Students can read own career recommendations"
on public.career_learning_recommendations
for select
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

drop policy if exists "Students can update own career recommendations"
on public.career_learning_recommendations;

create policy "Students can update own career recommendations"
on public.career_learning_recommendations
for update
to authenticated
using (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
)
with check (
  student_id in (
    select id
    from public.students
    where profile_id = (select auth.uid())
  )
);

-- ============================================================
-- 20. SEED CORE SKILLS
-- ============================================================

insert into public.career_skills
  (name, category, description, is_technical)
values
  ('C Programming', 'Programming',
   'Programming fundamentals using C.', true),

  ('C++', 'Programming',
   'Object-oriented and competitive programming with C++.', true),

  ('Java', 'Programming',
   'Java programming, OOP and application development.', true),

  ('Python', 'Programming',
   'Python programming for software, automation and data work.', true),

  ('JavaScript', 'Web Development',
   'JavaScript programming for modern web applications.', true),

  ('TypeScript', 'Web Development',
   'Type-safe JavaScript development.', true),

  ('React', 'Web Development',
   'Component-based frontend development using React.', true),

  ('Next.js', 'Web Development',
   'Full-stack web application development using Next.js.', true),

  ('HTML', 'Web Development',
   'Semantic HTML and web page structure.', true),

  ('CSS', 'Web Development',
   'Modern responsive styling and layouts.', true),

  ('SQL', 'Database',
   'Relational database querying and data management.', true),

  ('PostgreSQL', 'Database',
   'PostgreSQL database design and development.', true),

  ('Supabase', 'Backend',
   'Backend development using Supabase.', true),

  ('Git', 'Developer Tools',
   'Version control using Git.', true),

  ('GitHub', 'Developer Tools',
   'Code collaboration and project hosting with GitHub.', true),

  ('Data Structures', 'Computer Science',
   'Core data structures and their applications.', true),

  ('Algorithms', 'Computer Science',
   'Algorithmic problem solving and complexity analysis.', true),

  ('Object-Oriented Programming', 'Computer Science',
   'Object-oriented software design principles.', true),

  ('Computer Networks', 'Computer Science',
   'Networking concepts and protocols.', true),

  ('Operating Systems', 'Computer Science',
   'Operating system concepts and resource management.', true),

  ('Database Management', 'Computer Science',
   'Database design, normalization and transactions.', true),

  ('Communication', 'Soft Skills',
   'Professional written and verbal communication.', false),

  ('Problem Solving', 'Soft Skills',
   'Structured problem solving and analytical thinking.', false),

  ('Teamwork', 'Soft Skills',
   'Collaborative work in technical teams.', false),

  ('Leadership', 'Soft Skills',
   'Leadership and team coordination.', false)

on conflict (name) do nothing;

-- ============================================================
-- 21. COMMENTS
-- ============================================================

comment on table public.career_profiles is
'Student career profile and professional identity.';

comment on table public.career_skills is
'Master catalogue of technical and soft skills.';

comment on table public.student_career_skills is
'Student-owned skill proficiency and evidence.';

comment on table public.career_projects is
'Student portfolio projects.';

comment on table public.career_certifications is
'Student certifications and credentials.';

comment on table public.career_goals is
'Student career goals and progress.';

comment on table public.career_learning_recommendations is
'Personalized career and skill learning recommendations.';