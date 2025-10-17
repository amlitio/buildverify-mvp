# 🚀 Quick Start Guide (5 Minutes)

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] OpenAI API key ready
- [ ] Supabase account created

---

## Step 1: Install Dependencies (2 min)

```bash
cd buildverify-mvp/frontend
npm install
```

---

## Step 2: Setup Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: "BuildVerify", Set password, Create
3. Go to SQL Editor → New Query
4. Copy/paste entire `supabase-schema.sql` file
5. Click RUN
6. Go to Settings → API → Copy:
   - Project URL
   - anon public key
   - service_role key

---

## Step 3: Configure Environment (1 min)

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_key
```

---

## Step 4: Run It! (10 sec)

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Step 5: Test (30 sec)

1. Sign up at `/signup`
2. Go to Dashboard
3. Click "Upload Invoice"
4. Upload one of the sample PDFs
5. Watch AI analyze! 🎉

---

## 🎯 What to Test First

### Test Invoice Upload
Use the provided `F24786.pdf` or `F21094.pdf`

### Expected Results:
- ✅ Invoice data extracted
- ⚠️ Crew hour discrepancies flagged
- ⚠️ Mobilization fees questioned
- 📊 Confidence score: 82-94%

---

## 🔧 Common First-Time Issues

### "Can't connect to Supabase"
→ Check `.env.local` has correct URL and keys

### "OpenAI API error"
→ Verify key starts with `sk-` and has credits

### "Module not found"
→ Run `npm install` again

---

## ✅ You're Ready When You See:

1. Login page loads
2. Can create account
3. Dashboard shows up
4. Can upload files
5. AI analysis completes

---

## 📞 Need Help?

Check the main README.md for detailed troubleshooting!

---

**Time to first working prototype: ~5 minutes** ⚡
