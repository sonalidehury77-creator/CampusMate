-- ============================================================
-- CampusMate
-- Phase 19 — Advanced Notifications + Intelligent Reminder Engine
-- ============================================================


-- ============================================================
-- 1. EXTEND NOTIFICATION PREFERENCES
-- ============================================================

alter table public.notification_preferences
  add column if not exists exam_notifications boolean
    not null default true;

alter table public.notification_preferences
  add column if not exists study_task_notifications boolean
    not null default true;

alter table public.notification_preferences
  add column if not exists reminder_notifications boolean
    not null default true;


-- ============================================================
-- 2. DEDUPLICATION KEY
-- ============================================================

alter table public.notifications
  add column if not exists dedupe_key text;


-- ============================================================
-- 3. INDEXES
-- ============================================================

create index if not exists notifications_recipient_created_idx
on public.notifications (
  recipient_profile_id,
  created_at desc
);

create index if not exists notifications_recipient_unread_idx
on public.notifications (
  recipient_profile_id,
  read_at,
  created_at desc
);

create index if not exists notifications_related_entity_idx
on public.notifications (
  related_entity_type,
  related_entity_id
);

create index if not exists notifications_dedupe_key_idx
on public.notifications (
  dedupe_key
);

create index if not exists assignments_due_date_subject_idx
on public.assignments (
  due_date,
  subject_id
);

create index if not exists exams_date_subject_idx
on public.exams (
  exam_date,
  subject_id
);

create index if not exists study_plan_items_date_status_idx
on public.study_plan_items (
  study_date,
  status
);

create index if not exists attendance_sessions_subject_date_idx
on public.attendance_sessions (
  subject_id,
  session_date
);

create index if not exists attendance_records_student_status_idx
on public.attendance_records (
  student_id,
  status
);

create index if not exists timetable_semester_day_time_idx
on public.timetable_entries (
  semester_id,
  day_of_week,
  start_time
);


-- ============================================================
-- 4. UNIQUE DEDUPLICATION
-- ============================================================

create unique index if not exists notifications_dedupe_unique_idx
on public.notifications (
  recipient_profile_id,
  dedupe_key
)
where dedupe_key is not null;


-- ============================================================
-- 5. HELPER — CREATE A NOTIFICATION SAFELY
-- ============================================================

create or replace function public.create_reminder_notification(
  p_profile_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_priority text,
  p_entity_type text,
  p_entity_id uuid,
  p_dedupe_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
begin

  if p_profile_id is null then
    raise exception 'Profile ID is required.';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'Notification title is required.';
  end if;

  if p_message is null or length(trim(p_message)) = 0 then
    raise exception 'Notification message is required.';
  end if;

  if p_type not in (
    'assignment',
    'notice',
    'timetable',
    'attendance',
    'reminder',
    'event',
    'system',
    'ai'
  ) then
    raise exception 'Invalid notification type.';
  end if;

  if p_priority not in (
    'urgent',
    'important',
    'normal'
  ) then
    raise exception 'Invalid notification priority.';
  end if;

  insert into public.notifications (
    recipient_profile_id,
    title,
    message,
    type,
    priority,
    related_entity_type,
    related_entity_id,
    dedupe_key
  )
  values (
    p_profile_id,
    trim(p_title),
    trim(p_message),
    p_type::public.notification_type,
    p_priority::public.notice_priority,
    p_entity_type,
    p_entity_id,
    p_dedupe_key
  )
  on conflict (
    recipient_profile_id,
    dedupe_key
  )
  where dedupe_key is not null
  do nothing
  returning id into v_notification_id;

  return v_notification_id;

end;
$$;


-- ============================================================
-- 6. MAIN CURRENT-USER REMINDER ENGINE
-- ============================================================

create or replace function public.generate_my_smart_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_student_id uuid;

  v_preferences record;

  v_now timestamptz := now();
  v_today date := current_date;

  v_count integer := 0;

  v_item record;

  v_days integer;
  v_priority text;
  v_dedupe text;
  v_notification_id uuid;

  v_attendance_total integer;
  v_attendance_present integer;
  v_attendance_percentage numeric;

  v_day_of_week integer;
  v_minutes_until integer;

begin

  -- ==========================================================
  -- AUTHENTICATION
  -- ==========================================================

  v_profile_id := auth.uid();

  if v_profile_id is null then
    raise exception 'Authentication required.';
  end if;


  -- ==========================================================
  -- STUDENT
  -- ==========================================================

  select
    id
  into
    v_student_id
  from public.students
  where profile_id = v_profile_id
  limit 1;

  if v_student_id is null then
    return 0;
  end if;


  -- ==========================================================
  -- PREFERENCES
  -- ==========================================================

  insert into public.notification_preferences (
    profile_id
  )
  values (
    v_profile_id
  )
  on conflict (profile_id)
  do nothing;


  select
    assignment_notifications,
    notice_notifications,
    attendance_notifications,
    timetable_notifications,
    event_notifications,
    ai_notifications,
    email_notifications,
    push_notifications,
    exam_notifications,
    study_task_notifications,
    reminder_notifications
  into v_preferences
  from public.notification_preferences
  where profile_id = v_profile_id;


  -- ==========================================================
  -- 1. ASSIGNMENT REMINDERS
  -- ==========================================================

  if v_preferences.assignment_notifications then

    for v_item in
      select
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.priority,
        a.subject_id,
        s.name as subject_name,
        coalesce(ast.status, 'pending') as student_status
      from public.assignments a
      inner join public.subjects s
        on s.id = a.subject_id
      left join public.assignment_status ast
        on ast.assignment_id = a.id
       and ast.student_id = v_student_id
      where a.due_date is not null
        and a.due_date >= v_now - interval '7 days'
        and coalesce(ast.status, 'pending') <> 'completed'
        and exists (
          select 1
          from public.student_subjects ss
          where ss.student_id = v_student_id
            and ss.subject_id = a.subject_id
        )
    loop

      v_days :=
        floor(
          extract(
            epoch from (
              v_item.due_date - v_now
            )
          ) / 86400
        );

      -- Overdue
      if v_item.due_date < v_now then

        v_priority := 'urgent';

        v_dedupe :=
          'assignment:' ||
          v_item.id::text ||
          ':overdue';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Assignment overdue',
            v_item.title ||
            ' for ' ||
            v_item.subject_name ||
            ' is overdue. Please complete it as soon as possible.',
            'assignment',
            v_priority,
            'assignment',
            v_item.id,
            v_dedupe
          );

      -- Due today
      elsif v_item.due_date::date = v_today then

        if v_item.priority = 'urgent' then
          v_priority := 'urgent';
        else
          v_priority := 'important';
        end if;

        v_dedupe :=
          'assignment:' ||
          v_item.id::text ||
          ':today';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Assignment due today',
            v_item.title ||
            ' for ' ||
            v_item.subject_name ||
            ' is due today.',
            'assignment',
            v_priority,
            'assignment',
            v_item.id,
            v_dedupe
          );

      -- Due tomorrow
      elsif v_item.due_date::date =
            v_today + 1 then

        v_priority := 'important';

        v_dedupe :=
          'assignment:' ||
          v_item.id::text ||
          ':tomorrow';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Assignment due tomorrow',
            v_item.title ||
            ' for ' ||
            v_item.subject_name ||
            ' is due tomorrow.',
            'assignment',
            v_priority,
            'assignment',
            v_item.id,
            v_dedupe
          );

      -- Due within three days
      elsif v_item.due_date <=
            v_now + interval '3 days' then

        v_priority := 'normal';

        v_dedupe :=
          'assignment:' ||
          v_item.id::text ||
          ':3days';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Assignment deadline approaching',
            v_item.title ||
            ' for ' ||
            v_item.subject_name ||
            ' is due within the next few days.',
            'assignment',
            v_priority,
            'assignment',
            v_item.id,
            v_dedupe
          );

      else
        v_notification_id := null;
      end if;

      if v_notification_id is not null then
        v_count := v_count + 1;
      end if;

    end loop;

  end if;


  -- ==========================================================
  -- 2. EXAM REMINDERS
  -- ==========================================================

  if v_preferences.exam_notifications then

    for v_item in
      select
        e.id,
        e.exam_date,
        e.exam_type,
        e.start_time,
        e.room,
        e.subject_id,
        s.name as subject_name
      from public.exams e
      inner join public.subjects s
        on s.id = e.subject_id
      inner join public.student_subjects ss
        on ss.subject_id = e.subject_id
       and ss.student_id = v_student_id
      where e.exam_date between
            v_today
            and v_today + 7
    loop

      -- IMPORTANT:
      -- Use v_item.exam_date, not e.exam_date.
      v_days :=
        v_item.exam_date - v_today;

      if v_days = 0 then

        v_priority := 'urgent';

        v_dedupe :=
          'exam:' ||
          v_item.id::text ||
          ':today';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Exam today',
            v_item.subject_name ||
            ' (' ||
            v_item.exam_type ||
            ') is scheduled today.',
            'reminder',
            v_priority,
            'exam',
            v_item.id,
            v_dedupe
          );

      elsif v_days = 1 then

        v_priority := 'urgent';

        v_dedupe :=
          'exam:' ||
          v_item.id::text ||
          ':tomorrow';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Exam tomorrow',
            v_item.subject_name ||
            ' (' ||
            v_item.exam_type ||
            ') is tomorrow.',
            'reminder',
            v_priority,
            'exam',
            v_item.id,
            v_dedupe
          );

      elsif v_days <= 3 then

        v_priority := 'important';

        v_dedupe :=
          'exam:' ||
          v_item.id::text ||
          ':3days';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Exam coming up',
            v_item.subject_name ||
            ' (' ||
            v_item.exam_type ||
            ') is in ' ||
            v_days::text ||
            ' days.',
            'reminder',
            v_priority,
            'exam',
            v_item.id,
            v_dedupe
          );

      elsif v_days <= 7 then

        v_priority := 'normal';

        v_dedupe :=
          'exam:' ||
          v_item.id::text ||
          ':7days';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Exam approaching',
            v_item.subject_name ||
            ' (' ||
            v_item.exam_type ||
            ') is in ' ||
            v_days::text ||
            ' days.',
            'reminder',
            v_priority,
            'exam',
            v_item.id,
            v_dedupe
          );

      else
        v_notification_id := null;
      end if;

      if v_notification_id is not null then
        v_count := v_count + 1;
      end if;

    end loop;

  end if;


  -- ==========================================================
  -- 3. NOTICE DEADLINE REMINDERS
  -- ==========================================================

  if v_preferences.notice_notifications then

    for v_item in
      select
        n.id,
        n.title,
        n.category,
        n.priority,
        n.deadline
      from public.notices n
      where n.status = 'published'
        and n.deadline is not null
        and n.deadline >= v_now - interval '7 days'
    loop

      if v_item.deadline < v_now then

        v_priority := 'urgent';

        v_dedupe :=
          'notice:' ||
          v_item.id::text ||
          ':overdue';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Notice deadline passed',
            v_item.title ||
            ' has passed its deadline.',
            'notice',
            v_priority,
            'notice',
            v_item.id,
            v_dedupe
          );

      elsif v_item.deadline::date = v_today then

        v_priority := 'urgent';

        v_dedupe :=
          'notice:' ||
          v_item.id::text ||
          ':today';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Notice deadline today',
            v_item.title ||
            ' has a deadline today.',
            'notice',
            v_priority,
            'notice',
            v_item.id,
            v_dedupe
          );

      elsif v_item.deadline::date =
            v_today + 1 then

        v_priority := 'important';

        v_dedupe :=
          'notice:' ||
          v_item.id::text ||
          ':tomorrow';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Notice deadline tomorrow',
            v_item.title ||
            ' has a deadline tomorrow.',
            'notice',
            v_priority,
            'notice',
            v_item.id,
            v_dedupe
          );

      elsif v_item.deadline <=
            v_now + interval '3 days' then

        v_priority := 'normal';

        v_dedupe :=
          'notice:' ||
          v_item.id::text ||
          ':3days';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Notice deadline approaching',
            v_item.title ||
            ' has a deadline within the next few days.',
            'notice',
            v_priority,
            'notice',
            v_item.id,
            v_dedupe
          );

      else
        v_notification_id := null;
      end if;

      if v_notification_id is not null then
        v_count := v_count + 1;
      end if;

    end loop;

  end if;


  -- ==========================================================
  -- 4. STUDY TASK REMINDERS
  -- ==========================================================

  if v_preferences.study_task_notifications then

    for v_item in
      select
        spi.id,
        spi.task,
        spi.study_date,
        spi.duration_minutes,
        spi.priority,
        spi.status,
        coalesce(
          spi.subject_id,
          sp.subject_id
        ) as effective_subject_id,
        s.name as subject_name
      from public.study_plan_items spi
      inner join public.study_plans sp
        on sp.id = spi.study_plan_id
      left join public.subjects s
        on s.id = coalesce(
          spi.subject_id,
          sp.subject_id
        )
      where sp.student_id = v_student_id
        and spi.status = 'planned'
        and spi.study_date between
            v_today - 1
            and v_today + 1
    loop

      if v_item.study_date < v_today then

        v_priority := 'important';

        v_dedupe :=
          'study_task:' ||
          v_item.id::text ||
          ':overdue';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Study task missed',
            v_item.task ||
            case
              when v_item.subject_name is not null
              then ' for ' || v_item.subject_name
              else ''
            end ||
            ' was planned for yesterday.',
            'reminder',
            v_priority,
            'study_task',
            v_item.id,
            v_dedupe
          );

      elsif v_item.study_date = v_today then

        v_priority :=
          case
            when v_item.priority = 'urgent'
              then 'urgent'
            when v_item.priority = 'high'
              then 'important'
            else 'normal'
          end;

        v_dedupe :=
          'study_task:' ||
          v_item.id::text ||
          ':today';

        v_notification_id :=
          public.create_reminder_notification(
            v_profile_id,
            'Study task for today',
            v_item.task ||
            case
              when v_item.subject_name is not null
              then ' — ' || v_item.subject_name
              else ''
            end ||
            ' (' ||
            v_item.duration_minutes::text ||
            ' min).',
            'reminder',
            v_priority,
            'study_task',
            v_item.id,
            v_dedupe
          );

      else
        v_notification_id := null;
      end if;

      if v_notification_id is not null then
        v_count := v_count + 1;
      end if;

    end loop;

  end if;


  -- ==========================================================
  -- 5. ATTENDANCE WARNINGS
  -- ==========================================================

  if v_preferences.attendance_notifications then

    for v_item in
      select
        s.id as subject_id,
        s.name as subject_name
      from public.student_subjects ss
      inner join public.subjects s
        on s.id = ss.subject_id
      where ss.student_id = v_student_id
    loop

      select
        count(*),
        count(*) filter (
          where ar.status = 'present'
        )
      into
        v_attendance_total,
        v_attendance_present
      from public.attendance_sessions ats
      inner join public.attendance_records ar
        on ar.session_id = ats.id
      where ar.student_id = v_student_id
        and ats.subject_id = v_item.subject_id;

      if v_attendance_total >= 3 then

        v_attendance_percentage :=
          round(
            (
              v_attendance_present::numeric
              / v_attendance_total::numeric
            ) * 100,
            2
          );

        if v_attendance_percentage < 75 then

          v_priority := 'urgent';

          v_dedupe :=
            'attendance:' ||
            v_item.subject_id::text ||
            ':' ||
            v_today::text;

          v_notification_id :=
            public.create_reminder_notification(
              v_profile_id,
              'Attendance needs attention',
              v_item.subject_name ||
              ' attendance is ' ||
              v_attendance_percentage::text ||
              '%. Your attendance is currently below 75%.',
              'attendance',
              v_priority,
              'attendance',
              v_item.subject_id,
              v_dedupe
            );

          if v_notification_id is not null then
            v_count := v_count + 1;
          end if;

        elsif v_attendance_percentage < 80 then

          v_priority := 'important';

          v_dedupe :=
            'attendance:' ||
            v_item.subject_id::text ||
            ':warning:' ||
            v_today::text;

          v_notification_id :=
            public.create_reminder_notification(
              v_profile_id,
              'Attendance warning',
              v_item.subject_name ||
              ' attendance is ' ||
              v_attendance_percentage::text ||
              '%. Keep attending upcoming classes consistently.',
              'attendance',
              v_priority,
              'attendance',
              v_item.subject_id,
              v_dedupe
            );

          if v_notification_id is not null then
            v_count := v_count + 1;
          end if;

        end if;

      end if;

    end loop;

  end if;


  -- ==========================================================
  -- 6. UPCOMING TIMETABLE CLASS
  -- ==========================================================

  if v_preferences.timetable_notifications then

    v_day_of_week :=
      extract(
        dow from v_now at time zone 'Asia/Kolkata'
      )::integer;

    for v_item in
      select
        te.id,
        te.subject_id,
        te.start_time,
        te.end_time,
        te.room,
        te.schedule_type,
        s.name as subject_name
      from public.timetable_entries te
      inner join public.subjects s
        on s.id = te.subject_id
      inner join public.students st
        on st.semester_id = te.semester_id
       and st.id = v_student_id
      inner join public.student_subjects ss
        on ss.student_id = v_student_id
       and ss.subject_id = te.subject_id
      where te.day_of_week = v_day_of_week
        and te.start_time >
            (
              v_now at time zone 'Asia/Kolkata'
            )::time
        and te.start_time <=
            (
              (
                v_now at time zone 'Asia/Kolkata'
              ) + interval '45 minutes'
            )::time
      order by te.start_time
      limit 1
    loop

      v_minutes_until :=
        floor(
          extract(
            epoch from (
              (
                v_today
                + v_item.start_time
              )
              -
              (
                (
                  v_now at time zone 'Asia/Kolkata'
                )::date
                +
                (
                  v_now at time zone 'Asia/Kolkata'
                )::time
              )
            )
          ) / 60
        );

      v_priority :=
        case
          when v_minutes_until <= 15
            then 'important'
          else 'normal'
        end;

      v_dedupe :=
        'timetable:' ||
        v_item.id::text ||
        ':' ||
        v_today::text;

      v_notification_id :=
        public.create_reminder_notification(
          v_profile_id,
          'Upcoming class',
          v_item.subject_name ||
          ' starts in about ' ||
          greatest(v_minutes_until, 0)::text ||
          ' minutes' ||
          case
            when v_item.room is not null
            then ' in ' || v_item.room
            else ''
          end ||
          '.',
          'timetable',
          v_priority,
          'timetable',
          v_item.id,
          v_dedupe
        );

      if v_notification_id is not null then
        v_count := v_count + 1;
      end if;

    end loop;

  end if;


  -- ==========================================================
  -- END REMINDER ENGINE
  -- ==========================================================

  return v_count;

end;
$$;


-- ============================================================
-- 7. PERMISSION
-- ============================================================

revoke all
on function public.generate_my_smart_reminders()
from public;

grant execute
on function public.generate_my_smart_reminders()
to authenticated;


revoke all
on function public.create_reminder_notification(
  uuid,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text
)
from public;

grant execute
on function public.create_reminder_notification(
  uuid,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text
)
to authenticated;


-- ============================================================
-- 8. COMMENTS
-- ============================================================

comment on function public.generate_my_smart_reminders()
is
'Generates deduplicated, preference-aware smart reminders for the currently authenticated student.';

comment on column public.notifications.dedupe_key
is
'Stable reminder key used to prevent duplicate notifications for the same user and reminder window.';