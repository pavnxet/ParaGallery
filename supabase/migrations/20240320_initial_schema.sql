-- Create albums table
create table albums (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add album_id to photos
alter table photos add column album_id uuid references albums(id);

-- Add is_favorite to photos
alter table photos add column is_favorite boolean default false;
