# Step-by-step setup: use your expense tracker on all your devices

Your app now saves expenses in the cloud instead of only on one device. To turn that on, you do a one-time setup with a free website called Supabase. After that, you sign in on each device and see the same list everywhere.

---

## What you need

- A web browser
- Your expense-tracker project folder on your computer
- About 10 minutes

---

## Step 1: Create a free Supabase account

1. Open your browser and go to: **https://app.supabase.com**
2. Click **Sign up** (or **Start your project**).
3. Sign up with your email, or with Google/GitHub if you prefer.
4. You might need to confirm your email. Check your inbox and click the link if Supabase sends one.

**Why:** Supabase is the service that will store your expenses on the internet so every device can read and update the same list.

---

## Step 2: Create a new project

1. After you’re logged in, click **New project**.
2. **Organization:** If they ask, use the default (or create one). It’s just for grouping projects.
3. **Name:** Type something like **Expense Tracker** (or any name you like).
4. **Database password:** Supabase will show a password. **Copy it and save it somewhere safe** (e.g. a notes app). You might need it later for advanced settings. You don’t need to type it into the expense tracker app.
5. **Region:** Pick the one closest to you (e.g. “West EU” or “East US”).
6. Click **Create new project**.
7. Wait until the project is ready (usually 1–2 minutes). You’ll see a dashboard when it’s done.

**Why:** Each “project” is like one backend for your app. This project will hold your expense database and handle sign-in.

---

## Step 3: Get your project’s “keys”

The app needs two pieces of information to talk to your Supabase project. Supabase calls them “API keys”; you can think of them as a safe way for the app to identify your project.

1. In the left sidebar of the Supabase dashboard, click the **Settings** icon (gear/cog).
2. Click **API** in the settings menu.
3. On the API page you’ll see:
   - **Project URL** — a long web address like `https://abcdefgh.supabase.co`
   - **Project API keys** — one of them is called **anon** and **public** (it’s safe to use in the app).
4. Do this:
   - Copy the **Project URL** and save it somewhere (e.g. Notepad).
   - Copy the **anon public** key (the long string under “anon public”) and save it too.

**Why:** The app uses the URL to know *which* project to use, and the anon key to get permission to read/write your data (only for people who are signed in).

---

## Step 4: Put the keys into your app

Your app reads these keys from a file named `.env` in the expense-tracker folder. That file is not shared with anyone (it’s in `.gitignore`), so your keys stay private.

1. Open your **expense-tracker** folder (the one that has `package.json` and `src` inside it).
2. Look for a file named **`.env.example`**.  
   - If you don’t see it, it might be hidden. In your file manager you may need to turn on “Show hidden files”.  
   - Or open the folder in Cursor/VS Code; you should see `.env.example` in the file list.
3. **Copy** the file `.env.example` and **paste** it in the same folder. **Rename the copy** to exactly: **`.env`**  
   So you now have both `.env.example` and `.env`.
4. Open **`.env`** in your editor. It will look something like:
   ```text
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Replace** the placeholder values with your real ones:
   - Where it says `https://your-project-id.supabase.co`, **delete that** and **paste** the **Project URL** you copied in Step 3.
   - Where it says `your-anon-key`, **delete that** and **paste** the **anon public** key you copied in Step 3.
6. Save the file. Make sure there are no extra spaces before or after the `=` and no quotes around the values unless the example had quotes.

**Why:** The app only connects to Supabase if it finds these two values. Without them, it shows “setup required” and can’t save to the cloud.

---

## Step 5: Create the “expenses” table in Supabase

Supabase stores your data in tables (like a spreadsheet). Your app expects a table named **expenses** with the right columns. You create it by running a short script once.

1. In the Supabase dashboard (in the browser), in the left sidebar, click **SQL Editor**.
2. Click **New query** (or “+” to create a new query).
3. Open your expense-tracker folder on your computer. Go into the **supabase** folder and open the file **schema.sql** in your editor.
4. **Select all** the text in `schema.sql` (Ctrl+A or Cmd+A) and **copy** it.
5. Go back to the Supabase **SQL Editor** in the browser. **Paste** that text into the big empty box.
6. Click **Run** (or “Run query”) at the bottom.
7. You should see a success message (e.g. “Success. No rows returned”). That’s normal — it just means the table and security rules were created.

**Why:** Until this table exists, the app has nowhere to save expenses. The script also sets up “Row Level Security” so each user only sees their own rows.

---

## Step 6: Run your app and sign up

1. In a terminal, go to your expense-tracker folder:
   ```bash
   cd expense-tracker
   ```
2. If the app isn’t already running, start it:
   ```bash
   npm run dev
   ```
3. Open the link it shows (usually **http://localhost:5173**) in your browser.
4. You should now see a **Sign in / Sign up** screen instead of “Cloud sync not configured”.
5. Click **“Need an account? Sign up”** and enter:
   - Your **email**
   - A **password** (at least 6 characters)
6. Click **Sign up**.
7. Depending on Supabase’s settings, you might get an email to **confirm your email**. If so, open the email and click the link, then come back to the app and **Sign in** with the same email and password.
8. After you’re signed in, you should see your expense tracker. Try **Add expense** — that expense is now saved in Supabase and will appear on any device where you sign in with the same account.

**Why:** Signing up creates your user account in Supabase. Every expense is tied to that account, so the same list is available on your phone, tablet, or another computer once you sign in there.

---

## Using the app on another device

1. On the other device, open the same app (e.g. if you deployed it, open that URL; or run `npm run dev` on that machine and open localhost).
2. On the login screen, click **Sign in** (not Sign up).
3. Enter the **same email and password** you used when you signed up.
4. You should see the same list of expenses. Any new expense you add will sync to the other device after you refresh or reopen the app.

---

## Quick checklist

- [ ] Signed up at app.supabase.com  
- [ ] Created a new project and waited for it to be ready  
- [ ] Copied Project URL and anon public key from Settings → API  
- [ ] Created `.env` from `.env.example` and pasted the URL and key  
- [ ] Ran the `supabase/schema.sql` script in Supabase SQL Editor  
- [ ] Restarted the app (`npm run dev`) and opened it in the browser  
- [ ] Signed up with email/password and (if needed) confirmed email  
- [ ] Added a test expense and saw it on the screen  

If something doesn’t work, check:  
- No typos in `.env`, and the file is named exactly `.env` in the project root.  
- You ran the full `schema.sql` script and it said success.  
- You’re using the **anon public** key, not the “service_role” key.
