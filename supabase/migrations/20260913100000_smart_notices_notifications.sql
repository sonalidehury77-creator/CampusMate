-- ============================================================
-- CampusMate
-- Phase 14: Smart Notices & Intelligent Notifications
-- ============================================================


-- ============================================================
-- 1. NOTICE ATTACHMENT STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'notices',
  'notices',
  false,
  26214400,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do nothing;


-- ============================================================
-- 2. NOTICE ATTACHMENT STORAGE POLICIES
-- ============================================================

drop policy if exists "Notice attachments authenticated read"
on storage.objects;

create policy "Notice attachments authenticated read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'notices'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select public.is_admin())
    or (select public.is_faculty())
  )
);


drop policy if exists "Notice attachments authorized upload"
on storage.objects;

create policy "Notice attachments authorized upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'notices'
  and (
    (
      (select public.is_admin())
      or (select public.is_faculty())
    )
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
);


drop policy if exists "Notice attachments authorized update"
on storage.objects;

create policy "Notice attachments authorized update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'notices'
  and (
    (select public.is_admin())
    or (
      (select public.is_faculty())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  )
)
with check (
  bucket_id = 'notices'
  and (
    (select public.is_admin())
    or (
      (select public.is_faculty())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  )
);


drop policy if exists "Notice attachments authorized delete"
on storage.objects;

create policy "Notice attachments authorized delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'notices'
  and (
    (select public.is_admin())
    or (
      (select public.is_faculty())
      and (storage.foldername(name))[1] = (select auth.uid())::text
    )
  )
);


-- ============================================================
-- 3. NOTICE SEARCH / SORT INDEXES
-- ============================================================

create index if not exists notices_status_published_at_idx
on public.notices (status, published_at desc);

create index if not exists notices_priority_deadline_idx
on public.notices (priority, deadline);

create index if not exists notices_category_idx
on public.notices (category);

create index if not exists notifications_recipient_created_idx
on public.notifications (
  recipient_profile_id,
  created_at desc
);

create index if not exists notifications_unread_idx
on public.notifications (
  recipient_profile_id,
  read_at,
  created_at desc
);


-- ============================================================
-- 4. AUTOMATIC NOTICE → NOTIFICATION FUNCTION
-- ============================================================

create or replace function public.notify_published_notice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  /*
    Only create notifications when a notice becomes published.
  */

  if (
    new.status = 'published'
    and (
      tg_op = 'INSERT'
      or old.status is distinct from 'published'
    )
  ) then

    insert into public.notifications (
      recipient_profile_id,
      title,
      message,
      type,
      priority,
      related_entity_type,
      related_entity_id
    )
    select
      p.id,

      case
        when new.priority = 'urgent'
          then 'Urgent campus notice'

        when new.priority = 'important'
          then 'Important campus notice'

        else
          'New campus notice'
      end,

      new.title,

      'notice',
      new.priority,
      'notice',
      new.id

    from public.profiles p

    left join public.notification_preferences np
      on np.profile_id = p.id

    where
      p.role = 'student'
      and coalesce(
        np.notice_notifications,
        true
      ) = true;

  end if;

  return new;

end;
$$;


-- ============================================================
-- 5. NOTICE PUBLISH TRIGGER
-- ============================================================

drop trigger if exists on_notice_published
on public.notices;

create trigger on_notice_published
after insert or update of status
on public.notices
for each row
execute function public.notify_published_notice();


-- ============================================================
-- 6. DEFAULT NOTIFICATION PREFERENCES FUNCTION
-- ============================================================

create or replace function public.ensure_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.notification_preferences (
    profile_id
  )
  values (
    new.id
  )
  on conflict (profile_id)
  do nothing;

  return new;

end;
$$;


-- ============================================================
-- 7. CREATE DEFAULT PREFERENCES FOR NEW PROFILES
-- ============================================================

drop trigger if exists on_profile_notification_preferences
on public.profiles;

create trigger on_profile_notification_preferences
after insert
on public.profiles
for each row
execute function public.ensure_notification_preferences();


-- ============================================================
-- 8. BACKFILL PREFERENCES FOR EXISTING PROFILES
-- ============================================================

insert into public.notification_preferences (
  profile_id
)
select
  p.id
from public.profiles p
where not exists (
  select 1
  from public.notification_preferences np
  where np.profile_id = p.id
);


-- ============================================================
-- 9. HELPER FUNCTION FOR NOTICE DEADLINE REMINDERS
-- ============================================================

/*
  IMPORTANT:
  The database does not expose a public.notice_priority
  PostgreSQL type.

  Therefore p_priority is intentionally TEXT here.

  The value is checked before insertion so only:
    urgent
    important
    normal

  can be passed into the notifications table.
*/

create or replace function public.create_notice_deadline_reminder(
  p_profile_id uuid,
  p_notice_id uuid,
  p_title text,
  p_message text,
  p_priority text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  notification_id uuid;
begin

  -- ----------------------------------------------------------
  -- Validate priority
  -- ----------------------------------------------------------

  if p_priority not in (
    'urgent',
    'important',
    'normal'
  ) then

    raise exception
      'Invalid notification priority: %',
      p_priority;

  end if;


  -- ----------------------------------------------------------
  -- Prevent duplicate reminder within 24 hours
  -- ----------------------------------------------------------

  select n.id
  into notification_id

  from public.notifications n

  where
    n.recipient_profile_id = p_profile_id

    and n.related_entity_type =
      'notice_deadline'

    and n.related_entity_id =
      p_notice_id

    and n.created_at >=
      now() - interval '24 hours'

  order by n.created_at desc

  limit 1;


  if notification_id is not null then
    return notification_id;
  end if;


  -- ----------------------------------------------------------
  -- Create reminder notification
  -- ----------------------------------------------------------

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
    'reminder',
    p_priority,
    'notice_deadline',
    p_notice_id
  )

  returning id
  into notification_id;


  return notification_id;

end;
$$;


-- ============================================================
-- END PHASE 14 DATABASE ENHANCEMENT
-- ============================================================