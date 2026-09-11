-- ============================================================
-- CampusMate
-- Phase 11 Temporary Assignment Test Data
--
-- Student:
-- Sonali Dehury
-- Email:
-- sonalidehury77@gmail.com
--
-- IMPORTANT:
-- This is temporary test data.
--
-- It does NOT modify the canonical 901 schema.
-- It does NOT create fake Auth users.
-- It does NOT create fake faculty profiles.
-- faculty_id remains NULL.
-- ============================================================


-- ============================================================
-- 1. DISCRETE MATHEMATICS ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'Group Theory Proof Practice',
    'Prove the required group-theory results including centralizer, center of a group, subgroup tests and cyclic-group examples.',
    timestamptz '2026-09-08 17:00:00+05:30',
    'high'
  ),

  (
    'U(8) and Cyclic Groups',
    'Determine whether U(8) is cyclic and identify its generators if applicable.',
    timestamptz '2026-09-16 23:59:00+05:30',
    'medium'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-501'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 2. JAVA PROGRAMMING ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'Java OOP Implementation',
    'Implement a Java program demonstrating class, object, constructor, encapsulation, inheritance and method overriding.',
    timestamptz '2026-09-12 23:59:00+05:30',
    'urgent'
  ),

  (
    'Exception Handling and Collections',
    'Create a Java application using try-catch-finally, custom exceptions and ArrayList/HashMap.',
    timestamptz '2026-09-20 23:59:00+05:30',
    'high'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-502'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 3. COMPUTER GRAPHICS ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'DDA and Bresenham Line Algorithms',
    'Implement DDA and Bresenham line drawing algorithms and compare their working with suitable test cases.',
    timestamptz '2026-09-15 18:00:00+05:30',
    'high'
  ),

  (
    '2D Transformation Practical',
    'Implement translation, rotation and scaling transformations for a triangle using matrix operations.',
    timestamptz '2026-09-25 23:59:00+05:30',
    'medium'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-503'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 4. ARTIFICIAL INTELLIGENCE ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'Best-First Search Analysis',
    'Explain and implement the Best-First Search algorithm with a suitable example and heuristic function.',
    timestamptz '2026-09-18 23:59:00+05:30',
    'high'
  ),

  (
    'AO* Algorithm Problem',
    'Solve an AND-OR graph using the AO* algorithm and explain each step of the solution.',
    timestamptz '2026-10-02 23:59:00+05:30',
    'medium'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-504'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 5. COMPUTER NETWORKS ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'IPv4 Subnetting Practice',
    'Solve IPv4 subnetting problems and calculate network address, broadcast address and usable host range.',
    timestamptz '2026-09-22 23:59:00+05:30',
    'medium'
  ),

  (
    'OSI and TCP/IP Model Comparison',
    'Prepare a structured comparison of the OSI reference model and TCP/IP protocol suite.',
    timestamptz '2026-09-30 23:59:00+05:30',
    'low'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-505'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 6. SOFTWARE ENGINEERING ASSIGNMENTS
-- ============================================================

insert into public.assignments (
  subject_id,
  faculty_id,
  title,
  description,
  due_date,
  priority,
  attachment_url
)
select
  sub.id,
  null,
  assignment_data.title,
  assignment_data.description,
  assignment_data.due_date,
  assignment_data.priority,
  null
from public.subjects sub
cross join (
  values

  (
    'SDLC and Process Models',
    'Compare waterfall, iterative, spiral and agile software development models with suitable use cases.',
    timestamptz '2026-09-19 23:59:00+05:30',
    'medium'
  ),

  (
    'Software Requirements Specification',
    'Prepare a mini SRS document for a student-focused digital platform.',
    timestamptz '2026-10-05 23:59:00+05:30',
    'urgent'
  )
) as assignment_data (
  title,
  description,
  due_date,
  priority
)
where sub.code = 'DCS-506'
and not exists (
  select 1
  from public.assignments existing
  where existing.subject_id = sub.id
    and existing.title =
      assignment_data.title
);


-- ============================================================
-- 7. INITIAL STUDENT STATUS DATA
--
-- We create statuses for the real test student only.
-- ============================================================

insert into public.assignment_status (
  assignment_id,
  student_id,
  status,
  completed_at,
  notes
)
select
  assignment.id,
  student.id,
  status_data.status,
  status_data.completed_at,
  status_data.notes
from public.assignments assignment

join public.subjects subject
  on subject.id =
    assignment.subject_id

join public.student_subjects enrollment
  on enrollment.subject_id =
    subject.id

join public.students student
  on student.id =
    enrollment.student_id

join public.profiles profile
  on profile.id =
    student.profile_id

join (
  values

  (
    'Group Theory Proof Practice',
    'completed',
    timestamptz '2026-09-07 18:30:00+05:30',
    'Completed the proof and revised the centralizer and center concepts.'
  ),

  (
    'U(8) and Cyclic Groups',
    'pending',
    null,
    'Need to verify generators and write the final proof.'
  ),

  (
    'Java OOP Implementation',
    'in_progress',
    null,
    'Constructor and inheritance part completed. Need to finish overriding.'
  ),

  (
    'Exception Handling and Collections',
    'pending',
    null,
    'Start after completing the OOP practical.'
  ),

  (
    'DDA and Bresenham Line Algorithms',
    'completed',
    timestamptz '2026-09-10 20:00:00+05:30',
    'Both algorithms implemented and tested.'
  ),

  (
    '2D Transformation Practical',
    'in_progress',
    null,
    'Rotation matrix completed. Translation and scaling remain.'
  ),

  (
    'Best-First Search Analysis',
    'pending',
    null,
    'Need to prepare the heuristic-search example.'
  ),

  (
    'AO* Algorithm Problem',
    'pending',
    null,
    null
  ),

  (
    'IPv4 Subnetting Practice',
    'in_progress',
    null,
    'Solved the first five subnetting problems.'
  ),

  (
    'OSI and TCP/IP Model Comparison',
    'completed',
    timestamptz '2026-09-09 16:00:00+05:30',
    'Comparison table prepared and revised.'
  ),

  (
    'SDLC and Process Models',
    'pending',
    null,
    null
  ),

  (
    'Software Requirements Specification',
    'pending',
    null,
    'Need to start use-case and functional requirement sections.'
  )

) as status_data (
  title,
  status,
  completed_at,
  notes
)
  on status_data.title =
     assignment.title

where lower(profile.email) =
      lower('sonalidehury77@gmail.com')

and not exists (
  select 1
  from public.assignment_status existing
  where existing.assignment_id =
        assignment.id
    and existing.student_id =
        student.id
);


-- ============================================================
-- 8. VERIFICATION
-- ============================================================

do $$
declare
  assignment_count integer;
  status_count integer;
  student_count integer;
begin

  select count(*)
  into student_count
  from public.students student
  join public.profiles profile
    on profile.id =
       student.profile_id
  where lower(profile.email) =
        lower('sonalidehury77@gmail.com');

  select count(*)
  into assignment_count
  from public.assignments assignment
  join public.subjects subject
    on subject.id =
       assignment.subject_id
  where subject.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  );

  select count(*)
  into status_count
  from public.assignment_status status
  join public.students student
    on student.id =
       status.student_id
  join public.profiles profile
    on profile.id =
       student.profile_id
  where lower(profile.email) =
        lower('sonalidehury77@gmail.com');

  if student_count <> 1 then
    raise exception
      'TEST DATA ERROR: Sonali student record not found.';
  end if;

  if assignment_count <> 12 then
    raise exception
      'TEST DATA ERROR: Expected 12 assignments but found %.',
      assignment_count;
  end if;

  if status_count <> 12 then
    raise exception
      'TEST DATA ERROR: Expected 12 assignment statuses but found %.',
      status_count;
  end if;

  raise notice
    'CampusMate Phase 11 assignment test data created successfully.';

end $$;


-- ============================================================
-- END OF TEMPORARY ASSIGNMENT TEST DATA
-- ============================================================