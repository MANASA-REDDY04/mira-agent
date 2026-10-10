# MIRA: Setup Guide

Follow this step-by-step guide to set up your Supabase backend, configure your environment variables, and get MIRA running locally.

---

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account.
2. Click **New Project**, select your organization, and give your project a name (e.g., "mira").
3. Create a secure database password (you won't need to memorize it) and choose a region close to you.
4. Wait a couple of minutes for the database to provision.

## 2. Get Your Supabase Keys

Once your project is ready:
1. Go to **Project Settings** (the gear icon on the bottom left).
2. Click on **API** in the sidebar.
3. Under **Project URL**, copy the `URL`. This is your `NEXT_PUBLIC_SUPABASE_URL`.
4. Under **Project API Keys**, you will see two keys:
   - `anon` `public`: Copy this. This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `service_role` `secret`: Click "Reveal" and copy this. This is your `SUPABASE_SERVICE_ROLE_KEY`.

> **⚠️ Security Note:** Never share your `service_role` key or commit it to GitHub. It has admin privileges over your database.

## 3. Run the Database Migration

We have prepared a single SQL file that sets up all tables, triggers, and Row Level Security (RLS) policies.

1. Go to the **SQL Editor** in your Supabase dashboard (the `</>` icon in the sidebar).
2. Click **New Query**.
3. Open the file `supabase/migrations/001_initial.sql` from this codebase and **copy all of its contents**.
4. Paste the contents into the Supabase SQL Editor.
5. Click **Run** (or press `Cmd/Ctrl + Enter`).
6. You should see a "Success" message. Your database schema is now fully created!

## 4. Set up Authentication

1. Go to **Authentication** (the lock icon in the sidebar), then click **Providers**.
2. **Email**: Email is enabled by default. 
   - Expand the **Email** section.
   - Ensure **Confirm email** is toggled **OFF** (for testing purposes) or keep it on if you want users to verify their emails.
   - Ensure **Enable Email signup** is **ON**.
   - Ensure **Enable Magic Link logins** is **ON**.
3. **Site URL & Redirects**:
   - In the Auth sidebar, click **URL Configuration**.
   - Ensure your **Site URL** is set to `http://localhost:3000` for local development.

## 5. Get Your LLM API Key (Google Gemini)

MIRA uses Google's Gemini 2.0 Flash model by default.
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** in the left menu.
4. Click **Create API key** and copy it. This is your `LLM_API_KEY`.

---

## 6. Configure Environment Variables

Now, hook up the keys you gathered to your local codebase:

1. Open the file named `.env.local` in the root of the MIRA folder. *(If it doesn't exist, duplicate `.env.example` and rename the copy to `.env.local`)*.
2. Fill in the values exactly as you copied them:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5c..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5c..."

# LLM 
LLM_PROVIDER="google"
LLM_API_KEY="AIzaSyYourGeminiKeyHere..."
LLM_MODEL="gemini-2.0-flash"
```

## 7. Seed the Database

We have pre-written 40+ Gen-Z terms, 8 archetypes, and quests. You need to inject these into your Supabase database.

Open your terminal in the MIRA folder and run:
```bash
npx tsx supabase/seed.ts
```
*You should see a success message indicating all terms, archetypes, quests, and personas were seeded.*

## 8. Run the App

Everything is now hooked up! Start your local development server:

```bash
npm run dev
```

Open your browser to `http://localhost:3000`. You can now log in with a magic link, complete the onboarding, and talk to MIRA! 🎉
