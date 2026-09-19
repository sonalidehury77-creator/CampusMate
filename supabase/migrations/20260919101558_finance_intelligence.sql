-- ============================================================
-- CampusMate
-- Phase 21 — Finance & Expense Intelligence
-- ============================================================


-- ============================================================
-- 1. EXPENSE CATEGORIES
-- ============================================================

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  description text,

  created_at timestamptz not null default now(),

  constraint expense_categories_name_unique
    unique (name)
);


-- ============================================================
-- 2. RECURRING EXPENSES
-- ============================================================

create table if not exists public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  category_id uuid not null
    references public.expense_categories(id)
    on delete restrict,

  title text not null,

  amount numeric(12,2) not null
    check (amount > 0),

  frequency text not null default 'monthly'
    check (
      frequency in (
        'daily',
        'weekly',
        'monthly',
        'yearly'
      )
    ),

  next_due_date date not null,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. EXPENSES
-- ============================================================

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  category_id uuid not null
    references public.expense_categories(id)
    on delete restrict,

  recurring_expense_id uuid
    references public.recurring_expenses(id)
    on delete set null,

  amount numeric(12,2) not null
    check (amount > 0),

  title text not null,

  description text,

  expense_date date not null default current_date,

  payment_method text not null default 'other'
    check (
      payment_method in (
        'cash',
        'upi',
        'card',
        'bank_transfer',
        'other'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. MONTHLY BUDGETS
-- ============================================================

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.students(id)
    on delete cascade,

  category_id uuid
    references public.expense_categories(id)
    on delete cascade,

  month_start date not null,

  amount numeric(12,2) not null
    check (amount > 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint budgets_month_start_first_day
    check (
      month_start = date_trunc(
        'month',
        month_start::timestamp
      )::date
    )
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

create index if not exists expenses_student_date_idx
on public.expenses (
  student_id,
  expense_date desc
);

create index if not exists expenses_student_category_idx
on public.expenses (
  student_id,
  category_id
);

create index if not exists expenses_date_idx
on public.expenses (
  expense_date desc
);

create index if not exists recurring_expenses_student_idx
on public.recurring_expenses (
  student_id,
  active
);

create index if not exists budgets_student_month_idx
on public.budgets (
  student_id,
  month_start desc
);


-- ============================================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists recurring_expenses_updated_at
on public.recurring_expenses;

create trigger recurring_expenses_updated_at
before update on public.recurring_expenses
for each row
execute function public.handle_updated_at();


drop trigger if exists expenses_updated_at
on public.expenses;

create trigger expenses_updated_at
before update on public.expenses
for each row
execute function public.handle_updated_at();


drop trigger if exists budgets_updated_at
on public.budgets;

create trigger budgets_updated_at
before update on public.budgets
for each row
execute function public.handle_updated_at();


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table public.expense_categories enable row level security;

alter table public.recurring_expenses enable row level security;

alter table public.expenses enable row level security;

alter table public.budgets enable row level security;


-- ============================================================
-- 8. CATEGORY ACCESS
-- ============================================================

drop policy if exists "Authenticated users can view expense categories"
on public.expense_categories;

create policy "Authenticated users can view expense categories"
on public.expense_categories
for select
to authenticated
using (true);


-- ============================================================
-- 9. RECURRING EXPENSE POLICIES
-- ============================================================

drop policy if exists "Students can view own recurring expenses"
on public.recurring_expenses;

create policy "Students can view own recurring expenses"
on public.recurring_expenses
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = recurring_expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can create own recurring expenses"
on public.recurring_expenses;

create policy "Students can create own recurring expenses"
on public.recurring_expenses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = recurring_expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can update own recurring expenses"
on public.recurring_expenses;

create policy "Students can update own recurring expenses"
on public.recurring_expenses
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = recurring_expenses.student_id
      and s.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = recurring_expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can delete own recurring expenses"
on public.recurring_expenses;

create policy "Students can delete own recurring expenses"
on public.recurring_expenses
for delete
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = recurring_expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


-- ============================================================
-- 10. EXPENSE POLICIES
-- ============================================================

drop policy if exists "Students can view own expenses"
on public.expenses;

create policy "Students can view own expenses"
on public.expenses
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can create own expenses"
on public.expenses;

create policy "Students can create own expenses"
on public.expenses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can update own expenses"
on public.expenses;

create policy "Students can update own expenses"
on public.expenses
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = expenses.student_id
      and s.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can delete own expenses"
on public.expenses;

create policy "Students can delete own expenses"
on public.expenses
for delete
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = expenses.student_id
      and s.profile_id = (select auth.uid())
  )
);


-- ============================================================
-- 11. BUDGET POLICIES
-- ============================================================

drop policy if exists "Students can view own budgets"
on public.budgets;

create policy "Students can view own budgets"
on public.budgets
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = budgets.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can create own budgets"
on public.budgets;

create policy "Students can create own budgets"
on public.budgets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.students s
    where s.id = budgets.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can update own budgets"
on public.budgets;

create policy "Students can update own budgets"
on public.budgets
for update
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = budgets.student_id
      and s.profile_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.students s
    where s.id = budgets.student_id
      and s.profile_id = (select auth.uid())
  )
);


drop policy if exists "Students can delete own budgets"
on public.budgets;

create policy "Students can delete own budgets"
on public.budgets
for delete
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.id = budgets.student_id
      and s.profile_id = (select auth.uid())
  )
);


-- ============================================================
-- 12. DEFAULT EXPENSE CATEGORIES
-- ============================================================

insert into public.expense_categories (
  name,
  description
)
values
  ('Food', 'Meals, snacks and beverages'),
  ('Transport', 'Bus, auto, taxi and other travel'),
  ('Education', 'Books, stationery and academic expenses'),
  ('Hostel', 'Hostel and accommodation expenses'),
  ('Entertainment', 'Movies, games and entertainment'),
  ('Shopping', 'Clothing and personal shopping'),
  ('Health', 'Healthcare and wellness expenses'),
  ('Bills', 'Phone, internet and other bills'),
  ('Other', 'Other personal expenses')
on conflict (name)
do nothing;


-- ============================================================
-- 13. COMMENTS
-- ============================================================

comment on table public.expenses is
'Personal student expenses used by CampusMate Finance Intelligence.';

comment on table public.budgets is
'Monthly personal budgets for CampusMate Finance Intelligence.';

comment on table public.recurring_expenses is
'Recurring student expenses used for future intelligent reminders.';

comment on table public.expense_categories is
'Shared expense categories available to authenticated users.';