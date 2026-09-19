-- ============================================================
-- CampusMate
-- Phase 20 — Temporary Test Exam Data
-- ============================================================

DO $$
DECLARE
  v_semester_id uuid;
  v_subject_id uuid;
BEGIN

  SELECT id
  INTO v_semester_id
  FROM public.semesters
  WHERE semester_number = 5
    AND academic_year = '2026-27'
  LIMIT 1;

  IF v_semester_id IS NULL THEN
    RAISE EXCEPTION
      'Test semester 5 / 2026-27 not found.';
  END IF;


  -- DCS-501
  SELECT id INTO v_subject_id
  FROM public.subjects
  WHERE code = 'DCS-501'
    AND semester_id = v_semester_id
  LIMIT 1;

  IF v_subject_id IS NOT NULL THEN
    INSERT INTO public.exams (
      semester_id,
      subject_id,
      exam_type,
      exam_date,
      start_time,
      end_time,
      room
    )
    VALUES (
      v_semester_id,
      v_subject_id,
      'Internal Assessment',
      (current_date + 3),
      '10:00',
      '11:00',
      'Room 204'
    )
    ON CONFLICT DO NOTHING;
  END IF;


  -- DCS-502
  SELECT id INTO v_subject_id
  FROM public.subjects
  WHERE code = 'DCS-502'
    AND semester_id = v_semester_id
  LIMIT 1;

  IF v_subject_id IS NOT NULL THEN
    INSERT INTO public.exams (
      semester_id,
      subject_id,
      exam_type,
      exam_date,
      start_time,
      end_time,
      room
    )
    VALUES (
      v_semester_id,
      v_subject_id,
      'Internal Assessment',
      (current_date + 7),
      '10:00',
      '11:00',
      'Room 205'
    )
    ON CONFLICT DO NOTHING;
  END IF;


  -- DCS-503
  SELECT id INTO v_subject_id
  FROM public.subjects
  WHERE code = 'DCS-503'
    AND semester_id = v_semester_id
  LIMIT 1;

  IF v_subject_id IS NOT NULL THEN
    INSERT INTO public.exams (
      semester_id,
      subject_id,
      exam_type,
      exam_date,
      start_time,
      end_time,
      room
    )
    VALUES (
      v_semester_id,
      v_subject_id,
      'Internal Assessment',
      (current_date + 12),
      '14:00',
      '15:00',
      'Room 206'
    )
    ON CONFLICT DO NOTHING;
  END IF;

END;
$$;