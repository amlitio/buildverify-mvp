# 🏗️ BuildVerify Architecture Documentation

## System Overview

BuildVerify is a full-stack AI-powered invoice verification system built on modern web technologies.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js 14 (React 18)                      │  │
│  │  • Server Components + Client Components             │  │
│  │  • TypeScript for type safety                        │  │
│  │  • Tailwind CSS for styling                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes                           │  │
│  │  • /api/verify - Invoice verification endpoint       │  │
│  │  • Server-side only (secure)                         │  │
│  │  • Handles file uploads                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              ↓                           ↓
┌──────────────────────────┐    ┌──────────────────────────┐
│     AI PROCESSING        │    │      DATABASE            │
│  ┌────────────────────┐  │    │  ┌────────────────────┐ │
│  │  OpenAI GPT-4o     │  │    │  │  Supabase          │ │
│  │  • Vision API      │  │    │  │  • PostgreSQL      │ │
│  │  • Document OCR    │  │    │  │  • Auth            │ │
│  │  • Analysis        │  │    │  │  • Storage         │ │
│  └────────────────────┘  │    │  │  • Real-time       │ │
└──────────────────────────┘    │  └────────────────────┘ │
                                └──────────────────────────┘
```

---

## Technology Stack Deep Dive

### Frontend Layer

**Next.js 14**
- **App Router:** Modern routing system
- **Server Components:** Better performance, automatic code splitting
- **Client Components:** Interactive elements with 'use client'
- **API Routes:** Backend endpoints in same codebase
- **Image Optimization:** Automatic image optimization

**React 18**
- **Hooks:** useState, useEffect, custom hooks
- **Context:** For global state (auth)
- **Suspense:** Loading states

**TypeScript**
- **Type Safety:** Catch errors before runtime
- **IntelliSense:** Better developer experience
- **Interfaces:** Clear data contracts

**Tailwind CSS**
- **Utility-First:** Rapid UI development
- **Responsive:** Mobile-first design
- **Custom Theme:** Brand colors, spacing
- **No CSS files:** Styles in JSX

**React Query**
- **Data Fetching:** Automatic caching
- **Mutations:** Easy POST/PUT/DELETE
- **Optimistic Updates:** Instant UI feedback

### Backend Layer

**Next.js API Routes**
```typescript
// Route: /app/api/verify/route.ts
export async function POST(request: NextRequest) {
  // 1. Receive files
  const formData = await request.formData()
  
  // 2. Process with AI
  const analysis = await aiService.verify(files)
  
  // 3. Save to database
  await supabase.from('invoices').insert(analysis)
  
  // 4. Return results
  return NextResponse.json({ success: true })
}
```

**Key Benefits:**
- Same codebase as frontend
- TypeScript throughout
- Easy deployment
- Built-in security

### AI Processing Layer

**OpenAI GPT-4o Vision**

```typescript
// Example: Extract invoice data
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Extract invoice data...' },
      { type: 'image_url', image_url: { url: base64Image } }
    ]
  }],
  max_tokens: 1000,
  temperature: 0.1  // Low = more consistent
})
```

**Why GPT-4o?**
- Excellent OCR accuracy
- Understands context
- Extracts structured data
- Handles handwriting
- Works with photos

**AI Workflow:**
1. **Extract Invoice** → Parse line items, totals
2. **Extract Work Order** → Read crew, hours, equipment
3. **Analyze Photos** → Verify work scope
4. **Cross-Reference** → Find discrepancies
5. **Calculate Confidence** → Score 0-100

### Database Layer

**Supabase (PostgreSQL)**

**Tables:**
```sql
invoices
├─ id (UUID)
├─ user_id (FK to auth.users)
├─ invoice_number
├─ contractor_name
├─ total_amount
├─ status (verified|flagged|disputed)
└─ ai_confidence

invoice_analyses
├─ id (UUID)
├─ invoice_id (FK)
├─ findings (JSONB)
├─ flags (TEXT[])
└─ recommendations (TEXT[])

documents
├─ id (UUID)
├─ invoice_id (FK)
├─ file_type (invoice|work_order|photo)
└─ file_url
```

**Features:**
- **Row Level Security:** Users only see their data
- **Real-time:** Live updates
- **Full-text Search:** Fast queries
- **JSONB:** Flexible data storage
- **Triggers:** Auto-update timestamps

**Storage Buckets:**
- `invoices/` - PDF and image storage
- Organized by user_id
- Private (not public)

---

## Data Flow

### 1. User Upload Flow

```
User selects files
    ↓
Frontend validates (size, type)
    ↓
Convert to FormData
    ↓
POST to /api/verify
    ↓
[API Route]
    ↓
Convert files to base64
    ↓
Call AI service
    ↓
Parse AI responses
    ↓
Save to database
    ↓
Upload files to storage
    ↓
Return success + invoice_id
    ↓
Redirect to results page
```

### 2. AI Analysis Flow

```
Invoice PDF
    ↓
GPT-4o Vision
    ↓
{
  "invoiceNumber": "F24786",
  "contractor": "Adler Hydro Vac",
  "lineItems": [...],
  "total": 1950.00
}
    ↓
Work Order PDF
    ↓
GPT-4o Vision
    ↓
{
  "crew": ["Chev", "Cedric", "Aaron"],
  "hoursPerCrew": [6, 6, 6]
}
    ↓
Photos (1-10)
    ↓
GPT-4o Vision
    ↓
{
  "workCompleted": true,
  "crewVisible": 3,
  "estimatedWorkHours": "4-6 hours"
}
    ↓
Verification Logic
    ↓
{
  "status": "flagged",
  "confidence": 87,
  "findings": {...},
  "flags": ["crew_discrepancy"]
}
```

---

## Security

### Authentication
- **Supabase Auth:** Industry-standard JWT
- **Session Management:** Secure cookies
- **Password Hashing:** bcrypt
- **Email Verification:** Optional

### Authorization
- **Row Level Security (RLS):** PostgreSQL policies
- **User Isolation:** Can't access others' data
- **API Protection:** Middleware checks auth

### Data Protection
- **Environment Variables:** Secrets not in code
- **HTTPS Only:** Force SSL in production
- **CORS:** Restricted origins
- **Rate Limiting:** Prevent abuse

### File Upload Safety
- **Type Validation:** Only PDF/images
- **Size Limits:** Max 10MB
- **Virus Scanning:** (Add in production)
- **User Isolation:** Files stored by user_id

---

## Performance Optimizations

### Frontend
```typescript
// 1. Image Optimization
import Image from 'next/image'
<Image src="..." width={500} height={300} />

// 2. Code Splitting
const HeavyComponent = dynamic(() => import('./Heavy'))

// 3. React Query Caching
const { data } = useQuery('invoices', fetchInvoices, {
  staleTime: 60000  // Cache for 1 minute
})

// 4. Memoization
const expensiveCalc = useMemo(() => calculate(data), [data])
```

### Backend
```typescript
// 1. Database Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

// 2. Efficient Queries
const { data } = await supabase
  .from('invoices')
  .select('id, invoice_number, total')  // Only what we need
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)

// 3. Connection Pooling
// Supabase handles this automatically
```

### AI Calls
```typescript
// 1. Batch Processing
const [invoice, workOrder, photos] = await Promise.all([
  analyzeInvoice(file1),
  analyzeWorkOrder(file2),
  analyzePhotos(files3)
])

// 2. Optimize Tokens
max_tokens: 500  // Don't request more than needed

// 3. Lower Temperature
temperature: 0.1  // More consistent = faster
```

---

## Scalability

### Current Capacity
- **Users:** 1,000+ concurrent
- **Invoices:** Unlimited
- **Processing:** ~5 seconds per invoice
- **Cost per verification:** $0.10-0.20

### Scaling Strategy

**Phase 1: Free Tier (0-100 users)**
- Supabase: Free
- Vercel: Free
- OpenAI: $20-50/month

**Phase 2: Growth (100-1,000 users)**
- Supabase: $25/month
- Vercel: $20/month
- OpenAI: $200-500/month
- Total: ~$250-550/month

**Phase 3: Scale (1,000+ users)**
- Supabase: $50-100/month
- Vercel: $40/month
- OpenAI: $1,000+/month
- Add: Redis cache, CDN
- Total: ~$1,100+/month

---

## Error Handling

### Frontend
```typescript
try {
  const result = await uploadInvoice(files)
  showSuccess('Invoice verified!')
} catch (error) {
  if (error.message.includes('rate limit')) {
    showError('Too many requests. Try again in 1 minute.')
  } else {
    showError('Something went wrong. Please try again.')
  }
}
```

### Backend
```typescript
try {
  const data = await aiService.extract(file)
} catch (error) {
  if (error.code === 'insufficient_quota') {
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 503 }
    )
  }
  // Log error for debugging
  console.error('Verification failed:', error)
  return NextResponse.json(
    { error: 'Verification failed' },
    { status: 500 }
  )
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test AI service
describe('AIService', () => {
  it('should extract invoice data', async () => {
    const result = await aiService.extractInvoiceData(mockPDF)
    expect(result.invoiceNumber).toBe('F24786')
    expect(result.total).toBe(1950.00)
  })
})
```

### Integration Tests
```typescript
// Test API endpoint
describe('POST /api/verify', () => {
  it('should verify invoice', async () => {
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: formData
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.verification.confidence).toBeGreaterThan(0)
  })
})
```

### E2E Tests (Playwright)
```typescript
test('user can upload invoice', async ({ page }) => {
  await page.goto('/dashboard/upload')
  await page.setInputFiles('input[type=file]', 'test.pdf')
  await page.click('button:has-text("Verify")')
  await expect(page.locator('.success')).toBeVisible()
})
```

---

## Monitoring & Analytics

### What to Track

**Performance:**
- API response times
- AI processing duration
- Database query speed

**Business:**
- New signups
- Invoices verified
- Error rate
- User retention

**Cost:**
- OpenAI API usage
- Database storage
- Bandwidth

### Tools to Add

**Vercel Analytics:** Free, built-in
**Sentry:** Error tracking
**PostHog:** User analytics
**LogRocket:** Session replay

---

## Future Enhancements

### Phase 1 (Months 1-3)
- [ ] Invoice detail view
- [ ] Export to PDF
- [ ] Email notifications
- [ ] Contractor database

### Phase 2 (Months 4-6)
- [ ] Blockchain integration (Polygon)
- [ ] Mobile app (React Native)
- [ ] Stripe payments
- [ ] Team accounts

### Phase 3 (Months 7-12)
- [ ] API for integrations
- [ ] White-label solution
- [ ] Insurance partnerships
- [ ] Advanced analytics

---

## Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# Edit files...

# 3. Test locally
npm run dev

# 4. Commit
git add .
git commit -m "Add new feature"

# 5. Push
git push origin feature/new-feature

# 6. Deploy preview (automatic on Vercel)
# Preview URL: https://buildverify-abc123.vercel.app

# 7. Merge to main
# Merging triggers production deployment
```

---

## Cost Breakdown

### Per Invoice Processing

```
OpenAI API Costs:
├─ Invoice extraction: $0.04
├─ Work order extraction: $0.03
├─ Photo analysis (3 photos): $0.06
└─ Total: ~$0.13 per invoice

Database:
└─ Negligible (included in Supabase free tier up to 500MB)

Storage:
└─ ~$0.001 per invoice (included in first 1GB free)

Total Cost: ~$0.13 per invoice
```

### Monthly Costs (100 invoices/month)

```
Infrastructure:
├─ Supabase: $0 (free tier)
├─ Vercel: $0 (free tier)
└─ Domain: $12/year = $1/month

AI Processing:
└─ 100 invoices × $0.13 = $13

Total: ~$14/month
```

---

## Backup & Recovery

### Database Backups
```sql
-- Supabase automatic backups:
-- • Daily backups (retained for 7 days)
-- • Point-in-time recovery
-- • Manual backup: Project settings → Database → Backup
```

### Code Backups
```bash
# Git repository = automatic backup
# Deploy to GitHub for safety

# Also save .env.local securely
# Use 1Password, LastPass, or similar
```

---

## Compliance & Legal

### GDPR Compliance
- [ ] User can export their data
- [ ] User can delete their account
- [ ] Privacy policy on website
- [ ] Cookie consent

### Data Retention
- Invoices: Keep indefinitely
- Documents: Delete after 90 days (optional)
- User accounts: Delete on request

---

**Questions about architecture?**

This doc covers 90% of technical decisions. For specific implementation details, check the code comments!
