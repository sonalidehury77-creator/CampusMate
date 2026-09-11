-- ============================================================
-- CampusMate
-- Temporary Test Data
-- Phase 9: Academic Management
-- Phase 10: Smart Timetable
--
-- IMPORTANT:
-- This migration is temporary test data only.
--
-- It uses the real authenticated student profile:
-- Sonali Dehury
-- Email: sonalidehury77@gmail.com
--
-- It intentionally does NOT create fake faculty profiles
-- because public.profiles.id must reference auth.users(id).
--
-- Faculty IDs in timetable entries are therefore NULL.
-- This safely tests all timetable functionality without
-- creating fake Supabase Auth users.
-- ============================================================


-- ============================================================
-- 1. TEST DEPARTMENT
-- ============================================================

insert into public.departments (
  name,
  code,
  description
)
select
  'Computer Science and Information Technology',
  'DCS-TEST',
  'Temporary Computer Science department for CampusMate testing.'
where not exists (
  select 1
  from public.departments
  where code = 'DCS-TEST'
);


-- ============================================================
-- 2. TEST PROGRAM
-- ============================================================

insert into public.programs (
  department_id,
  name,
  code,
  duration
)
select
  d.id,
  'B.Sc. Computer Science',
  'BSC-CS-TEST',
  3
from public.departments d
where d.code = 'DCS-TEST'
and not exists (
  select 1
  from public.programs p
  where p.code = 'BSC-CS-TEST'
);


-- ============================================================
-- 3. TEST SEMESTER
-- ============================================================

insert into public.semesters (
  program_id,
  semester_number,
  academic_year
)
select
  p.id,
  5,
  '2026-27'
from public.programs p
where p.code = 'BSC-CS-TEST'
and not exists (
  select 1
  from public.semesters s
  where s.program_id = p.id
    and s.semester_number = 5
    and s.academic_year = '2026-27'
);


-- ============================================================
-- 4. TEST SUBJECTS
-- ============================================================

insert into public.subjects (
  department_id,
  semester_id,
  code,
  name,
  description,
  credits
)
select
  d.id,
  s.id,
  subject_data.code,
  subject_data.name,
  subject_data.description,
  subject_data.credits
from public.departments d
join public.semesters s
  on s.semester_number = 5
join public.programs p
  on p.id = s.program_id
  and p.code = 'BSC-CS-TEST'
cross join (
  values
    (
      'DCS-501',
      'Discrete Mathematics',
      'Relations, functions, algebraic structures, groups, subgroups and related mathematical concepts.',
      4.00
    ),
    (
      'DCS-502',
      'Java Programming',
      'Object-oriented programming, classes, inheritance, interfaces, exceptions, collections and Java applications.',
      4.00
    ),
    (
      'DCS-503',
      'Computer Graphics',
      'Line drawing algorithms, circle generation, transformations, clipping and graphics programming.',
      4.00
    ),
    (
      'DCS-504',
      'Artificial Intelligence',
      'Search algorithms, knowledge representation, heuristic search and intelligent problem solving.',
      4.00
    ),
    (
      'DCS-505',
      'Computer Networks',
      'Network models, protocols, addressing, routing, transport and application layer concepts.',
      4.00
    ),
    (
      'DCS-506',
      'Software Engineering',
      'Software development life cycle, requirements, design, testing, maintenance and project management.',
      4.00
    )
) as subject_data (
  code,
  name,
  description,
  credits
)
where d.code = 'DCS-TEST'
and not exists (
  select 1
  from public.subjects existing
  where existing.semester_id = s.id
    and existing.code = subject_data.code
);


-- ============================================================
-- 5. CREATE / UPDATE TEST STUDENT
-- ============================================================

insert into public.students (
  profile_id,
  student_number,
  program_id,
  semester_id,
  enrollment_year,
  current_semester
)
select
  p.id,
  'TEST-DCS-001',
  program.id,
  semester.id,
  2024,
  5
from public.profiles p
join public.programs program
  on program.code = 'BSC-CS-TEST'
join public.semesters semester
  on semester.program_id = program.id
  and semester.semester_number = 5
  and semester.academic_year = '2026-27'
where lower(p.email) = lower('sonalidehury77@gmail.com')
and not exists (
  select 1
  from public.students existing
  where existing.profile_id = p.id
);


-- ============================================================
-- 6. ENSURE TEST STUDENT DETAILS ARE CORRECT
-- ============================================================

update public.students st
set
  student_number = 'TEST-DCS-001',
  program_id = program.id,
  semester_id = semester.id,
  enrollment_year = 2024,
  current_semester = 5
from public.profiles p
join public.programs program
  on program.code = 'BSC-CS-TEST'
join public.semesters semester
  on semester.program_id = program.id
  and semester.semester_number = 5
  and semester.academic_year = '2026-27'
where st.profile_id = p.id
  and lower(p.email) = lower('sonalidehury77@gmail.com');


-- ============================================================
-- 7. ENROLL STUDENT IN ALL TEST SUBJECTS
-- ============================================================

insert into public.student_subjects (
  student_id,
  subject_id,
  academic_year
)
select
  st.id,
  sub.id,
  '2026-27'
from public.students st
join public.profiles p
  on p.id = st.profile_id
join public.subjects sub
  on sub.semester_id = st.semester_id
where lower(p.email) = lower('sonalidehury77@gmail.com')
and sub.code in (
  'DCS-501',
  'DCS-502',
  'DCS-503',
  'DCS-504',
  'DCS-505',
  'DCS-506'
)
and not exists (
  select 1
  from public.student_subjects existing
  where existing.student_id = st.id
    and existing.subject_id = sub.id
    and existing.academic_year = '2026-27'
);


-- ============================================================
-- 8. SYLLABUS UNITS
-- ============================================================

insert into public.syllabus_units (
  subject_id,
  unit_number,
  title,
  description
)
select
  sub.id,
  unit_data.unit_number,
  unit_data.title,
  unit_data.description
from public.subjects sub
cross join (
  values
    (1, 'Unit I - Foundations', 'Fundamental concepts and introductory topics.'),
    (2, 'Unit II - Core Concepts', 'Important core concepts and theoretical foundations.'),
    (3, 'Unit III - Advanced Concepts', 'Advanced concepts, algorithms and applications.'),
    (4, 'Unit IV - Applications and Practice', 'Practical applications, problem solving and revision.')
) as unit_data (
  unit_number,
  title,
  description
)
where sub.code in (
  'DCS-501',
  'DCS-502',
  'DCS-503',
  'DCS-504',
  'DCS-505',
  'DCS-506'
)
and not exists (
  select 1
  from public.syllabus_units existing
  where existing.subject_id = sub.id
    and existing.unit_number = unit_data.unit_number
);


-- ============================================================
-- 9. SYLLABUS TOPICS
-- ============================================================

insert into public.syllabus_topics (
  unit_id,
  title,
  description,
  sequence_number
)
select
  unit.id,
  topic_data.title,
  topic_data.description,
  topic_data.sequence_number
from public.syllabus_units unit
join public.subjects sub
  on sub.id = unit.subject_id
cross join (
  values
    (
      1,
      'Introduction and Basic Concepts',
      'Introduction to the unit and fundamental terminology.',
      1
    ),
    (
      1,
      'Important Definitions',
      'Important definitions and concepts for university examinations.',
      2
    ),
    (
      2,
      'Core Theory',
      'Core theoretical concepts and principles.',
      1
    ),
    (
      2,
      'Worked Examples',
      'Examples and practice problems based on the theory.',
      2
    ),
    (
      3,
      'Advanced Concepts',
      'Advanced concepts and problem-solving techniques.',
      1
    ),
    (
      3,
      'Algorithms and Applications',
      'Algorithms, applications and practical examples.',
      2
    ),
    (
      4,
      'Practical Applications',
      'Practical implementation and real-world applications.',
      1
    ),
    (
      4,
      'Revision and Important Questions',
      'Revision points and examination-oriented questions.',
      2
    )
) as topic_data (
  unit_number,
  title,
  description,
  sequence_number
)
where sub.code in (
  'DCS-501',
  'DCS-502',
  'DCS-503',
  'DCS-504',
  'DCS-505',
  'DCS-506'
)
and unit.unit_number = topic_data.unit_number
and not exists (
  select 1
  from public.syllabus_topics existing
  where existing.unit_id = unit.id
    and existing.sequence_number = topic_data.sequence_number
);


-- ============================================================
-- 10. SUBJECT PROGRESS
-- ============================================================

insert into public.student_subject_progress (
  student_id,
  subject_id,
  progress_percentage
)
select
  st.id,
  sub.id,
  progress_data.progress_percentage
from public.students st
join public.profiles p
  on p.id = st.profile_id
join public.subjects sub
  on sub.semester_id = st.semester_id
join (
  values
    ('DCS-501', 72.00),
    ('DCS-502', 84.00),
    ('DCS-503', 91.00),
    ('DCS-504', 58.00),
    ('DCS-505', 76.00),
    ('DCS-506', 67.00)
) as progress_data (
  subject_code,
  progress_percentage
)
  on progress_data.subject_code = sub.code
where lower(p.email) = lower('sonalidehury77@gmail.com')
and not exists (
  select 1
  from public.student_subject_progress existing
  where existing.student_id = st.id
    and existing.subject_id = sub.id
);


-- ============================================================
-- 11. UNIT PROGRESS
-- ============================================================

insert into public.unit_progress (
  student_id,
  subject_id,
  unit_number,
  progress_percentage,
  completed
)
select
  st.id,
  sub.id,
  progress_data.unit_number,
  progress_data.progress_percentage,
  progress_data.completed
from public.students st
join public.profiles p
  on p.id = st.profile_id
join public.subjects sub
  on sub.semester_id = st.semester_id
join (
  values
    ('DCS-501', 1, 90.00, true),
    ('DCS-501', 2, 80.00, true),
    ('DCS-501', 3, 65.00, false),
    ('DCS-501', 4, 50.00, false),

    ('DCS-502', 1, 95.00, true),
    ('DCS-502', 2, 75.00, true),
    ('DCS-502', 3, 55.00, false),
    ('DCS-502', 4, 45.00, false),

    ('DCS-503', 1, 100.00, true),
    ('DCS-503', 2, 90.00, true),
    ('DCS-503', 3, 80.00, true),
    ('DCS-503', 4, 55.00, false),

    ('DCS-504', 1, 80.00, true),
    ('DCS-504', 2, 60.00, false),
    ('DCS-504', 3, 40.00, false),
    ('DCS-504', 4, 30.00, false),

    ('DCS-505', 1, 75.00, true),
    ('DCS-505', 2, 70.00, true),
    ('DCS-505', 3, 55.00, false),
    ('DCS-505', 4, 45.00, false),

    ('DCS-506', 1, 90.00, true),
    ('DCS-506', 2, 80.00, true),
    ('DCS-506', 3, 70.00, true),
    ('DCS-506', 4, 60.00, false)
) as progress_data (
  subject_code,
  unit_number,
  progress_percentage,
  completed
)
  on progress_data.subject_code = sub.code
where lower(p.email) = lower('sonalidehury77@gmail.com')
and not exists (
  select 1
  from public.unit_progress existing
  where existing.student_id = st.id
    and existing.subject_id = sub.id
    and existing.unit_number = progress_data.unit_number
);


-- ============================================================
-- 12. TIMETABLE ENTRIES
--
-- faculty_id is intentionally NULL.
--
-- This safely tests:
-- lecture
-- laboratory
-- tutorial
-- seminar
-- other
-- rooms
-- different durations
-- multiple classes per day
-- free periods
-- current / next class detection
-- weekly schedule
-- ============================================================


-- MONDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  1,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-501',
      time '09:00',
      time '10:00',
      'Room 204',
      'lecture'
    ),
    (
      'DCS-502',
      time '11:00',
      time '12:00',
      'Lab 2',
      'laboratory'
    ),
    (
      'DCS-503',
      time '14:00',
      time '15:00',
      'Room 105',
      'tutorial'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 1
    and existing.start_time = timetable_data.start_time
);


-- TUESDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  2,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-504',
      time '09:30',
      time '10:30',
      'Room 301',
      'lecture'
    ),
    (
      'DCS-505',
      time '11:30',
      time '13:00',
      'Lab 1',
      'laboratory'
    ),
    (
      'DCS-506',
      time '15:00',
      time '16:00',
      'Room 206',
      'seminar'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 2
    and existing.start_time = timetable_data.start_time
);


-- WEDNESDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  3,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-503',
      time '08:30',
      time '09:30',
      'Room 101',
      'lecture'
    ),
    (
      'DCS-501',
      time '10:30',
      time '11:30',
      'Room 204',
      'tutorial'
    ),
    (
      'DCS-504',
      time '13:30',
      time '15:00',
      'AI Lab',
      'laboratory'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 3
    and existing.start_time = timetable_data.start_time
);


-- THURSDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  4,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-502',
      time '09:00',
      time '10:30',
      'Java Lab',
      'laboratory'
    ),
    (
      'DCS-505',
      time '11:30',
      time '12:30',
      'Room 302',
      'lecture'
    ),
    (
      'DCS-506',
      time '14:00',
      time '15:00',
      'Room 207',
      'tutorial'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 4
    and existing.start_time = timetable_data.start_time
);


-- FRIDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  5,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-504',
      time '09:00',
      time '10:00',
      'Room 303',
      'lecture'
    ),
    (
      'DCS-503',
      time '11:00',
      time '12:00',
      'Graphics Lab',
      'laboratory'
    ),
    (
      'DCS-501',
      time '14:30',
      time '15:30',
      'Room 204',
      'seminar'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 5
    and existing.start_time = timetable_data.start_time
);


-- SATURDAY
insert into public.timetable_entries (
  subject_id,
  faculty_id,
  semester_id,
  day_of_week,
  start_time,
  end_time,
  room,
  schedule_type
)
select
  sub.id,
  null,
  sub.semester_id,
  6,
  timetable_data.start_time,
  timetable_data.end_time,
  timetable_data.room,
  timetable_data.schedule_type
from public.subjects sub
cross join (
  values
    (
      'DCS-506',
      time '09:00',
      time '10:00',
      'Room 205',
      'lecture'
    ),
    (
      'DCS-502',
      time '11:00',
      time '12:00',
      'Room 208',
      'other'
    )
) as timetable_data (
  subject_code,
  start_time,
  end_time,
  room,
  schedule_type
)
where sub.code = timetable_data.subject_code
and not exists (
  select 1
  from public.timetable_entries existing
  where existing.subject_id = sub.id
    and existing.semester_id = sub.semester_id
    and existing.day_of_week = 6
    and existing.start_time = timetable_data.start_time
);


-- ============================================================
-- 13. VERIFICATION
-- ============================================================

do $$
declare
  student_count integer;
  subject_count integer;
  syllabus_unit_count integer;
  timetable_count integer;
begin

  select count(*)
  into student_count
  from public.students st
  join public.profiles p
    on p.id = st.profile_id
  where lower(p.email) = lower('sonalidehury77@gmail.com')
    and st.student_number = 'TEST-DCS-001';

  select count(*)
  into subject_count
  from public.subjects sub
  join public.semesters s
    on s.id = sub.semester_id
  join public.programs pr
    on pr.id = s.program_id
  where pr.code = 'BSC-CS-TEST'
    and s.semester_number = 5
    and s.academic_year = '2026-27';

  select count(*)
  into syllabus_unit_count
  from public.syllabus_units unit
  join public.subjects sub
    on sub.id = unit.subject_id
  where sub.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  );

  select count(*)
  into timetable_count
  from public.timetable_entries te
  join public.semesters s
    on s.id = te.semester_id
  join public.programs pr
    on pr.id = s.program_id
  where pr.code = 'BSC-CS-TEST'
    and s.semester_number = 5
    and s.academic_year = '2026-27';

  if student_count <> 1 then
    raise exception
      'TEST DATA ERROR: Sonali student record was not found correctly.';
  end if;

  if subject_count <> 6 then
    raise exception
      'TEST DATA ERROR: Expected 6 test subjects but found %.',
      subject_count;
  end if;

  if syllabus_unit_count <> 24 then
    raise exception
      'TEST DATA ERROR: Expected 24 syllabus units but found %.',
      syllabus_unit_count;
  end if;

  if timetable_count <> 17 then
    raise exception
      'TEST DATA ERROR: Expected 17 timetable entries but found %.',
      timetable_count;
  end if;

  raise notice
    'CampusMate temporary academic and timetable test data created successfully.';

end $$;


-- ============================================================
-- END OF TEMPORARY TEST DATA
-- ============================================================