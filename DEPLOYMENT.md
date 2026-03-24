# Deployment Guide

Complete checklist and instructions for deploying the Cesium KML Road Geometry Tool to production.

## Pre-Deployment Checklist

### Code Quality
- [ ] No console errors or warnings
- [ ] All TypeScript strict mode checks pass
- [ ] ESLint/Prettier formatting applied
- [ ] Code reviewed for security issues
- [ ] All components have prop validation

### Functionality
- [ ] KML upload works correctly
- [ ] Placemark visualization confirmed
- [ ] Parameter inputs validated
- [ ] API integration tested
- [ ] Results visualization works
- [ ] Download functionality tested
- [ ] Error handling tested
- [ ] Loading states visible

### Browser Testing
- [ ] Tested on Chrome (latest)
- [ ] Tested on Firefox (latest)
- [ ] Tested on Safari (latest)
- [ ] Tested on Edge (latest)
- [ ] Mobile responsive tested
- [ ] WebGL support verified

### Performance
- [ ] Build size acceptable (< 5MB)
- [ ] Page load time < 5s
- [ ] Map interaction smooth
- [ ] Handles 500+ points
- [ ] No memory leaks
- [ ] No infinite loops

### Backend Integration
- [ ] API endpoint ready
- [ ] CORS headers configured
- [ ] Request/response formats match contract
- [ ] Error responses properly formatted
- [ ] Performance acceptable (< 10s for 500 points)

## Build for Production

### Create Optimized Build

```bash
npm run build
```

This generates optimized bundle in `dist/` folder.

### Verify Build Output

```bash
npm run preview
```

Opens preview of production build to verify functionality.

### Build Statistics

Check bundle size:
```bash
du -sh dist/
# Should be around 2-3MB
```

## Environment Configuration

### Required Environment Variables

```bash
# .env (for vite)
VITE_API_BASE_URL=https://api.yourcompany.com
VITE_APP_NAME=Road Geometry Tool
```

### Optional Environment Variables

```bash
# For Cesium Ion (higher resolution imagery)
VITE_CESIUM_TOKEN=your-cesium-ion-token

# For analytics
VITE_ANALYTICS_ID=your-analytics-id
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:**
- One-click deployment
- Automatic HTTPS
- CDN included
- Automatic deployments from Git
- Generous free tier

**Steps:**

1. Push code to GitHub/GitLab/Bitbucket
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your repository
5. Framework preset: "Vite"
6. Build command: `npm run build`
7. Output directory: `dist`
8. Environment variables:
   - `VITE_API_BASE_URL`: Your API endpoint
9. Click "Deploy"

**Cost:** Free tier sufficient for most projects

### Option 2: Netlify

**Steps:**

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to https://netlify.com
3. Drag and drop `dist/` folder, or connect Git
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

**Cost:** Free tier available

### Option 3: Traditional Hosting (AWS, Azure, GCP)

**AWS S3 + CloudFront:**

1. Create S3 bucket
2. Build app: `npm run build`
3. Upload `dist/` to S3
4. Create CloudFront distribution
5. Set S3 as origin
6. Configure SPA routing (important!)

**Cost:** ~$1-5/month for typical usage

### Option 4: Docker Container

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

**Build and run:**

```bash
docker build -t cesium-kml-tool .
docker run -p 3000:3000 cesium-kml-tool
```

**Deploy to:**
- Docker Hub
- AWS ECS
- Google Cloud Run
- Kubernetes

## Configuration for Production

### API Endpoint Update

In `src/components/ControlPanel.tsx`, update API URL:

```typescript
// Production API endpoint
const API_BASE = process.env.VITE_API_BASE_URL || 'https://api.yourcompany.com'

const res = await axios.post(`${API_BASE}/process-kml`, form, { 
  responseType: 'blob' 
})
```

### CORS Configuration (Backend)

Ensure backend includes:

```
Access-Control-Allow-Origin: https://yourcompany.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Security Headers

Configure web server to include:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cesium.com; style-src 'self' 'unsafe-inline';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Domain & HTTPS

### Custom Domain

1. Register domain with registrar
2. Point nameservers to host (Vercel, Netlify, etc.)
3. Host automatically provisions SSL certificate
4. Verify domain in host dashboard

### HTTPS Requirement

All production deployments MUST use HTTPS:
- Cesium requires secure context
- KML processing should be encrypted
- Browser geolocation requires HTTPS

## Monitoring & Analytics

### Error Tracking

```bash
npm install @sentry/react
```

In `main.tsx`:
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production'
})
```

### Analytics

```bash
npm install gtag
```

Track user interactions:
```typescript
import { event } from 'gtag'

event('kml_uploaded', { size: file.size })
event('geometry_generated', { pointCount: points.length })
```

### Logging

```typescript
// Server-side logging for API calls
console.log({
  timestamp: new Date(),
  action: 'geometry_generated',
  duration: endTime - startTime,
  pointCount: points.length
})
```

## Performance Optimization

### Image Optimization

Cesium assets are already optimized. No additional images to worry about.

### Code Splitting

Already handled by Vite. No additional configuration needed.

### Caching Strategy

Set in web server (Nginx example):

```nginx
# Cache static assets for 1 month
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1M;
  add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "public, no-cache, no-store, must-revalidate";
}
```

## Backup & Recovery

### Regular Backups

1. Version control: Push to GitHub regularly
2. Database backups (if using): Daily automated backups
3. Code backups: Multiple git repositories

### Disaster Recovery Plan

1. **Source code loss**: Recover from GitHub
2. **API endpoint down**: Have fallback endpoint
3. **Cesium assets missing**: Uses CDN, unlikely to fail
4. **User data loss**: No user data stored (stateless)

## Post-Deployment

### Verification Steps

- [ ] Visit deployed URL in browser
- [ ] Test file upload
- [ ] Verify 3D map loads
- [ ] Test API processing
- [ ] Download processed file
- [ ] Check all links work
- [ ] Verify error messages display
- [ ] Test on mobile device

### Performance Check

```bash
# Check site speed
curl -I https://yoursite.com
# Should see ~100-300ms response time

# Test certificate
openssl s_client -connect yoursite.com:443
# Should show valid certificate
```

### Monitoring Setup

- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Analytics enabled (Google Analytics, etc.)
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring enabled
- [ ] Log aggregation setup

## Rollback Plan

### Rollback to Previous Version

**On Vercel:**
1. Go to Deployments
2. Click three dots on previous deployment
3. Select "Promote to Production"

**On Netlify:**
1. Go to Deploys
2. Click on previous deploy
3. Publish deploy

**Manual:**
```bash
git log  # Find previous commit
git reset --hard <commit-hash>
git push -f origin main
npm run build
# Redeploy
```

## Maintenance

### Regular Updates

```bash
# Check for updates monthly
npm outdated

# Update dependencies
npm update

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring Checklist

- [ ] Check error logs weekly
- [ ] Review performance metrics weekly
- [ ] Test API responses weekly
- [ ] Verify backups monthly
- [ ] Update dependencies monthly
- [ ] Security audit monthly

## Troubleshooting Deployment

### Build Fails

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deploy Fails

1. Check build logs for errors
2. Verify environment variables set
3. Ensure API endpoint accessible
4. Check node version compatibility

### App Doesn't Load

1. Open browser DevTools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed requests
4. Verify API endpoint is correct

### Cesium Not Showing

1. Clear browser cache
2. Check WebGL support: https://get.webgl.org/
3. Verify Cesium CSS loaded
4. Check console for Cesium initialization errors

## Post-Launch

### First Week
- Monitor error logs closely
- Check user feedback
- Verify API performance
- Monitor resource usage

### First Month
- Analyze user behavior
- Optimize slow endpoints
- Add features based on feedback
- Plan for scaling

### Ongoing
- Monthly security updates
- Quarterly dependency updates
- Continuous monitoring
- User support

---

## Checklist Summary

**Before Deploy:**
- [ ] Code reviewed and tested
- [ ] Builds without errors
- [ ] No console warnings
- [ ] API endpoint ready
- [ ] Environment variables configured
- [ ] SSL certificate valid
- [ ] Performance acceptable

**After Deploy:**
- [ ] Functionality verified
- [ ] Error tracking enabled
- [ ] Monitoring setup
- [ ] Team notified
- [ ] Rollback plan ready

---

**Estimated Time to Deploy:** 15-30 minutes (depending on platform choice)

**Difficulty:** Easy to Moderate

Ready to deploy! 🚀
