-- Tạo sẵn tài khoản giáo viên (đã kích hoạt, không cần xác nhận email).
-- Chạy trong Supabase Dashboard → SQL Editor, SAU KHI đã chạy schema.sql.
-- Đăng nhập trên web bằng:  tên đăng nhập = giaovien   mật khẩu = GiaoVien@2026
-- Muốn đổi tên/mật khẩu: sửa 2 biến v_username / v_password bên dưới.
do $$
declare
  v_username text := 'giaovien';
  v_password text := 'GiaoVien@2026';
  v_email    text := v_username || '@bienchu.local';
  v_id       uuid;
begin
  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('username', v_username, 'display_name', 'Cô giáo'),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id, v_id::text,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  else
    -- đã có thì đặt lại mật khẩu + kích hoạt
    update auth.users
       set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = v_id;
  end if;

  -- trigger on_auth_user_created đã tạo profile; phòng trường hợp chưa có thì tạo
  insert into public.profiles (id, username, display_name, role)
  values (v_id, v_username, 'Cô giáo', 'teacher')
  on conflict (id) do update set role = 'teacher';
end $$;

select username, display_name, role from public.profiles where role = 'teacher';
