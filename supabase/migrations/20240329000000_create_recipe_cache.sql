-- Create recipe cache table
create table if not exists recipe_cache (
  id uuid default gen_random_uuid() primary key,
  cache_key text not null unique,
  recipe_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index if not exists recipe_cache_cache_key_idx on recipe_cache (cache_key);

-- Add RLS policies
alter table recipe_cache enable row level security;

-- Create RLS policies
create policy "Enable read access for all users" on recipe_cache
  for select using (true);

create policy "Enable insert for service role" on recipe_cache
  for insert with check (true);

create policy "Enable update for service role" on recipe_cache
  for update using (true);

create policy "Enable delete for service role" on recipe_cache
  for delete using (true);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_recipe_cache_updated_at
  before update on recipe_cache
  for each row
  execute function update_updated_at_column(); 