create table requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  submitted_by text not null,
  request_type text not null,
  notes text,
  people jsonb,
  property_uuids text[],
  exclude_mode boolean default false,
  status text default 'pending',
  assigned_to text
);
