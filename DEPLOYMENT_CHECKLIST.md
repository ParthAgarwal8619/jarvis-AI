# JARVIS AI Assistant - Deployment Checklist

Use this checklist to deploy JARVIS to production with all features enabled.

## Pre-Deployment Verification

### Application Status
- [x] UI renders correctly with glowing orb
- [x] All components load without errors
- [x] Production build completes successfully
- [x] No console errors or warnings
- [x] DOM property issues fixed
- [x] Debug logging removed
- [x] Responsive design works on mobile/tablet

### Feature Readiness
- [x] Voice input framework ready (requires microphone)
- [x] Text input working (requires API key)
- [x] Quick actions panel functional
- [x] Chat history UI implemented
- [x] Search results display implemented
- [x] Dark theme applied

## Pre-Deployment Configuration

### Step 1: Gather API Keys

Before deploying, collect these API keys:

**OpenAI API Key**
- [ ] Visit https://platform.openai.com/account/api-keys
- [ ] Create new API key
- [ ] Copy key: `sk_...`

**ElevenLabs API Key**
- [ ] Visit https://elevenlabs.io
- [ ] Go to API page
- [ ] Copy API key: `sk_...`

**SearchAPI Key** (Optional but recommended)
- [ ] Visit https://www.searchapi.io
- [ ] Create account
- [ ] Copy API key

**Porcupine Access Key** (Optional for wake word)
- [ ] Visit https://console.picovoice.ai
- [ ] Create access key
- [ ] Copy key

**Supabase Keys** (For chat history)
- [ ] Visit https://supabase.com
- [ ] Create new project
- [ ] Copy URL from Project Settings > API
- [ ] Copy anon public key from Project Settings > API

## Deployment Steps

### Option A: Deploy to Vercel (Recommended)

1. **Click "Publish" in v0**
   - [ ] Click three dots in top right
   - [ ] Select "Publish to Vercel"
   - [ ] Wait for deployment

2. **Configure Environment Variables**
   - [ ] Go to your Vercel project dashboard
   - [ ] Navigate to Settings > Environment Variables
   - [ ] Add `OPENAI_API_KEY=sk_...`
   - [ ] Add `ELEVENLABS_API_KEY=sk_...`
   - [ ] Add `SEARCHAPI_API_KEY=...`
   - [ ] Add `PORCUPINE_ACCESS_KEY=...`
   - [ ] Add `NEXT_PUBLIC_SUPABASE_URL=https://...`
   - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
   - [ ] Save variables

3. **Redeploy with Variables**
   - [ ] Go to Deployments
   - [ ] Click "Redeploy" on the latest deployment
   - [ ] Wait for redeployment with new variables

### Option B: Local Testing First

1. **Create .env.local**
   ```bash
   OPENAI_API_KEY=sk_...
   ELEVENLABS_API_KEY=sk_...
   SEARCHAPI_API_KEY=...
   PORCUPINE_ACCESS_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

2. **Run Locally**
   ```bash
   cd /vercel/share/v0-project
   pnpm dev
   ```

3. **Test Features**
   - [ ] Type a message → JARVIS responds
   - [ ] Click orb → Listening state activates
   - [ ] Weather button → Gets weather data
   - [ ] News button → Gets news updates
   - [ ] Clear History → Removes chat

4. **Deploy to Vercel**
   - [ ] Follow Option A steps above

## Post-Deployment Testing

### Critical Path Testing
- [ ] Open deployed URL
- [ ] Verify page loads (should show glowing orb)
- [ ] Type "hello" in text input
- [ ] Verify JARVIS responds
- [ ] Check browser console (no errors)
- [ ] Try Weather Report button
- [ ] Try News Update button
- [ ] Verify chat history displays

### Optional Voice Testing
- [ ] Allow microphone permission
- [ ] Click orb
- [ ] Speak "What is the weather?"
- [ ] Verify audio response plays
- [ ] Check transcription accuracy

### Monitor After Deployment
- [ ] Watch Vercel logs for errors
- [ ] Monitor API usage in OpenAI dashboard
- [ ] Check ElevenLabs API usage
- [ ] Verify Supabase connections
- [ ] Review SearchAPI quota

## Common Issues & Solutions

### API Calls Failing
**Problem**: "Chat API error"
- [ ] Verify API key is set in Vercel environment variables
- [ ] Confirm API key has available credits
- [ ] Check that variables are visible in production (`NEXT_PUBLIC_*` for client-side)

### Voice Not Working
**Problem**: Microphone permission denied
- [ ] Request permission again or clear site data
- [ ] Check browser supports Web Speech API
- [ ] Verify PORCUPINE_ACCESS_KEY is set

### Chat History Not Saving
**Problem**: Messages don't persist
- [ ] Verify Supabase URL and keys are correct
- [ ] Check Supabase project is active
- [ ] Confirm database tables exist
- [ ] Review Supabase logs for errors

### Page Not Loading
**Problem**: Blank page or 500 error
- [ ] Check Vercel deployment logs
- [ ] Verify all environment variables are set
- [ ] Clear browser cache and reload
- [ ] Check that required dependencies installed

## Performance Optimization

### Already Implemented
- [ ] Turbopack for fast builds
- [ ] Static page pre-rendering
- [ ] API route optimization
- [ ] Lazy component loading
- [ ] Image optimization

### Optional Enhancements
- [ ] Enable response caching in ISR (revalidate: 60)
- [ ] Add CDN caching headers
- [ ] Optimize vector searches with Supabase indexes
- [ ] Monitor Lighthouse scores

## Security Checklist

- [x] API keys not hardcoded (using environment variables)
- [x] CORS properly configured
- [x] No sensitive data in client code
- [x] NEXT_PUBLIC prefix only for public variables
- [x] Server-side API calls for secret keys
- [ ] Enable Vercel authentication (optional)
- [ ] Set up rate limiting for API routes (optional)
- [ ] Review Supabase RLS policies (optional)

## Rollback Plan

If deployment has critical issues:

1. **Quick Rollback**
   - [ ] Go to Vercel Deployments
   - [ ] Click "Redeploy" on previous working deployment
   - [ ] Takes 2-3 minutes

2. **Debug Issues**
   - [ ] Check Vercel logs
   - [ ] Verify environment variables
   - [ ] Test API endpoints
   - [ ] Review error patterns

3. **Redeploy Fix**
   - [ ] Fix identified issue
   - [ ] Publish again from v0
   - [ ] Verify in staging first (create preview)

## Final Sign-Off

Before considering deployment complete:

- [ ] All features tested and working
- [ ] No critical errors in logs
- [ ] Performance acceptable (< 2s page load)
- [ ] Mobile responsive working
- [ ] Voice features tested (if applicable)
- [ ] Chat history persists
- [ ] API integrations active
- [ ] Ready for user access

## Support Resources

- **Setup Guide**: See `SETUP.md` for detailed API configuration
- **Project Summary**: See `PROJECT_SUMMARY.md` for architecture overview
- **Error Logs**: Check Vercel dashboard > Analytics > Logs
- **API Status**: Check OpenAI, ElevenLabs, SearchAPI dashboards

Deployment ready? Click Publish and let JARVIS go live!
