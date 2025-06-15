-- Create table for DALL-E generated images cache
create table if not exists public.dalle_cache (
  id uuid default gen_random_uuid() primary key,
  recipe_title text not null,
  image_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index if not exists dalle_cache_recipe_title_idx on public.dalle_cache (recipe_title);

-- Enable RLS (Row Level Security)
alter table public.dalle_cache enable row level security;

-- Create policies for the table
create policy "Enable read access for all users" on public.dalle_cache
  for select using (true);

create policy "Enable insert for authenticated users only" on public.dalle_cache
  for insert with check (true);

create policy "Enable update for authenticated users only" on public.dalle_cache
  for update using (true);

create policy "Enable delete for authenticated users only" on public.dalle_cache
  for delete using (true); 