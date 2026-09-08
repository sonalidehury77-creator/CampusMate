-- ============================================================
-- CampusMate
-- Phase 7 — Student Onboarding Access
-- ============================================================

-- Allow an authenticated student to create only
-- their own student record.

drop policy if exists "students_insert_own"
on public.students;

create policy "students_insert_own"
on public.students
for insert
to authenticated
with check (
  (select auth.uid()) = profile_id
);