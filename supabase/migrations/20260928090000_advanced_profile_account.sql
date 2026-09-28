-- ============================================================
-- CampusMate Phase 26
-- Advanced Student Profile & Account
-- ============================================================

-- ============================================================
-- 1. PROFILE STORAGE PATH
-- ============================================================

alter table public.profiles
add column if not exists avatar_path text;

-- ============================================================
-- 2. PROFILE SETTINGS
-- ============================================================

create table if not exists public.profile_settings (
  profile_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  profile_visibility text not null default 'campus'
    check (
      profile_visibility in (
        'private',
        'campus',
        'public'
      )
    ),

  show_email boolean not null default false,
  show_phone boolean not null default false,
  allow_profile_search boolean not null default true,

  login_alerts boolean not null default true,
  security_alerts boolean not null default true,
  activity_alerts boolean not null default true,

  updated_at timestamptz not null default now()
);

alter table public.profile_settings enable row level security;

revoke all on table public.profile_settings from anon;

grant
  select,
  insert,
  update
on table public.profile_settings
to authenticated;

drop policy if exists
  "Users can view their own profile settings"
on public.profile_settings;

create policy
  "Users can view their own profile settings"
on public.profile_settings
for select
to authenticated
using (
  profile_id = (select auth.uid())
);

drop policy if exists
  "Users can create their own profile settings"
on public.profile_settings;

create policy
  "Users can create their own profile settings"
on public.profile_settings
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
);

drop policy if exists
  "Users can update their own profile settings"
on public.profile_settings;

create policy
  "Users can update their own profile settings"
on public.profile_settings
for update
to authenticated
using (
  profile_id = (select auth.uid())
)
with check (
  profile_id = (select auth.uid())
);

-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_profile_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  profile_settings_updated_at
on public.profile_settings;

create trigger
  profile_settings_updated_at
before update on public.profile_settings
for each row
execute function public.set_profile_settings_updated_at();

-- ============================================================
-- 4. AUTOMATIC DEFAULT SETTINGS
-- ============================================================

create or replace function public.create_default_profile_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile_settings(profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists
  create_default_profile_settings
on public.profiles;

create trigger
  create_default_profile_settings
after insert on public.profiles
for each row
execute function public.create_default_profile_settings();

-- ============================================================
-- 5. EXISTING USERS GET SETTINGS
-- ============================================================

insert into public.profile_settings(profile_id)
select id
from public.profiles
on conflict (profile_id) do nothing;

-- ============================================================
-- 6. AUDIT LOG ACCESS
-- ============================================================

alter table public.audit_logs enable row level security;

grant select on table public.audit_logs to authenticated;

drop policy if exists
  "Users can view their own audit activity"
on public.audit_logs;

create policy
  "Users can view their own audit activity"
on public.audit_logs
for select
to authenticated
using (
  profile_id = (select auth.uid())
);

-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
(
  'profile-images',
  'profile-images',
  false,
  2097152,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
),
(
  'student-documents',
  'student-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]
),
(
  'notice-attachments',
  'notice-attachments',
  false,
  20971520,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
),
(
  'resource-files',
  'resource-files',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- 8. PROFILE IMAGES
-- Folder structure:
-- profile-images/{user-id}/{filename}
-- ============================================================

drop policy if exists
  "Users can upload their own profile images"
on storage.objects;

create policy
  "Users can upload their own profile images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists
  "Users can view their own profile images"
on storage.objects;

create policy
  "Users can view their own profile images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-images'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists
  "Users can update their own profile images"
on storage.objects;

create policy
  "Users can update their own profile images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-images'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists
  "Users can delete their own profile images"
on storage.objects;

create policy
  "Users can delete their own profile images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and owner_id = (select auth.uid()::text)
);

-- ============================================================
-- 9. STUDENT DOCUMENTS
-- Folder structure:
-- student-documents/{user-id}/{filename}
-- ============================================================

drop policy if exists
  "Students can upload their own documents"
on storage.objects;

create policy
  "Students can upload their own documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'student-documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists
  "Students can view their own documents"
on storage.objects;

create policy
  "Students can view their own documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'student-documents'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists
  "Students can update their own documents"
on storage.objects;

create policy
  "Students can update their own documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'student-documents'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'student-documents'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists
  "Students can delete their own documents"
on storage.objects;

create policy
  "Students can delete their own documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'student-documents'
  and owner_id = (select auth.uid()::text)
);

-- ============================================================
-- 10. NOTICE ATTACHMENTS
-- Authenticated users can read.
-- Faculty/admin can upload.
-- Owner/admin can modify/delete.
-- ============================================================

drop policy if exists
  "Authenticated users can view notice attachments"
on storage.objects;

create policy
  "Authenticated users can view notice attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'notice-attachments'
);

drop policy if exists
  "Faculty and admins can upload notice attachments"
on storage.objects;

create policy
  "Faculty and admins can upload notice attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'notice-attachments'
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('faculty', 'admin')
  )
);

drop policy if exists
  "Owners and admins can update notice attachments"
on storage.objects;

create policy
  "Owners and admins can update notice attachments"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'notice-attachments'
  and (
    owner_id = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    )
  )
)
with check (
  bucket_id = 'notice-attachments'
);

drop policy if exists
  "Owners and admins can delete notice attachments"
on storage.objects;

create policy
  "Owners and admins can delete notice attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'notice-attachments'
  and (
    owner_id = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    )
  )
);

-- ============================================================
-- 11. RESOURCE FILES
-- Authenticated users can read.
-- Faculty/admin can upload.
-- Owner/admin can modify/delete.
-- ============================================================

drop policy if exists
  "Authenticated users can view resource files"
on storage.objects;

create policy
  "Authenticated users can view resource files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resource-files'
);

drop policy if exists
  "Faculty and admins can upload resource files"
on storage.objects;

create policy
  "Faculty and admins can upload resource files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resource-files'
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('faculty', 'admin')
  )
);

drop policy if exists
  "Owners and admins can update resource files"
on storage.objects;

create policy
  "Owners and admins can update resource files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resource-files'
  and (
    owner_id = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    )
  )
)
with check (
  bucket_id = 'resource-files'
);

drop policy if exists
  "Owners and admins can delete resource files"
on storage.objects;

create policy
  "Owners and admins can delete resource files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resource-files'
  and (
    owner_id = (select auth.uid()::text)
    or exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    )
  )
);