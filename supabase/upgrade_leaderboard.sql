-- Chỉ thêm tính năng Đua rank cho database đã chạy schema.sql trước đây.
-- (Chạy lại toàn bộ schema.sql cũng được – file đó an toàn khi chạy nhiều lần.)
-- ============ ĐUA RANK (bảng xếp hạng) ============
-- Học sinh không đọc được attempts của bạn khác (RLS) → hàm security definer chỉ trả tên + tổng sao.
-- p_days = null: mọi lúc; 7: tuần này.
create or replace function public.leaderboard(p_days int default null)
returns table (user_id uuid, display_name text, username text, stars bigint, exercises bigint)
language sql stable security definer set search_path = public as $$
  select p.id, coalesce(p.display_name, p.username), p.username, sum(b.best)::bigint, count(*)::bigint
  from public.profiles p
  join (
    select a.user_id, a.exercise_id, max(a.stars) as best
    from public.attempts a
    where p_days is null or a.created_at > now() - make_interval(days => p_days)
    group by a.user_id, a.exercise_id
  ) b on b.user_id = p.id
  where p.role = 'student'
  group by p.id
  order by 4 desc, 5 desc, 2
  limit 50;
$$;
revoke all on function public.leaderboard(int) from public, anon;
grant execute on function public.leaderboard(int) to authenticated;
