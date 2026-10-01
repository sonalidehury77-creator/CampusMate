-- ============================================================
-- CAMPUSMATE
-- PHASE 28
-- ASSIGNMENT SUBMISSION & GRADING SYSTEM
-- ============================================================

-- ============================================================
-- 1. INDEXES
-- ============================================================

create index if not exists
assignment_submissions_assignment_student_idx
on public.assignment_submissions (
  assignment_id,
  student_id
);

create index if not exists
assignment_submissions_submitted_at_idx
on public.assignment_submissions (
  submitted_at desc
);


-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.assignment_submissions
enable row level security;


-- ============================================================
-- 3. REMOVE OLD SUBMISSION POLICIES
-- ============================================================

drop policy if exists
"assignment_submissions_student_select_own"
on public.assignment_submissions;

drop policy if exists
"assignment_submissions_student_insert_own"
on public.assignment_submissions;

drop policy if exists
"assignment_submissions_student_update_own"
on public.assignment_submissions;

drop policy if exists
"assignment_submissions_faculty_select"
on public.assignment_submissions;

drop policy if exists
"assignment_submissions_faculty_update"
on public.assignment_submissions;

drop policy if exists
"assignment_submissions_faculty_delete"
on public.assignment_submissions;


-- ============================================================
-- 4. STUDENT - VIEW OWN SUBMISSIONS
-- ============================================================

create policy
"assignment_submissions_student_select_own"
on public.assignment_submissions
for select
to authenticated
using (
  student_id = public.current_student_id()
);


-- ============================================================
-- 5. FACULTY / ADMIN - VIEW SUBMISSIONS
-- ============================================================

create policy
"assignment_submissions_faculty_select"
on public.assignment_submissions
for select
to authenticated
using (
  public.is_admin()
  or (
    public.is_faculty()
    and exists (
      select 1
      from public.assignments a
      where a.id =
        public.assignment_submissions.assignment_id
      and a.faculty_id =
        public.current_faculty_id()
    )
  )
);


-- ============================================================
-- 6. STUDENT - CREATE OWN SUBMISSION
-- ============================================================

create policy
"assignment_submissions_student_insert_own"
on public.assignment_submissions
for insert
to authenticated
with check (
  student_id = public.current_student_id()

  and exists (
    select 1
    from public.assignments a

    join public.student_subjects ss
      on ss.subject_id = a.subject_id

    where a.id =
      public.assignment_submissions.assignment_id

    and ss.student_id =
      public.current_student_id()
  )
);


-- ============================================================
-- 7. FACULTY / ADMIN - UPDATE SUBMISSION
-- ============================================================

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
      where a.id =
        public.assignment_submissions.assignment_id

      and a.faculty_id =
        public.current_faculty_id()
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
      where a.id =
        public.assignment_submissions.assignment_id

      and a.faculty_id =
        public.current_faculty_id()
    )
  )
);


-- ============================================================
-- 8. FACULTY / ADMIN - DELETE SUBMISSION
-- ============================================================

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
      where a.id =
        public.assignment_submissions.assignment_id

      and a.faculty_id =
        public.current_faculty_id()
    )
  )
);


-- ============================================================
-- 9. PRIVATE STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'assignment-files',
  'assignment-files',
  false,
  26214400,

  array[
    'application/pdf',

    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    'image/jpeg',
    'image/png',
    'image/webp',

    'text/plain',

    'application/zip'
  ]
)

on conflict (id)
do update
set
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = excluded.allowed_mime_types;


-- ============================================================
-- 10. REMOVE OLD STORAGE POLICIES
-- ============================================================

drop policy if exists
"Faculty can upload assignment files"
on storage.objects;

drop policy if exists
"Faculty can view assignment files"
on storage.objects;

drop policy if exists
"Students can view assignment files"
on storage.objects;

drop policy if exists
"Faculty can update assignment files"
on storage.objects;

drop policy if exists
"Faculty can delete assignment files"
on storage.objects;

drop policy if exists
"Students can upload submission files"
on storage.objects;

drop policy if exists
"Students can view submission files"
on storage.objects;

drop policy if exists
"Faculty can view submission files"
on storage.objects;

drop policy if exists
"Students can delete submission files"
on storage.objects;

drop policy if exists
"Faculty can delete submission files"
on storage.objects;


-- ============================================================
-- 11. FACULTY - UPLOAD ASSIGNMENT FILE
-- Path:
-- assignments/{faculty-user-id}/{assignment-id}/{file}
-- ============================================================

create policy
"Faculty can upload assignment files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'assignments'

  and (storage.foldername(name))[2] =
      auth.uid()::text

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);


-- ============================================================
-- 12. FACULTY - READ ASSIGNMENT FILE
-- ============================================================

create policy
"Faculty can view assignment files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'assignments'

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);


-- ============================================================
-- 13. STUDENT - READ ASSIGNMENT FILE
-- ============================================================

create policy
"Students can view assignment files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'assignments'

  and exists (
    select 1
    from public.assignments a
    join public.students s
      on s.profile_id = auth.uid()
    join public.student_subjects ss
      on ss.student_id = s.id
     and ss.subject_id = a.subject_id

    where a.id =
      ((storage.foldername(name))[3])::uuid
  )
);


-- ============================================================
-- 14. FACULTY - UPDATE ASSIGNMENT FILE
-- ============================================================

create policy
"Faculty can update assignment files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'assignments'

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);


-- ============================================================
-- 15. FACULTY - DELETE ASSIGNMENT FILE
-- ============================================================

create policy
"Faculty can delete assignment files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'assignments'

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);


-- ============================================================
-- 16. STUDENT - UPLOAD SUBMISSION FILE
-- Path:
-- submissions/{student-user-id}/{assignment-id}/{file}
-- ============================================================

create policy
"Students can upload submission files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'submissions'

  and (storage.foldername(name))[2] =
      auth.uid()::text

  and exists (
    select 1
    from public.assignments a
    join public.students s
      on s.profile_id = auth.uid()
    join public.student_subjects ss
      on ss.student_id = s.id
     and ss.subject_id = a.subject_id

    where a.id =
      ((storage.foldername(name))[3])::uuid
  )
);


-- ============================================================
-- 17. STUDENT - READ OWN SUBMISSION FILE
-- ============================================================

create policy
"Students can view submission files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'submissions'

  and (storage.foldername(name))[2] =
      auth.uid()::text
);


-- ============================================================
-- 18. FACULTY - READ SUBMISSION FILE
-- ============================================================

create policy
"Faculty can view submission files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'submissions'

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);


-- ============================================================
-- 19. STUDENT - DELETE OWN SUBMISSION FILE
-- ============================================================

create policy
"Students can delete submission files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'submissions'

  and (storage.foldername(name))[2] =
      auth.uid()::text
);


-- ============================================================
-- 20. FACULTY - DELETE SUBMISSION FILE
-- ============================================================

create policy
"Faculty can delete submission files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'assignment-files'

  and (storage.foldername(name))[1] =
      'submissions'

  and exists (
    select 1
    from public.assignments a
    join public.faculty f
      on f.id = a.faculty_id
    where a.id =
      ((storage.foldername(name))[3])::uuid
    and f.profile_id =
      auth.uid()
  )
);