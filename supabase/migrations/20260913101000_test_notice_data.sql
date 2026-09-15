-- ============================================================
-- CampusMate
-- Phase 14 Test Notice Data
-- ============================================================

insert into public.notices (
  created_by,
  title,
  description,
  category,
  priority,
  published_at,
  deadline,
  source,
  status
)
select
  p.id,
  'Semester Examination Form Submission',
  'Students are advised to complete the semester examination form submission before the deadline.',
  'examination',
  'urgent',
  now() - interval '2 days',
  now() + interval '3 days',
  'Test University Notice',
  'published'
from public.profiles p
where p.email = 'sonalidehury77@gmail.com'
  and not exists (
    select 1
    from public.notices n
    where n.title =
      'Semester Examination Form Submission'
  )
limit 1;


insert into public.notices (
  created_by,
  title,
  description,
  category,
  priority,
  published_at,
  deadline,
  source,
  status
)
select
  p.id,
  'Central Sector Scholarship Application',
  'Students eligible for the scholarship should review the official scholarship requirements and complete the application within the prescribed period.',
  'scholarship',
  'important',
  now() - interval '1 day',
  now() + interval '10 days',
  'Scholarship Cell',
  'published'
from public.profiles p
where p.email = 'sonalidehury77@gmail.com'
  and not exists (
    select 1
    from public.notices n
    where n.title =
      'Central Sector Scholarship Application'
  )
limit 1;


insert into public.notices (
  created_by,
  title,
  description,
  category,
  priority,
  published_at,
  deadline,
  source,
  status
)
select
  p.id,
  'Department Academic Notice',
  'A general academic notice for testing CampusMate notice search, filtering and notification functionality.',
  'academic',
  'normal',
  now(),
  null,
  'Department',
  'published'
from public.profiles p
where p.email = 'sonalidehury77@gmail.com'
  and not exists (
    select 1
    from public.notices n
    where n.title =
      'Department Academic Notice'
  )
limit 1;