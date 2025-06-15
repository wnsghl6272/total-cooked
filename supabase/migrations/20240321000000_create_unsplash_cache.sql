create table if not exists public.unsplash_cache (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  image_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on query for faster lookups
create index if not exists unsplash_cache_query_idx on public.unsplash_cache (query);

-- Enable RLS
alter table public.unsplash_cache enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.unsplash_cache
  for select using (true);

create policy "Enable insert for authenticated users only" on public.unsplash_cache
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.unsplash_cache
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.unsplash_cache
  for delete using (auth.role() = 'authenticated'); 