-- ============================================================
-- CampusMate
-- Phase 19 — Advanced Notifications + Intelligent Reminder Engine
-- ============================================================


-- ============================================================
-- 1. PRIVATE SCHEMA
-- ============================================================

create schema if not exists private;


-- ============================================================
-- 2. ADVANCED NOTIFICATION PREFERENCES
-- ============================================================

alter table public.notification_preferences
  add column if not exists reminder_notifications
    boolean not null default true;

alter table public.notification_preferences
  add column if not exists assignment_reminder_days
    integer not null default 1;

alter table public.notification_preferences
  add column if not exists notice_reminder_days
    integer not null default 1;

alter table public.notification_preferences
  add column if not exists exam_reminder_days
    integer not null default 7;

alter table public.notification_preferences
  add column if not exists timetable_reminder_minutes
    integer not null default 15;

alter table public.notification_preferences
  add column if not exists quiet_hours_enabled
    boolean not null default false;

alter table public.notification_preferences
  add column if not exists quiet_hours_start
    time not null default '22:00:00';

alter table public.notification_preferences
  add column if not exists quiet_hours_end
    time not null default '07:00:00';


-- ============================================================
-- 3. VALIDATION CONSTRAINTS
-- ============================================================

alter table public.notification_preferences
  drop constraint if exists notification_preferences_assignment_days_check;

alter table public.notification_preferences
  add constraint notification_preferences_assignment_days_check
  check (
    assignment_reminder_days between 0 and 7
  );


alter table public.notification_preferences
  drop constraint if exists notification_preferences_notice_days_check;

alter table public.notification_preferences
  add constraint notification_preferences_notice_days_check
  check (
    notice_reminder_days between 0 and 7
  );


alter table public.notification_preferences
  drop constraint if exists notification_preferences_exam_days_check;

alter table public.notification_preferences
  add constraint notification_preferences_exam_days_check
  check (
    exam_reminder_days between 0 and 14
  );


alter table public.notification_preferences
  drop constraint if exists notification_preferences_timetable_minutes_check;

alter table public.notification_preferences
  add constraint notification_preferences_timetable_minutes_check
  check (
    timetable_reminder_minutes between 5 and 60
  );


-- ============================================================
-- 4. SMART REMINDERS
-- ============================================================

create table if not exists public.smart_reminders (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null
    references public.profiles(id)
    on delete cascade,

  source_type text not null
    check (
      source_type in (
        'assignment',
        'notice',
        'exam',
        'timetable',
        'study_task',
        'attendance'
      )
    ),

  source_id uuid not null,

  reminder_key text not null,

  reminder_kind text not null,

  due_at timestamptz,

  notification_id uuid
    references public.notifications(id)
    on delete set null,

  created_at timestamptz not null default now(),

  unique (
    profile_id,
    reminder_key
  )
);


-- ============================================================
-- 5. SMART REMINDER INDEXES
-- ============================================================

create index if not exists
  smart_reminders_profile_created_idx
on public.smart_reminders (
  profile_id,
  created_at desc
);


create index if not exists
  smart_reminders_source_idx
on public.smart_reminders (
  source_type,
  source_id
);


create index if not exists
  smart_reminders_due_idx
on public.smart_reminders (
  due_at
);


-- ============================================================
-- 6. SMART REMINDER RLS
-- ============================================================

alter table public.smart_reminders
  enable row level security;


revoke all
on public.smart_reminders
from anon, authenticated;


grant select
on public.smart_reminders
to authenticated;


drop policy if exists
  "Users can view their own smart reminders"
on public.smart_reminders;


create policy
  "Users can view their own smart reminders"
on public.smart_reminders
for select
to authenticated
using (
  (select auth.uid()) = profile_id
);


-- ============================================================
-- 7. NOTIFICATION REALTIME PUBLICATION
-- ============================================================

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  )
  and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then

    alter publication supabase_realtime
      add table public.notifications;

  end if;
end
$$;


-- ============================================================
-- 8. SMART NOTIFICATION EMITTER
-- ============================================================

create or replace function private.emit_smart_reminder(
  p_profile_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_reminder_key text,
  p_reminder_kind text,
  p_due_at timestamptz,
  p_title text,
  p_message text,
  p_notification_type text,
  p_priority text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reminder_id uuid;
  v_notification_id uuid;
begin

  /*
   * First create the reminder record.
   *
   * The unique key prevents duplicate notifications
   * when the reminder engine runs repeatedly.
   */

  insert into public.smart_reminders (
    profile_id,
    source_type,
    source_id,
    reminder_key,
    reminder_kind,
    due_at
  )
  values (
    p_profile_id,
    p_source_type,
    p_source_id,
    p_reminder_key,
    p_reminder_kind,
    p_due_at
  )
  on conflict (
    profile_id,
    reminder_key
  )
  do nothing
  returning id
  into v_reminder_id;


  /*
   * A NULL result means the reminder already exists.
   */

  if v_reminder_id is null then
    return false;
  end if;


  /*
   * Create the actual notification.
   */

  insert into public.notifications (
    recipient_profile_id,
    title,
    message,
    type,
    priority,
    related_entity_type,
    related_entity_id
  )
  values (
    p_profile_id,
    p_title,
    p_message,
    p_notification_type,
    p_priority,
    p_source_type,
    p_source_id
  )
  returning id
  into v_notification_id;


  /*
   * Connect the notification to its reminder.
   */

  update public.smart_reminders
  set notification_id = v_notification_id
  where id = v_reminder_id;


  return true;

end;
$$;


-- Only internal database functions should use this.
revoke execute
on function private.emit_smart_reminder(
  uuid,
  text,
  uuid,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  text
)
from public, anon, authenticated;


-- ============================================================
-- 9. PER-STUDENT REMINDER ENGINE
-- ============================================================

create or replace function private.generate_smart_reminders_for_profile(
  p_profile_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare

  v_student_id uuid;

  v_prefs record;

  v_now timestamptz := now();

  v_local_now timestamp;

  v_local_date date;

  v_local_time time;

  v_isodow integer;

  v_created integer := 0;

  v_days integer;

  v_reminder_key text;

  v_title text;

  v_message text;

  v_priority text;

  v_kind text;

  v_due_at timestamptz;

  v_class_at timestamptz;

  v_attendance_total integer;

  v_attendance_present integer;

  v_attendance_percentage numeric;

  r record;

begin

  /*
   * ----------------------------------------------------------
   * Student lookup
   * ----------------------------------------------------------
   */

  select id
  into v_student_id
  from public.students
  where profile_id = p_profile_id
  limit 1;


  if v_student_id is null then
    return 0;
  end if;


  /*
   * ----------------------------------------------------------
   * Notification preferences
   * ----------------------------------------------------------
   */

  select *
  into v_prefs
  from public.notification_preferences
  where profile_id = p_profile_id
  limit 1;


  /*
   * If preferences do not exist yet, create them.
   */

  if not found then

    insert into public.notification_preferences (
      profile_id
    )
    values (
      p_profile_id
    )
    on conflict (
      profile_id
    )
    do nothing;


    select *
    into v_prefs
    from public.notification_preferences
    where profile_id = p_profile_id
    limit 1;

  end if;


  /*
   * ----------------------------------------------------------
   * Local timezone
   * ----------------------------------------------------------
   */

  v_local_now :=
    v_now at time zone 'Asia/Kolkata';

  v_local_date :=
    v_local_now::date;

  v_local_time :=
    v_local_now::time;

  v_isodow :=
    extract(
      isodow
      from v_local_now
    )::integer;


  /*
   * ----------------------------------------------------------
   * Quiet hours
   * ----------------------------------------------------------
   */

  if v_prefs.quiet_hours_enabled then

    if
      (
        v_prefs.quiet_hours_start
        <
        v_prefs.quiet_hours_end

        and

        v_local_time >=
        v_prefs.quiet_hours_start

        and

        v_local_time <
        v_prefs.quiet_hours_end
      )

      or

      (
        v_prefs.quiet_hours_start
        >
        v_prefs.quiet_hours_end

        and

        (
          v_local_time >=
          v_prefs.quiet_hours_start

          or

          v_local_time <
          v_prefs.quiet_hours_end
        )
      )

    then

      return 0;

    end if;

  end if;


  /*
   * ==========================================================
   * ASSIGNMENT REMINDERS
   * ==========================================================
   */

  if v_prefs.reminder_notifications
     and v_prefs.assignment_notifications
  then

    for r in

      select
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.priority,
        s.name as subject_name

      from public.assignments a

      inner join public.student_subjects ss
        on ss.subject_id = a.subject_id

      inner join public.subjects s
        on s.id = a.subject_id

      where ss.student_id = v_student_id

        and a.due_date is not null

        and a.due_date >=
          v_now - interval '1 day'

        and a.due_date <=
          v_now
          + greatest(
              v_prefs.assignment_reminder_days,
              1
            ) * interval '1 day'

        /*
         * Do not remind about assignments that the
         * student has already completed/submitted.
         */

        and not exists (
          select 1
          from public.assignment_status ast
          where ast.assignment_id = a.id
            and ast.student_id = v_student_id
            and lower(ast.status) in (
              'completed',
              'submitted',
              'done'
            )
        )

    loop

      v_days :=
        (
          (
            r.due_date
            at time zone 'Asia/Kolkata'
          )::date
          -
          v_local_date
        );


      if v_days < 0 then

        v_kind := 'overdue';

        v_priority := 'urgent';

        v_title :=
          'Assignment overdue';

        v_message :=
          format(
            '%s for %s is overdue. Open Assignments to complete it.',
            r.title,
            r.subject_name
          );

      elsif v_days = 0 then

        v_kind := 'due_today';

        v_priority := 'urgent';

        v_title :=
          'Assignment due today';

        v_message :=
          format(
            '%s for %s is due today.',
            r.title,
            r.subject_name
          );

      elsif v_days = 1 then

        v_kind := 'due_tomorrow';

        v_priority := 'important';

        v_title :=
          'Assignment due tomorrow';

        v_message :=
          format(
            '%s for %s is due tomorrow.',
            r.title,
            r.subject_name
          );

      else

        v_kind := 'due_soon';

        v_priority := 'normal';

        v_title :=
          'Upcoming assignment';

        v_message :=
          format(
            '%s for %s is due in %s days.',
            r.title,
            r.subject_name,
            v_days
          );

      end if;


      v_reminder_key :=
        format(
          'assignment:%s:%s',
          r.id,
          v_kind
        );


      if private.emit_smart_reminder(
        p_profile_id,
        'assignment',
        r.id,
        v_reminder_key,
        v_kind,
        r.due_date,
        v_title,
        v_message,
        'assignment',
        v_priority
      ) then

        v_created :=
          v_created + 1;

      end if;

    end loop;

  end if;


  /*
   * ==========================================================
   * NOTICE REMINDERS
   * ==========================================================
   */

  if v_prefs.reminder_notifications
     and v_prefs.notice_notifications
  then

    for r in

      select
        n.id,
        n.title,
        n.deadline,
        n.priority,
        n.category

      from public.notices n

      where n.status = 'published'

        and n.deadline is not null

        and n.deadline >=
          v_now - interval '1 day'

        and n.deadline <=
          v_now
          + greatest(
              v_prefs.notice_reminder_days,
              1
            ) * interval '1 day'

    loop

      v_days :=
        (
          (
            r.deadline
            at time zone 'Asia/Kolkata'
          )::date
          -
          v_local_date
        );


      if v_days < 0 then

        v_kind := 'deadline_overdue';

        v_priority := 'urgent';

        v_title :=
          'Notice deadline passed';

        v_message :=
          format(
            '%s has passed its deadline.',
            r.title
          );

      elsif v_days = 0 then

        v_kind := 'deadline_today';

        v_priority := 'urgent';

        v_title :=
          'Notice deadline today';

        v_message :=
          format(
            '%s has a deadline today.',
            r.title
          );

      elsif v_days = 1 then

        v_kind := 'deadline_tomorrow';

        v_priority := 'important';

        v_title :=
          'Notice deadline tomorrow';

        v_message :=
          format(
            '%s has a deadline tomorrow.',
            r.title
          );

      else

        v_kind := 'deadline_soon';

        v_priority := 'normal';

        v_title :=
          'Upcoming notice deadline';

        v_message :=
          format(
            '%s has a deadline in %s days.',
            r.title,
            v_days
          );

      end if;


      v_reminder_key :=
        format(
          'notice:%s:%s',
          r.id,
          v_kind
        );


      if private.emit_smart_reminder(
        p_profile_id,
        'notice',
        r.id,
        v_reminder_key,
        v_kind,
        r.deadline,
        v_title,
        v_message,
        'notice',
        v_priority
      ) then

        v_created :=
          v_created + 1;

      end if;

    end loop;

  end if;


  /*
   * ==========================================================
   * EXAM REMINDERS
   * ==========================================================
   */

  if v_prefs.reminder_notifications
  then

    for r in

      select
        e.id,
        e.subject_id,
        e.exam_date,
        e.exam_type,
        e.start_time,
        e.room,
        s.name as subject_name

      from public.exams e

      inner join public.student_subjects ss
        on ss.subject_id = e.subject_id

      inner join public.subjects s
        on s.id = e.subject_id

      where ss.student_id = v_student_id

        and e.exam_date >= v_local_date

        and e.exam_date <=
          v_local_date
          + greatest(
              v_prefs.exam_reminder_days,
              1
            )

    loop

      v_days :=
        r.exam_date
        -
        v_local_date;


      if v_days = 0 then

        v_kind := 'exam_today';

        v_priority := 'urgent';

        v_title :=
          'Exam is today';

        v_message :=
          format(
            '%s exam for %s is today.',
            coalesce(
              r.exam_type,
              'Scheduled'
            ),
            r.subject_name
          );

      elsif v_days = 1 then

        v_kind := 'exam_tomorrow';

        v_priority := 'urgent';

        v_title :=
          'Exam tomorrow';

        v_message :=
          format(
            '%s exam for %s is tomorrow.',
            coalesce(
              r.exam_type,
              'Scheduled'
            ),
            r.subject_name
          );

      elsif v_days <= 3 then

        v_kind := 'exam_3_days';

        v_priority := 'important';

        v_title :=
          'Exam coming soon';

        v_message :=
          format(
            '%s exam for %s is in %s days.',
            coalesce(
              r.exam_type,
              'Scheduled'
            ),
            r.subject_name,
            v_days
          );

      else

        v_kind := 'exam_soon';

        v_priority := 'normal';

        v_title :=
          'Upcoming exam';

        v_message :=
          format(
            '%s exam for %s is in %s days.',
            coalesce(
              r.exam_type,
              'Scheduled'
            ),
            r.subject_name,
            v_days
          );

      end if;


      v_due_at :=
        (
          r.exam_date
          +
          coalesce(
            r.start_time::time,
            time '09:00'
          )
        )
        at time zone 'Asia/Kolkata';


      v_reminder_key :=
        format(
          'exam:%s:%s',
          r.id,
          v_kind
        );


      if private.emit_smart_reminder(
        p_profile_id,
        'exam',
        r.id,
        v_reminder_key,
        v_kind,
        v_due_at,
        v_title,
        v_message,
        'reminder',
        v_priority
      ) then

        v_created :=
          v_created + 1;

      end if;

    end loop;

  end if;


  /*
   * ==========================================================
   * STUDY TASK REMINDERS
   * ==========================================================
   */

  if v_prefs.reminder_notifications
  then

    for r in

      select
        spi.id,
        spi.task,
        spi.study_date,
        spi.status,
        sp.subject_id,
        s.name as subject_name

      from public.study_plan_items spi

      inner join public.study_plans sp
        on sp.id = spi.study_plan_id

      left join public.subjects s
        on s.id = sp.subject_id

      where sp.student_id = v_student_id

        and spi.study_date =
          v_local_date

        and lower(spi.status) not in (
          'completed',
          'done'
        )

    loop

      v_reminder_key :=
        format(
          'study_task:%s:%s',
          r.id,
          v_local_date
        );


      v_title :=
        'Study task for today';


      v_message :=
        case
          when r.subject_name is not null then
            format(
              '%s — %s',
              r.subject_name,
              r.task
            )
          else
            r.task
        end;


      if private.emit_smart_reminder(
        p_profile_id,
        'study_task',
        r.id,
        v_reminder_key,
        'study_today',
        v_now,
        v_title,
        v_message,
        'reminder',
        'normal'
      ) then

        v_created :=
          v_created + 1;

      end if;

    end loop;

  end if;


  /*
   * ==========================================================
   * TIMETABLE REMINDERS
   * ==========================================================
   */

  if v_prefs.timetable_notifications
  then

    for r in

      select
        t.id,
        t.subject_id,
        t.start_time,
        t.room,
        t.schedule_type,
        s.name as subject_name

      from public.timetable_entries t

      inner join public.student_subjects ss
        on ss.subject_id = t.subject_id

      inner join public.subjects s
        on s.id = t.subject_id

      where ss.student_id = v_student_id

        and t.day_of_week =
          v_isodow

    loop

      /*
       * Convert the timetable's local wall-clock
       * time into a timezone-aware timestamp.
       */

      v_class_at :=
        (
          v_local_date
          +
          r.start_time::time
        )
        at time zone 'Asia/Kolkata';


      if v_class_at >= v_now
         and v_class_at <=
           v_now
           + (
             v_prefs.timetable_reminder_minutes
             + 2
           ) * interval '1 minute'
      then

        v_reminder_key :=
          format(
            'timetable:%s:%s',
            r.id,
            v_class_at
          );


        v_title :=
          'Class starting soon';


        v_message :=
          format(
            '%s starts in about %s minutes%s.',
            r.subject_name,
            greatest(
              1,
              round(
                extract(
                  epoch
                  from
                  (
                    v_class_at - v_now
                  )
                ) / 60
              )
            ),
            case
              when r.room is not null then
                format(
                  ' in Room %s',
                  r.room
                )
              else
                ''
            end
          );


        if private.emit_smart_reminder(
          p_profile_id,
          'timetable',
          r.id,
          v_reminder_key,
          'class_starting',
          v_class_at,
          v_title,
          v_message,
          'timetable',
          'normal'
        ) then

          v_created :=
            v_created + 1;

        end if;

      end if;

    end loop;

  end if;


  /*
   * ==========================================================
   * ATTENDANCE RISK REMINDERS
   * ==========================================================
   */

  if v_prefs.attendance_notifications
  then

    for r in

      select
        ss.subject_id,
        s.name as subject_name

      from public.student_subjects ss

      inner join public.subjects s
        on s.id = ss.subject_id

      where ss.student_id =
        v_student_id

    loop

      select
        count(*)::integer,
        count(*) filter (
          where ar.status = 'present'
        )::integer

      into
        v_attendance_total,
        v_attendance_present

      from public.attendance_records ar

      inner join public.attendance_sessions ats
        on ats.id = ar.session_id

      where ar.student_id =
        v_student_id

        and ats.subject_id =
          r.subject_id;


      if v_attendance_total > 0 then

        v_attendance_percentage :=
          (
            v_attendance_present::numeric
            /
            v_attendance_total::numeric
          ) * 100;


        if v_attendance_percentage < 75 then

          v_reminder_key :=
            format(
              'attendance:%s:%s',
              r.subject_id,
              v_local_date
            );


          v_title :=
            'Attendance needs attention';


          v_message :=
            format(
              'Your attendance in %s is %.1f%%, below the 75%% target.',
              r.subject_name,
              v_attendance_percentage
            );


          if private.emit_smart_reminder(
            p_profile_id,
            'attendance',
            r.subject_id,
            v_reminder_key,
            'attendance_risk',
            v_now,
            v_title,
            v_message,
            'attendance',
            'urgent'
          ) then

            v_created :=
              v_created + 1;

          end if;

        end if;

      end if;

    end loop;

  end if;


  /*
   * Remove very old reminder bookkeeping.
   */

  delete from public.smart_reminders
  where created_at <
    v_now - interval '90 days';


  return v_created;

end;
$$;


-- Internal only.
revoke execute
on function private.generate_smart_reminders_for_profile(uuid)
from public, anon, authenticated;


-- ============================================================
-- 10. RUN ENGINE FOR CURRENT USER
-- ============================================================

create or replace function public.generate_my_smart_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
begin

  v_profile_id :=
    (select auth.uid());

  if v_profile_id is null then
    raise exception
      'Authentication required.';
  end if;


  return private.generate_smart_reminders_for_profile(
    v_profile_id
  );

end;
$$;


revoke execute
on function public.generate_my_smart_reminders()
from public, anon;


grant execute
on function public.generate_my_smart_reminders()
to authenticated;


-- ============================================================
-- 11. RUN ENGINE FOR ALL STUDENTS
-- ============================================================

create or replace function private.run_smart_reminder_engine()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare

  v_total integer := 0;

  v_created integer;

  r record;

begin

  for r in

    select id

    from public.profiles

    where role = 'student'

  loop

    v_created :=
      private.generate_smart_reminders_for_profile(
        r.id
      );

    v_total :=
      v_total + v_created;

  end loop;


  return v_total;

end;
$$;


revoke execute
on function private.run_smart_reminder_engine()
from public, anon, authenticated;


-- ============================================================
-- 12. CLEANUP OLD DUPLICATE REMINDER RECORDS
-- ============================================================

create index if not exists
  notifications_recipient_created_idx
on public.notifications (
  recipient_profile_id,
  created_at desc
);


create index if not exists
  notifications_unread_idx
on public.notifications (
  recipient_profile_id,
  read_at
);


-- ============================================================
-- END OF PHASE 19 DATABASE MIGRATION
-- ============================================================