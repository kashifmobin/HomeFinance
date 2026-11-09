# Data Model

PostgreSQL on the server; the same tables (minus RLS) in Drift/SQLite on the device. UUID primary keys generated on the device. All tables below also carry the **sync columns**:

```
id uuid pk, created_at timestamptz, updated_at timestamptz,
deleted_at timestamptz null, device_id text, version int default 1
```
(Omitted from each table below for brevity.)

On the server every synced table also has `server_seq bigint`, assigned from a global sequence on every insert or update (trigger). It is the pull cursor for sync, so client clock skew cannot lose changes.

## Concepts

- **User**: a person with a login.
- **Profile**: a person in the ledger. Usually a user's own profile; or a **managed child profile** with no login. Money belongs to profiles.
- **Family**: a group of profiles with roles.
- **Account**: a place where money sits (cash, bank, wallet, piggy bank). Owned by a profile (or the family for shared cash).
- **Transaction**: a movement. Types: `expense`, `income`, `transfer`, `adjustment`.
- **Goal**: money set aside for something; has contributions.

## Schema (PostgreSQL)

```sql
create type profile_kind   as enum ('user','managed');
create type family_role    as enum ('owner','parent','adult','teen','child');
create type account_type   as enum ('cash','bank','wallet','card','piggy','other');
create type txn_type       as enum ('expense','income','transfer','adjustment');
create type pay_method     as enum ('cash','card','bank_transfer','jazzcash','easypaisa','other_online','other');
create type purpose_type   as enum ('spend','save','give');       -- spent / saved / charity
create type visibility     as enum ('private','family');
create type goal_scope     as enum ('personal','family');
create type recur_freq     as enum ('daily','weekly','monthly','yearly');

-- Authentication (owned by our backend)
create table users (
  id uuid primary key,
  email citext unique,
  phone text unique,
  password_hash text,                              -- null if OTP/social only
  google_sub text unique,
  apple_sub text unique,
  email_verified_at timestamptz, phone_verified_at timestamptz,
  status text not null default 'active',           -- active | locked | deleted
  locale text default 'en',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table refresh_tokens (
  id uuid primary key,
  user_id uuid not null references users(id),
  device_id uuid,
  token_hash text not null,                        -- never store the raw token
  token_family uuid not null,                      -- reuse of an old token revokes the family
  expires_at timestamptz not null,
  revoked_at timestamptz, replaced_by uuid,
  created_at timestamptz default now(), ip inet, user_agent text
);

create table otp_codes (
  id uuid primary key,
  contact text not null, code_hash text not null,
  attempts int default 0, expires_at timestamptz not null, consumed_at timestamptz
);

create table devices (
  id uuid primary key,
  user_id uuid not null references users(id),
  platform text not null,                          -- android | ios
  push_token text, app_version text, last_seen_at timestamptz
);

create table profile_login_codes (                 -- upgrade a managed profile to its own login
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  code_hash text not null, created_by uuid not null references profiles(id),
  expires_at timestamptz not null, redeemed_at timestamptz
);

create table audit_log (
  id bigserial primary key,
  user_id uuid, profile_id uuid,
  action text not null, entity text, entity_id uuid,
  ip inet, meta jsonb, at timestamptz default now()
);

create table idempotency_keys (
  key text not null, user_id uuid not null,
  response jsonb, created_at timestamptz default now(),
  primary key (key, user_id)
);

-- People
create table profiles (
  id uuid primary key,
  user_id uuid references users(id),               -- null for managed child profiles; set when upgraded to own login
  kind profile_kind not null,
  display_name text not null,
  avatar text,
  birth_date date,
  currency char(3) not null default 'PKR',
  locale text default 'en',
  managed_by uuid references profiles(id),         -- parent for managed profiles
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, device_id text, version int default 1
);

create table families (
  id uuid primary key,
  name text not null,
  created_by uuid not null references profiles(id),
  -- sync columns
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, device_id text, version int default 1
);

create table family_members (
  id uuid primary key,
  family_id uuid not null references families(id),
  profile_id uuid not null references profiles(id),
  role family_role not null,
  default_visibility visibility not null default 'private',  -- parent can force 'family' for children
  joined_at timestamptz default now(),
  unique (family_id, profile_id),
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

create table family_invites (
  id uuid primary key,
  family_id uuid not null references families(id),
  invited_by uuid not null references profiles(id),
  role family_role not null,
  token text unique not null,
  contact text, expires_at timestamptz, accepted_at timestamptz
);

-- Money holders
create table accounts (
  id uuid primary key,
  owner_profile_id uuid not null references profiles(id),
  family_id uuid references families(id),          -- set for shared family accounts
  name text not null,
  type account_type not null,
  provider text,                                   -- 'HBL','JazzCash','Easypaisa',...
  last4 text,                                      -- label only
  currency char(3) not null default 'PKR',
  opening_balance bigint not null default 0,       -- minor units
  held_by uuid references profiles(id),            -- parent holds a child's money
  archived_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, device_id text, version int default 1
);

create table categories (
  id uuid primary key,
  owner_profile_id uuid references profiles(id),   -- null = system default
  parent_id uuid references categories(id),
  name text not null,
  kind txn_type not null check (kind in ('expense','income')),
  icon text, color text,
  purpose purpose_type not null default 'spend',   -- e.g. Charity => 'give'
  is_system boolean default false,
  archived_at timestamptz,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Gifts / occasions
create table occasions (
  id uuid primary key,
  owner_profile_id uuid not null references profiles(id),
  name text not null,                              -- 'Eid-ul-Fitr 2026'
  kind text not null,                              -- eid_fitr, eid_adha, birthday, wedding, other
  occasion_date date not null,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Ledger
create table transactions (
  id uuid primary key,
  profile_id uuid not null references profiles(id),     -- whose money
  type txn_type not null,
  account_id uuid not null references accounts(id),
  to_account_id uuid references accounts(id),           -- for transfers
  amount bigint not null check (amount > 0),            -- minor units, always positive
  currency char(3) not null default 'PKR',
  occurred_on date not null,
  occurred_at timestamptz not null,
  method pay_method not null default 'cash',
  category_id uuid references categories(id),
  purpose purpose_type not null default 'spend',
  note text,                                            -- the "why"
  counterparty text,                                    -- merchant / person / who gave
  occasion_id uuid references occasions(id),
  goal_id uuid,                                         -- FK to goals added below
  bill_id uuid,                                         -- FK to bills added below
  loan_id uuid,                                         -- FK to loans added below
  recurring_id uuid,
  visibility visibility not null default 'private',
  source text not null default 'manual',                -- manual | pasted_text | shared_text | recurring | voice | import
  external_ref text,                                    -- bank/wallet transaction ID for dedupe
  institution text,                                     -- 'nayapay','ubl','easypaisa',... for imported rows
  import_batch_id uuid,                                 -- set for rows created by a statement import
  dedupe_hash text,                                     -- hash of (account, date, amount, normalised description)
  attachment_path text,
  created_by uuid references profiles(id),              -- parent entering for child
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, device_id text, version int default 1,
  check (type <> 'transfer' or to_account_id is not null)
);
create index on transactions (profile_id, occurred_on desc) where deleted_at is null;
create index on transactions (account_id);
create index on transactions (category_id);
create unique index on transactions (account_id, external_ref) where external_ref is not null;

-- Statement imports (CSV/PDF) and, later, open-banking feeds
create table import_batches (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  account_id uuid not null references accounts(id),
  institution text not null,
  source text not null,                         -- csv | pdf | share | open_banking
  period_start date, period_end date,
  rows_total int, rows_imported int, rows_duplicate int,
  opening_balance bigint, closing_balance bigint, -- from the statement, used to verify the import
  status text not null default 'review',        -- review | completed | discarded
  created_at timestamptz default now(), updated_at timestamptz default now(),
  deleted_at timestamptz, device_id text, version int default 1
);
-- the raw statement file is parsed on the device and never uploaded or stored

create table transaction_tags (
  transaction_id uuid references transactions(id),
  tag text, primary key (transaction_id, tag)
);

-- Pending items from pasted/shared text or imported statements, before the user confirms
create table pending_captures (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  raw_text text not null,                       -- pasted text; stays on device; never synced
  parsed jsonb,
  status text not null default 'pending',       -- pending | accepted | ignored
  transaction_id uuid references transactions(id),
  captured_at timestamptz default now()
);

-- Budgets
create table budgets (
  id uuid primary key,
  profile_id uuid references profiles(id),
  family_id uuid references families(id),
  category_id uuid references categories(id),   -- null = total budget
  period_start date not null,                   -- first day of month
  amount bigint not null,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Goals
create table goals (
  id uuid primary key,
  scope goal_scope not null,
  owner_profile_id uuid references profiles(id),
  family_id uuid references families(id),
  name text not null,
  target_amount bigint not null,
  target_date date,
  icon text, image_path text,
  status text not null default 'active',         -- active | achieved | cancelled
  achieved_at timestamptz,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

create table goal_contributions (
  id uuid primary key,
  goal_id uuid not null references goals(id),
  profile_id uuid not null references profiles(id),
  amount bigint not null,                        -- positive = add, negative = withdraw
  from_account_id uuid references accounts(id),
  occurred_on date not null,
  note text,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Bills & recurring
create table bills (
  id uuid primary key,
  owner_profile_id uuid not null references profiles(id),
  family_id uuid references families(id),
  name text not null,
  category_id uuid references categories(id),
  amount bigint,                                 -- null when variable
  repeat_months int not null default 1 check (repeat_months in (1,3,6,12)),
  due_day int check (due_day between 1 and 31),
  next_due date not null,
  remind_days_before int default 3,
  default_account_id uuid references accounts(id),
  for_profile_id uuid references profiles(id),   -- e.g. school fee for a child
  active boolean default true,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

create table recurring_rules (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  template jsonb not null,                       -- fields of the transaction to create
  freq recur_freq not null,
  interval int not null default 1,
  next_run date not null,
  end_date date,
  active boolean default true,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Favourites for one-tap entry
create table favourites (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  label text not null,
  template jsonb not null,                       -- amount, category, method, account
  use_count int default 0, last_used_at timestamptz,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

-- Lend / borrow
create table loans (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  direction text not null check (direction in ('lent','borrowed')),
  person_name text not null,
  principal bigint not null,
  opened_on date not null,
  due_on date,
  note text,
  status text not null default 'open',           -- open | settled
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);
-- repayments are normal transactions with loan_id set

-- Committee (BC) – phase 2
create table committees (
  id uuid primary key,
  profile_id uuid not null references profiles(id),
  name text not null,
  monthly_amount bigint not null,
  members int not null,
  my_turn int,
  start_date date not null,
  updated_at timestamptz default now(), deleted_at timestamptz, device_id text, version int default 1
);

alter table transactions
  add foreign key (goal_id) references goals(id),
  add foreign key (bill_id) references bills(id),
  add foreign key (loan_id) references loans(id),
  add foreign key (recurring_id) references recurring_rules(id);

-- Sync bookkeeping (server)
create table sync_log (
  id bigserial primary key,
  profile_id uuid, table_name text, row_id uuid, op text, at timestamptz default now()
);
```

## Derived values (do not store, compute)

- **Account balance** = `opening_balance`
  + incomes into the account
  − expenses from the account
  − transfers out + transfers in
  ± adjustments
  − goal contributions funded from the account (+ withdrawals).
- **Goal saved amount** = `sum(goal_contributions.amount)`.
- **Budget used** = sum of expenses in category and month.
- **Saved / Spent / Given** = group transactions by `purpose` (goal contributions count as `save`).
- **Held-by-parent balance** for a child = balance of child's accounts where `held_by` is set.

Provide SQL views / Drift queries for these, and unit-test them.

## Authorization rules (enforced in the backend API)

These rules live in the backend `authz` module (see BACKEND.md) and are covered by a permission-matrix test. PostgreSQL RLS may be added later as a second layer.

| Data | Who can read | Who can write |
| --- | --- | --- |
| Own `private` transactions | Owner profile (and its managing parent for managed children) | Owner / managing parent |
| `family` transactions | Family members whose role allows (see below) | Owner / managing parent |
| Child transactions | The child (if has login), managing parent(s), owner | Managing parent; child per role |
| Family goals | All family members | Members add contributions; parents/owner edit goal |
| Family bills | Owner, parents, adults | Owner, parents |
| Accounts | Owner profile; family accounts: family members | Owner |
| Invites | Family owner/parents | Owner/parents |

Role capabilities:
- **owner/parent:** manage family, see all `family`-visible data and managed children's data, create goals/bills.
- **adult:** own data, shared family data, family goals/bills (read), contribute.
- **teen:** own data, restricted view of family (goals), parent can see teen's `family`-visible entries only if default visibility says so.
- **child:** own simple data, own goals, family goals (progress only).

**Managed → own login:** a parent creates a one-time code for a managed profile; the child signs up and redeems it, which sets `profiles.user_id` on the existing profile. History and accounts stay; the parent keeps oversight according to the role and visibility defaults.

## Default seed
System categories listed in FEATURES.md; default accounts proposed at onboarding (Cash, Bank, Wallet); default currency PKR; payment methods enumerated above.

## Migrations
- Server: Prisma migrations in `backend/prisma/migrations/` (with custom SQL for enums, partial indexes, check constraints and triggers), never edit applied migrations; changes stay backward compatible for one release so older app versions keep working.
- Device: Drift `schemaVersion` + `MigrationStrategy`, with tests that upgrade from every earlier version.
