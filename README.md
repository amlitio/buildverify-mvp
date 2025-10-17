# 🚀 BuildVerify MVP - Complete Setup Guide

## 📋 What You're Building

A production-ready AI-powered construction invoice verification system that:
- ✅ Extracts data from invoices, work orders, and photos using GPT-4 Vision
- ✅ Verifies invoices for discrepancies (crew hours, mobilization fees, etc.)
- ✅ Stores results in Supabase with blockchain-ready architecture
- ✅ Beautiful, modern UI with authentication
- ✅ Mobile-responsive design

---

## 🎯 Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase
- **AI:** OpenAI GPT-4 Vision API
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **Deployment:** Vercel (recommended)

---

## 📦 Prerequisites

Before starting, make sure you have:

1. **Node.js 18+** installed ([Download](https://nodejs.org/))
2. **Git** installed
3. **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))
4. **Supabase Account** (Free tier works) ([Sign up](https://supabase.com))

---

## 🚀 Step-by-Step Setup

### Step 1: Clone & Install Dependencies

```bash
# Navigate to the project
cd buildverify-mvp/frontend

# Install dependencies
npm install

# This will install:
# - Next.js, React
# - Supabase client
# - OpenAI SDK
# - Tailwind CSS
# - All UI components
```

**Expected time:** 2-3 minutes

---

### Step 2: Setup Supabase Database

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** BuildVerify
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

#### 2.2 Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the ENTIRE contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **RUN** (bottom right)

You should see: ✅ "Success. No rows returned"

#### 2.3 Get Your Supabase Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
   - **service_role key** (click "Reveal" first)

---

### Step 3: Setup OpenAI API

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it: "BuildVerify MVP"
4. Copy the key (starts with `sk-...`)

**Important:** You'll need at least $5 in your OpenAI account. Each invoice verification costs ~$0.10-0.20.

---

### Step 4: Configure Environment Variables

1. In the `frontend` folder, create `.env.local`:

```bash
cd buildverify-mvp/frontend
cp .env.example .env.local
```

2. Edit `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-...your-openai-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Pro tip:** Never commit `.env.local` to git (it's already in `.gitignore`)

---

### Step 5: Run the Application

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the BuildVerify login page! 🎉

---

## 🧪 Testing the MVP

### Create Your First Account

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Sign up with:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** test123456

3. You'll be redirected to the dashboard

### Upload a Test Invoice

1. Click **"Upload Invoice"**
2. Upload the sample invoices from the original PDFs:
   - `F24786.pdf` (Christmas Design invoice)
   - `F21094.pdf` (FL Pole Setters invoice)

3. Watch the AI analyze in real-time:
   - "Uploading documents..."
   - "Extracting invoice data..."
   - "Analyzing with AI..."
   - "Complete!"

4. View results with:
   - ✅ Verified items
   - ⚠️ Flagged discrepancies
   - 💰 Potential overcharges
   - 📊 Confidence score

---

## 🎨 Key Features Included

### 1. Authentication System
- Sign up / Login / Logout
- Secure session management
- Protected routes

### 2. Dashboard
- Invoice statistics
- Recent invoices table
- Quick actions

### 3. Invoice Upload
- Drag-and-drop interface
- Multiple file types (PDF, images)
- Progress tracking
- Real-time AI analysis

### 4. AI Verification
- Extracts invoice data automatically
- Cross-references work orders
- Analyzes job site photos
- Flags discrepancies
- Calculates confidence scores

### 5. Results Display
- Status badges (Verified, Flagged, Disputed)
- Detailed findings breakdown
- Recommendations
- Photo gallery

---

## 🔧 Customization Guide

### Change Colors

Edit `tailwind.config.js`:

```js
colors: {
  primary: {
    500: '#your-color', // Main color
    600: '#your-darker-color',
  }
}
```

### Add New Verification Rules

Edit `frontend/lib/ai-service.ts`:

```typescript
// Add new check in verifyInvoice() method
if (condition) {
  findings.yourNewCheck = {
    status: '⚠️ WARNING',
    message: 'Your custom message'
  }
  flags.push('your_new_flag')
}
```

### Customize AI Prompts

Edit the prompts in `frontend/lib/ai-service.ts`:

```typescript
const response = await openai.chat.completions.create({
  messages: [{
    role: 'user',
    content: 'Your custom prompt here...'
  }]
})
```

---

## 🚀 Deployment to Production

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/buildverify.git
git push -u origin main
```

2. **Deploy to Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd buildverify-mvp/frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? buildverify
# - Directory? ./
# - Build command? (leave default)
```

3. **Add Environment Variables in Vercel:**

- Go to your project dashboard
- Settings → Environment Variables
- Add all variables from `.env.local`

4. **Redeploy:**

```bash
vercel --prod
```

Your app will be live at: `https://buildverify.vercel.app`

---

## 📊 Database Management

### View Your Data

Go to Supabase dashboard → **Table Editor**

You'll see:
- `invoices` - All uploaded invoices
- `invoice_analyses` - AI analysis results
- `documents` - File references
- `user_profiles` - User info

### Export Data

```sql
-- In Supabase SQL Editor
SELECT * FROM invoices ORDER BY created_at DESC;
```

Click "Download CSV"

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" error

**Solution:** Check your Supabase URL and keys in `.env.local`

### Issue: OpenAI API errors

**Solution:**
1. Verify API key is correct
2. Check account has credits
3. Ensure you're using `gpt-4o` model (not older versions)

### Issue: File upload fails

**Solution:**
1. Check Supabase Storage bucket exists (name: `invoices`)
2. Verify storage policies are enabled
3. Check file size < 10MB

### Issue: Can't sign up

**Solution:**
1. Check Supabase Auth is enabled
2. Go to Authentication → Providers
3. Enable Email provider

---

## 💡 Next Steps

### Week 1: Polish & Test
- [ ] Test with 10 real invoices
- [ ] Gather user feedback
- [ ] Fix any bugs

### Week 2: Add Features
- [ ] Invoice detail page
- [ ] Export to PDF
- [ ] Email notifications
- [ ] Contractor database

### Week 3: Monetization
- [ ] Add Stripe payment
- [ ] Create pricing tiers
- [ ] Add usage limits

### Week 4: Launch
- [ ] Create landing page
- [ ] Set up marketing site
- [ ] Launch to beta users

---

## 📚 Learning Resources

If you get stuck, check these:

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **OpenAI API Docs:** [platform.openai.com/docs](https://platform.openai.com/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 🤝 Support

Need help? Here's what to do:

1. **Check this README** - Most issues are covered
2. **Check error logs** - They usually tell you what's wrong
3. **Google the error** - Someone probably solved it
4. **Ask Claude/ChatGPT** - We can debug together!

---

## 📝 Code Overview

### File Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── verify/route.ts       # Invoice verification API
│   ├── dashboard/
│   │   ├── layout.tsx            # Dashboard shell
│   │   ├── page.tsx              # Dashboard home
│   │   └── upload/page.tsx       # Upload interface
│   ├── login/page.tsx            # Login page
│   ├── signup/page.tsx           # Signup page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── providers.tsx             # React Query setup
├── lib/
│   ├── supabase.ts               # Database client
│   ├── auth.ts                   # Auth hooks
│   └── ai-service.ts             # AI verification logic
├── package.json                  # Dependencies
├── tailwind.config.js            # Styling config
└── .env.local                    # Your secrets (not in git)
```

### Key Functions

**Invoice Upload:** `app/api/verify/route.ts`
- Receives files from frontend
- Converts to base64
- Calls AI service
- Saves to database

**AI Verification:** `lib/ai-service.ts`
- `extractInvoiceData()` - Reads invoice with GPT-4V
- `extractWorkOrderData()` - Reads work order
- `analyzePhotos()` - Checks job site photos
- `verifyInvoice()` - Runs all checks

**Authentication:** `lib/auth.ts`
- `useAuth()` hook for login state
- `signUp()`, `signIn()`, `signOut()` functions

---

## 🎉 Congratulations!

You now have a **fully functional AI invoice verification system**!

### What You Built:
✅ Modern web app with authentication  
✅ AI-powered document analysis  
✅ Database storage & retrieval  
✅ Beautiful, responsive UI  
✅ Production-ready code  

### Total Build Time:
- **Setup:** 30 minutes
- **Learning:** 2-4 hours (if new to these tools)
- **Customization:** Ongoing

### Estimated Monthly Costs:
- **Supabase:** $0 (free tier)
- **Vercel:** $0 (free tier)
- **OpenAI:** $20-50 (based on usage)
- **Total:** ~$20-50/month

---

## 🚀 Ready to Scale?

When you're ready to grow:

1. **Add Blockchain** - Store verification proofs on Polygon
2. **Mobile App** - Build React Native version
3. **API Access** - Let other apps integrate
4. **White Label** - License to construction firms
5. **Insurance Integration** - Partner with insurers

---

**Questions? Issues? Ideas?**

Open an issue or reach out. Let's build something amazing! 🏗️✨
