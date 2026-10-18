# 🐳 Vui học cùng bé

Web bài tập tương tác ôn **âm – vần – thanh** cho học sinh tiểu học. React + TypeScript + Vite + Tailwind + Supabase.

## Cài đặt Supabase (1 lần)
1. Dashboard → **SQL Editor** → dán toàn bộ `supabase/schema.sql` → **Run** (chạy lại nhiều lần vẫn an toàn).
2. **Authentication → Sign In / Providers → Email** → tắt **Confirm email**.
3. Đăng ký tài khoản giáo viên trên web, rồi chạy trong SQL Editor:
   ```sql
   update public.profiles set role = 'teacher' where username = 'ten_dang_nhap';
   ```

## Chạy local
```bash
cp .env.example .env.local   # điền URL + publishable key
npm install
npm run dev                  # http://localhost:5173
npm test                     # unit test
```

## Chạy bằng Docker
```bash
cp .env.example .env         # điền URL + key
docker compose up --build    # http://localhost:8080
```

## CI/CD (GitHub Actions – `.github/workflows/ci.yml`)
- Mỗi push/PR: lint → test → build → build Docker image (push lên `ghcr.io` khi push vào `main`).
- Push vào `main`: deploy Vercel production.

Secrets cần tạo trong GitHub → Settings → Secrets → Actions:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
(2 ID cuối lấy từ `.vercel/project.json` sau khi chạy `npx vercel link`).

## Vercel
Trong Project → Settings → Environment Variables thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
`vercel.json` đã cấu hình rewrite để các route SPA (`/am`, `/bai/50`…) không bị 404.
