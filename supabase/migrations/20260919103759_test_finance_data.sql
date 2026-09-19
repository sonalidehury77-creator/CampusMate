-- ============================================================
-- CampusMate
-- Phase 21 — Temporary Finance Test Data
-- ============================================================

DO $$
DECLARE
  v_student_id uuid;
  v_food_id uuid;
  v_transport_id uuid;
  v_education_id uuid;
BEGIN

  SELECT id
  INTO v_student_id
  FROM public.students
  WHERE student_number = 'TEST-DCS-001'
  LIMIT 1;

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION
      'Test student TEST-DCS-001 not found.';
  END IF;


  SELECT id
  INTO v_food_id
  FROM public.expense_categories
  WHERE name = 'Food'
  LIMIT 1;


  SELECT id
  INTO v_transport_id
  FROM public.expense_categories
  WHERE name = 'Transport'
  LIMIT 1;


  SELECT id
  INTO v_education_id
  FROM public.expense_categories
  WHERE name = 'Education'
  LIMIT 1;


  INSERT INTO public.expenses (
    student_id,
    category_id,
    title,
    description,
    amount,
    expense_date,
    payment_method
  )
  VALUES
    (
      v_student_id,
      v_food_id,
      'Mess lunch',
      'Test finance transaction',
      80.00,
      current_date,
      'upi'
    ),
    (
      v_student_id,
      v_transport_id,
      'College transport',
      'Test finance transaction',
      50.00,
      current_date - 1,
      'cash'
    ),
    (
      v_student_id,
      v_education_id,
      'Notebook',
      'Test academic expense',
      120.00,
      current_date - 2,
      'upi'
    )
  ON CONFLICT DO NOTHING;


  INSERT INTO public.budgets (
    student_id,
    category_id,
    month_start,
    amount
  )
  VALUES
    (
      v_student_id,
      null,
      date_trunc(
        'month',
        current_date
      )::date,
      3000.00
    )
  ON CONFLICT DO NOTHING;

END;
$$;