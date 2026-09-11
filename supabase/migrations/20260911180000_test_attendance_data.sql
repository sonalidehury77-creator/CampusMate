-- ============================================================
-- CampusMate
-- Phase 12 - Attendance Tracker
-- Temporary test data
-- ============================================================

-- ============================================================
-- 1. VERIFY TEST STUDENT AND TEST SUBJECTS
-- ============================================================

do $$
declare
  v_student_id uuid;
  v_missing_subjects text;
begin

  -- Find the real authenticated student used for testing.
  select s.id
  into v_student_id
  from public.students s
  join public.profiles p
    on p.id = s.profile_id
  where p.email = 'sonalidehury77@gmail.com'
  limit 1;

  if v_student_id is null then
    raise exception
      'Test student sonalidehury77@gmail.com was not found.';
  end if;


  -- Make sure all six test subjects exist.
  select string_agg(s.code, ', ' order by s.code)
  into v_missing_subjects
  from (
    values
      ('DCS-501'),
      ('DCS-502'),
      ('DCS-503'),
      ('DCS-504'),
      ('DCS-505'),
      ('DCS-506')
  ) as expected(code)
  left join public.subjects s
    on s.code = expected.code
  where s.id is null;

  if v_missing_subjects is not null then
    raise exception
      'The following test subjects are missing: %',
      v_missing_subjects;
  end if;

end $$;


-- ============================================================
-- 2. VERIFY EACH SUBJECT HAS A TIMETABLE ENTRY
-- ============================================================

do $$
declare
  v_missing_timetable text;
begin

  select string_agg(s.code, ', ' order by s.code)
  into v_missing_timetable
  from public.subjects s
  where s.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  )
  and not exists (
    select 1
    from public.timetable_entries t
    where t.subject_id = s.id
  );

  if v_missing_timetable is not null then
    raise exception
      'The following test subjects have no timetable entry: %',
      v_missing_timetable;
  end if;

end $$;


-- ============================================================
-- 3. CREATE EXACTLY 60 ATTENDANCE SESSIONS
--    10 sessions for each of 6 subjects
--
--    We select ONE real timetable entry for each subject.
--    Then generate 10 weekly dates matching that timetable
--    entry's day_of_week.
--
--    2026-08-31 is Monday.
--    The generated dates are all in the past.
-- ============================================================

with selected_timetable as (

  select distinct on (t.subject_id)
    t.subject_id,
    t.id as timetable_entry_id,
    t.day_of_week

  from public.timetable_entries t

  join public.subjects s
    on s.id = t.subject_id

  where s.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  )

  order by
    t.subject_id,
    t.day_of_week,
    t.start_time,
    t.id
),

generated_sessions as (

  select
    st.subject_id,
    st.timetable_entry_id,

    (
      date '2026-08-31'

      + (
          (
            st.day_of_week
            - extract(
                dow from date '2026-08-31'
              )::integer
            + 7
          ) % 7
        )

      - (
          (9 - gs.week_number) * 7
        )

    )::date as session_date

  from selected_timetable st

  cross join generate_series(
    0,
    9
  ) as gs(week_number)
)

insert into public.attendance_sessions (
  subject_id,
  timetable_entry_id,
  session_date
)

select
  subject_id,
  timetable_entry_id,
  session_date

from generated_sessions;


-- ============================================================
-- 4. CREATE ATTENDANCE RECORDS
-- ============================================================

do $$
declare
  v_student_id uuid;
begin

  -- Find the real authenticated student.
  select s.id
  into v_student_id
  from public.students s
  join public.profiles p
    on p.id = s.profile_id
  where p.email = 'sonalidehury77@gmail.com'
  limit 1;

  if v_student_id is null then
    raise exception
      'Test student was not found.';
  end if;


  -- ==========================================================
  -- DCS-501
  -- 8 Present / 2 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    x.id,
    v_student_id,

    case
      when x.session_number <= 8
        then 'present'
      else 'absent'
    end

  from (
    select
      a.id,
      row_number() over (
        order by a.session_date, a.id
      ) as session_number

    from public.attendance_sessions a

    join public.subjects s
      on s.id = a.subject_id

    where s.code = 'DCS-501'
  ) x

  where x.session_number <= 10;


  -- ==========================================================
  -- DCS-502
  -- 9 Present / 1 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    x.id,
    v_student_id,

    case
      when x.session_number <= 9
        then 'present'
      else 'absent'
    end

  from (
    select
      a.id,
      row_number() over (
        order by a.session_date, a.id
      ) as session_number

    from public.attendance_sessions a

    join public.subjects s
      on s.id = a.subject_id

    where s.code = 'DCS-502'
  ) x

  where x.session_number <= 10;


  -- ==========================================================
  -- DCS-503
  -- 7 Present / 3 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    x.id,
    v_student_id,

    case
      when x.session_number <= 7
        then 'present'
      else 'absent'
    end

  from (
    select
      a.id,
      row_number() over (
        order by a.session_date, a.id
      ) as session_number

    from public.attendance_sessions a

    join public.subjects s
      on s.id = a.subject_id

    where s.code = 'DCS-503'
  ) x

  where x.session_number <= 10;


  -- ==========================================================
  -- DCS-504
  -- 10 Present / 0 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    a.id,
    v_student_id,
    'present'

  from public.attendance_sessions a

  join public.subjects s
    on s.id = a.subject_id

  where s.code = 'DCS-504'

  order by
    a.session_date,
    a.id

  limit 10;


  -- ==========================================================
  -- DCS-505
  -- 8 Present / 2 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    x.id,
    v_student_id,

    case
      when x.session_number <= 8
        then 'present'
      else 'absent'
    end

  from (
    select
      a.id,
      row_number() over (
        order by a.session_date, a.id
      ) as session_number

    from public.attendance_sessions a

    join public.subjects s
      on s.id = a.subject_id

    where s.code = 'DCS-505'
  ) x

  where x.session_number <= 10;


  -- ==========================================================
  -- DCS-506
  -- 9 Present / 1 Absent
  -- ==========================================================

  insert into public.attendance_records (
    session_id,
    student_id,
    status
  )

  select
    x.id,
    v_student_id,

    case
      when x.session_number <= 9
        then 'present'
      else 'absent'
    end

  from (
    select
      a.id,
      row_number() over (
        order by a.session_date, a.id
      ) as session_number

    from public.attendance_sessions a

    join public.subjects s
      on s.id = a.subject_id

    where s.code = 'DCS-506'
  ) x

  where x.session_number <= 10;

end $$;


-- ============================================================
-- 5. VERIFY ATTENDANCE SESSIONS
-- ============================================================

do $$
declare
  v_session_count integer;
  v_record_count integer;
  v_present_count integer;
  v_absent_count integer;
begin

  -- Count all six test subjects' sessions.
  select count(*)
  into v_session_count

  from public.attendance_sessions a

  join public.subjects s
    on s.id = a.subject_id

  where s.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  );


  -- Count all attendance records for the test student.
  select count(*)
  into v_record_count

  from public.attendance_records ar

  join public.students st
    on st.id = ar.student_id

  join public.profiles p
    on p.id = st.profile_id

  join public.attendance_sessions a
    on a.id = ar.session_id

  join public.subjects s
    on s.id = a.subject_id

  where p.email = 'sonalidehury77@gmail.com'
    and s.code in (
      'DCS-501',
      'DCS-502',
      'DCS-503',
      'DCS-504',
      'DCS-505',
      'DCS-506'
    );


  -- Count present records.
  select count(*)
  into v_present_count

  from public.attendance_records ar

  join public.students st
    on st.id = ar.student_id

  join public.profiles p
    on p.id = st.profile_id

  join public.attendance_sessions a
    on a.id = ar.session_id

  join public.subjects s
    on s.id = a.subject_id

  where p.email = 'sonalidehury77@gmail.com'
    and s.code in (
      'DCS-501',
      'DCS-502',
      'DCS-503',
      'DCS-504',
      'DCS-505',
      'DCS-506'
    )
    and ar.status = 'present';


  -- Count absent records.
  select count(*)
  into v_absent_count

  from public.attendance_records ar

  join public.students st
    on st.id = ar.student_id

  join public.profiles p
    on p.id = st.profile_id

  join public.attendance_sessions a
    on a.id = ar.session_id

  join public.subjects s
    on s.id = a.subject_id

  where p.email = 'sonalidehury77@gmail.com'
    and s.code in (
      'DCS-501',
      'DCS-502',
      'DCS-503',
      'DCS-504',
      'DCS-505',
      'DCS-506'
    )
    and ar.status = 'absent';


  if v_session_count <> 60 then
    raise exception
      'Expected 60 attendance sessions, found %.',
      v_session_count;
  end if;


  if v_record_count <> 60 then
    raise exception
      'Expected 60 attendance records, found %.',
      v_record_count;
  end if;


  if v_present_count <> 51 then
    raise exception
      'Expected 51 present records, found %.',
      v_present_count;
  end if;


  if v_absent_count <> 9 then
    raise exception
      'Expected 9 absent records, found %.',
      v_absent_count;
  end if;


  raise notice
    'ATTENDANCE TEST DATA SUCCESS: 60 sessions, 60 records, 51 present, 9 absent.';

end $$;