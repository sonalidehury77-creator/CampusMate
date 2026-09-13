-- ============================================================
-- CampusMate
-- Phase 13 - Resources Storage
-- ============================================================

-- ============================================================
-- 1. CREATE PRIVATE RESOURCES STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)

select
  'resources',
  'resources',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]::text[]

where not exists (
  select 1
  from storage.buckets
  where id = 'resources'
);


-- ============================================================
-- 2. STORAGE SELECT POLICY
--
-- Students can access:
--   - public resources
--   - student-visible resources
--   - their own resources
--
-- Faculty/admin can access all resources.
-- ============================================================

drop policy if exists "resources_storage_authenticated_read"
on storage.objects;

create policy "resources_storage_authenticated_read"

on storage.objects

for select

to authenticated

using (

  bucket_id = 'resources'

  and (

    owner_id = (select auth.uid()::text)

    or public.is_admin()

    or public.is_faculty()

    or exists (
      select 1
      from public.resources r
      where r.storage_path = storage.objects.name
        and r.visibility in (
          'public',
          'students'
        )
    )

  )

);


-- ============================================================
-- 3. STORAGE INSERT POLICY
--
-- Files must be uploaded inside:
--
--   <authenticated-user-id>/filename
--
-- ============================================================

drop policy if exists "resources_storage_authenticated_insert"
on storage.objects;

create policy "resources_storage_authenticated_insert"

on storage.objects

for insert

to authenticated

with check (

  bucket_id = 'resources'

  and (
    (storage.foldername(name))[1]
    = (select auth.uid()::text)
  )

);


-- ============================================================
-- 4. STORAGE UPDATE POLICY
-- ============================================================

drop policy if exists "resources_storage_owner_update"
on storage.objects;

create policy "resources_storage_owner_update"

on storage.objects

for update

to authenticated

using (

  bucket_id = 'resources'

  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
    or public.is_faculty()
  )

)

with check (

  bucket_id = 'resources'

  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
    or public.is_faculty()
  )

);


-- ============================================================
-- 5. STORAGE DELETE POLICY
-- ============================================================

drop policy if exists "resources_storage_owner_delete"
on storage.objects;

create policy "resources_storage_owner_delete"

on storage.objects

for delete

to authenticated

using (

  bucket_id = 'resources'

  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
    or public.is_faculty()
  )

);


-- ============================================================
-- 6. PERFORMANCE INDEX
-- ============================================================

create index if not exists idx_resources_storage_path

on public.resources(storage_path);
