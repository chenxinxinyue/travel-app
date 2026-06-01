create table trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  nickname text not null,
  color text not null,
  created_at timestamptz default now()
);

create table spots (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  day_number int not null,
  name text not null,
  address text,
  lat float not null,
  lng float not null,
  poi_id text,
  created_at timestamptz default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  participant_id uuid references participants on delete cascade not null,
  lat float not null,
  lng float not null,
  updated_at timestamptz default now()
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips on delete cascade not null,
  participant_id uuid references participants on delete cascade not null,
  item text not null,
  amount float not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table trips enable row level security;
alter table participants enable row level security;
alter table spots enable row level security;
alter table locations enable row level security;
alter table bills enable row level security;

-- Simple RLS: allow all operations (tighten later)
create policy "allow all" on trips for all using (true);
create policy "allow all" on participants for all using (true);
create policy "allow all" on spots for all using (true);
create policy "allow all" on locations for all using (true);
create policy "allow all" on bills for all using (true);
