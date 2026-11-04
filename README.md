# 0xPayload Blog

Inisiasi blog sederhana berbasis **Payload CMS 3.x** + **Next.js 15 (App Router)** dengan database **PostgreSQL (Supabase)**.

---

## 🚀 Fitur Utama

- **Payload CMS 3.x Native Next.js Integration**: CMS terintegrasi langsung di dalam Next.js App Router (`/admin` dan API `/api`).
- **PostgreSQL Adapter**: Terhubung langsung ke Supabase PostgreSQL database dengan connection pooling yang telah disesuaikan.
- **Sistem Blog Sederhana & Lengkap**:
  - **Tags**: Pengelompokan artikel berbasis Tag (bukan hierarki kategori), auto-slug generator, dan relasi *many-to-many* ke Posts.
  - **Standard Blog Fields**:
    - `title` (Judul) & auto `slug`
    - `excerpt` (Ringkasan singkat)
    - `coverImage` (Upload media terintegrasi)
    - `content` (Rich text modern menggunakan Lexical Editor)
    - `tags` (Relasi ke koleksi Tags)
    - `author` (Relasi ke koleksi Users)
    - `status` (`draft` / `published`) & `publishedAt`
    - `meta` (SEO Title, Description, OG Image)
  - **Draft & Versioning**: Dilengkapi autosave dan draft publishing.
- **Frontend Blog Terintegrasi**:
  - `/blog`: Daftar seluruh artikel yang dipublikasikan.
  - `/blog/[slug]`: Halaman detail artikel dengan RichText Lexical renderer.
  - `/blog/tag/[tagSlug]`: Filter artikel berdasarkan tag tertentu.

---

## 📁 Struktur Direktori

```text
├── src/
│   ├── app/
│   │   ├── (frontend)/           # Frontend blog
│   │   │   ├── blog/
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   ├── tag/[tagSlug]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── (payload)/            # Payload CMS internal routes
│   │       ├── admin/
│   │       │   ├── [[...segments]]/page.tsx
│   │       │   └── importMap.js
│   │       ├── api/
│   │       │   ├── [...slug]/route.ts
│   │       │   └── graphql/route.ts
│   │       ├── custom.scss
│   │       └── layout.tsx
│   ├── collections/              # Skema Koleksi Payload
│   │   ├── Posts.ts
│   │   ├── Tags.ts
│   │   ├── Media.ts
│   │   └── Users.ts
│   ├── lib/
│   │   └── payload.ts            # Payload local API client (cached)
│   └── payload.config.ts         # Konfigurasi utama Payload CMS
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## ⚙️ Langkah Instalasi & Menjalankan

### 1. Salin Konfigurasi Environment

Salin `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan URI koneksi Supabase Anda:

```env
# Ambil dari: Supabase Dashboard > Project Settings > Database > Connection string > URI (Port 6543 / Pooler disarankan)
DATABASE_URI=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres

# String rahasia acak untuk sesi & otentikasi Payload
PAYLOAD_SECRET=ganti-dengan-string-rahasia-acak-minimal-32-karakter

# URL server lokal
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

> **Catatan Supabase**: 
> - Gunakan port **6543** (Transaction Pooler) atau port **5432** (Session mode / direct).
> - Payload mengelola tabel dan skemanya sendiri secara otomatis saat pertama kali dijalankan.

### 2. Install Dependensi

Jalankan perintah instalasi melalui terminal Anda:

```bash
npm install
```

### 3. Jalankan Server Pengembangan

```bash
npm run dev
```

Buka di browser:
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Saat pertama dibuka, Anda akan diminta membuat akun admin pertama)*.
- **Frontend Blog**: [http://localhost:3000/blog](http://localhost:3000/blog)
- **GraphQL API / Playground**: [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)
- **REST API**: [http://localhost:3000/api/posts](http://localhost:3000/api/posts)

pg_dump postgresql://postgres.htzusxfihxfmsbearjrr:xxxxxxxxxxx@aws-0-eu-west-1.pooler.supabase.com:6543/postgres > backup.sql

pg_dump postgresql://postgres:xxxxxxxxxxx@db.htzusxfihxfmsbearjrr.supabase.co:5432/postgres > backup.sql
pg_dump --data-only --exclude-table=payload_migrations "postgresql://postgres.htzusxfihxfmsbearjrr:xxxxxxxxxxx@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" > data.sql

psql "postgresql://postgres.htzusxfihxfmsbearjrr:xxxxxxxxxxx@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 < data.sql

psql "postgresql://postgres.htzusxfihxfmsbearjrr:xxxxxxxxxxx@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" -c "select count(*) from public.tools"

psql "postgresql://postgres.htzusxfihxfmsbearjrr:xxxxxxxxxxx@aws-0-eu-west-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 < data_public.sql