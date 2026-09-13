-- ============================================================
-- CampusMate
-- Phase 13 - Temporary Resources and Notes Test Data
-- ============================================================


-- ============================================================
-- 1. TEST RESOURCES
-- ============================================================

do $$
declare
  v_profile_id uuid;
begin

  select p.id
  into v_profile_id

  from public.profiles p

  where p.email = 'sonalidehury77@gmail.com'

  limit 1;


  if v_profile_id is null then
    raise exception
      'Test profile was not found.';
  end if;


  -- ----------------------------------------------------------
  -- DCS-501
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Java Programming - Complete Study Notes',

    'Temporary test resource for Phase 13.',

    'note',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-501';


  -- ----------------------------------------------------------
  -- DCS-502
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Computer Networks - Important Questions',

    'Temporary PYQ-style resource for testing.',

    'pyq',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-502';


  -- ----------------------------------------------------------
  -- DCS-503
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Database Management System Notes',

    'Temporary DBMS study resource.',

    'document',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-503';


  -- ----------------------------------------------------------
  -- DCS-504
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Operating Systems Revision Material',

    'Temporary OS revision resource.',

    'note',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-504';


  -- ----------------------------------------------------------
  -- DCS-505
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Computer Graphics Algorithms',

    'Temporary Computer Graphics resource.',

    'document',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-505';


  -- ----------------------------------------------------------
  -- DCS-506
  -- ----------------------------------------------------------

  insert into public.resources (
    subject_id,
    unit_id,
    uploaded_by,
    title,
    description,
    resource_type,
    external_url,
    visibility
  )

  select
    s.id,
    u.id,
    v_profile_id,

    'Artificial Intelligence Algorithms',

    'Temporary AI algorithms study resource.',

    'pyq',

    null,

    'students'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-506';

end $$;


-- ============================================================
-- 2. TEST NOTES
-- ============================================================

do $$
declare
  v_student_id uuid;
begin

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


  -- ----------------------------------------------------------
  -- NOTE 1
  -- ----------------------------------------------------------

  insert into public.notes (
    student_id,
    subject_id,
    unit_id,
    title,
    content
  )

  select
    v_student_id,
    s.id,
    u.id,

    'Group Theory Important Points',

    'Remember the definitions of group, subgroup, cyclic group, order of an element, generators, center and centralizer.'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-501';


  -- ----------------------------------------------------------
  -- NOTE 2
  -- ----------------------------------------------------------

  insert into public.notes (
    student_id,
    subject_id,
    unit_id,
    title,
    content
  )

  select
    v_student_id,
    s.id,
    u.id,

    'Important Algorithm Steps',

    'Write each algorithm with definition, initialization, main steps, termination condition, complexity and one worked example.'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-502';


  -- ----------------------------------------------------------
  -- NOTE 3
  -- ----------------------------------------------------------

  insert into public.notes (
    student_id,
    subject_id,
    unit_id,
    title,
    content
  )

  select
    v_student_id,
    s.id,
    u.id,

    'Exam Revision Checklist',

    'Before the examination, revise definitions, formulas, diagrams, proofs, numerical problems and previous-year questions.'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-503';


  -- ----------------------------------------------------------
  -- NOTE 4
  -- ----------------------------------------------------------

  insert into public.notes (
    student_id,
    subject_id,
    unit_id,
    title,
    content
  )

  select
    v_student_id,
    s.id,
    u.id,

    'Quick Revision',

    'Use this note for short exam-ready points that need to be revised repeatedly.'

  from public.subjects s

  left join lateral (
    select su.id
    from public.syllabus_units su
    where su.subject_id = s.id
    order by su.unit_number
    limit 1
  ) u on true

  where s.code = 'DCS-504';

end $$;


-- ============================================================
-- 3. VERIFY TEST DATA
-- ============================================================

do $$
declare
  v_resource_count integer;
  v_note_count integer;
begin

  select count(*)
  into v_resource_count

  from public.resources r

  join public.subjects s
    on s.id = r.subject_id

  where s.code in (
    'DCS-501',
    'DCS-502',
    'DCS-503',
    'DCS-504',
    'DCS-505',
    'DCS-506'
  );


  select count(*)
  into v_note_count

  from public.notes n

  join public.students st
    on st.id = n.student_id

  join public.profiles p
    on p.id = st.profile_id

  where p.email = 'sonalidehury77@gmail.com';


  if v_resource_count <> 6 then
    raise exception
      'Expected 6 test resources, found %.',
      v_resource_count;
  end if;


  if v_note_count <> 4 then
    raise exception
      'Expected 4 test notes, found %.',
      v_note_count;
  end if;


  raise notice
    'PHASE 13 TEST DATA SUCCESS: 6 resources and 4 notes.';

end $$;