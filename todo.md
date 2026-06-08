# AI Facebook Ads Guide - TODO

## Backend / Database
- [x] Database schema: users, ad_analyses, ad_copies tables
- [x] tRPC router: adAnalysis.analyze (AI-powered analysis)
- [x] tRPC router: adCopy.generate (AI ad copy generation)
- [x] tRPC router: adAnalysis.getHistory (get user's analysis history)
- [x] tRPC router: adAnalysis.deleteHistory (delete analysis)

## Frontend - Layout & Navigation
- [x] Global design system: dark blue + gold accent color palette
- [x] Top navigation bar with logo, nav links, auth button
- [x] Responsive layout for mobile/tablet/desktop
- [x] Landing page (Home.tsx) with hero, features, CTA sections

## Frontend - AI Ad Analyzer Page
- [x] Ad metrics input form (budget, impressions, clicks, conversions, revenue)
- [x] Product type & target audience fields
- [x] Ad content textarea for compliance check
- [x] AI-powered analysis results (ROAS, CTR, CPC, Conversion Rate)
- [x] Compliance issues display
- [x] AI recommendations display
- [x] Analysis history with save/delete

## Frontend - Ad Copy Generator Page
- [x] Product info input form
- [x] Target audience & tone selection
- [x] AI-generated ad copy output (multiple variations)
- [x] Copy to clipboard functionality

## Frontend - Business Health Check Page
- [x] 4-dimension health scores (Audience, Promotion, Creative, System)
- [x] Issues & root cause analysis
- [x] Holistic recommendations

## Frontend - Additional Tools
- [x] A/B Test Analyzer (integrated in AdAnalyzer page)
- [x] Budget Optimizer (integrated in AdAnalyzer page)
- [x] Audience Segmentation Tool (integrated in AdAnalyzer page)

## Testing & Quality
- [x] Vitest unit tests for backend procedures (13 tests passing)
- [x] Verify all pages render correctly (dev server running, no TypeScript errors)
- [x] Mobile responsiveness check (responsive design with Tailwind breakpoints)

## Facebook Ads Dashboard (Meta API)
- [x] Database schema: facebook_tokens table (store user Meta access tokens)
- [x] Database schema: ad_insights_cache table (cache API responses)
- [x] tRPC router: meta.saveToken (save Meta access token for user)
- [x] tRPC router: meta.getInsights (fetch insights from Meta API: spend, impressions, clicks, CTR, CPC, CPA, ROAS)
- [x] tRPC router: meta.getAdAccounts (list user's ad accounts)
- [x] tRPC router: meta.getDailyInsights (daily breakdown via time_increment=1 in getInsights)
- [x] Frontend: /dashboard page with KPI summary cards
- [x] Frontend: Meta OAuth connect flow (get access token)
- [x] Frontend: Ad account selector
- [x] Frontend: Date range selector (7d / 30d)
- [x] Frontend: Line chart comparing metrics over time (Recharts)
- [x] Frontend: Real-time refresh button
- [x] Vitest tests for meta router (9 tests passing)

## Budget Monitoring & Alert System
- [x] Database schema: budget_alerts table (alert rules per campaign)
- [x] Database schema: alert_logs table (notification history)
- [x] Database schema: notification_settings table (LINE token + email)
- [x] Alert Engine: fetch campaign insights from Meta API
- [x] Alert Engine: isThresholdBreached checker (budget_spent, cpm, cost_per_purchase, cpc, cpa, roas_below)
- [x] Alert Engine: sendLineNotification via LINE Notify API
- [x] Alert Engine: sendEmailNotification via Manus built-in notification
- [x] tRPC router: budgetAlert.create (create rule + schedule hourly heartbeat)
- [x] tRPC router: budgetAlert.list
- [x] tRPC router: budgetAlert.update (toggle active, change threshold)
- [x] tRPC router: budgetAlert.delete (delete rule + cancel heartbeat)
- [x] tRPC router: budgetAlert.getLogs
- [x] tRPC router: budgetAlert.getNotificationSettings / saveNotificationSettings
- [x] Scheduled endpoint: POST /api/scheduled/check-budget (heartbeat handler)
- [x] Frontend: /budget-monitor page
- [x] Frontend: Notification Settings dialog (LINE token + email)
- [x] Frontend: Create Alert Rule dialog (campaign, metric, threshold, channels)
- [x] Frontend: Alert Rules list with toggle active / delete
- [x] Frontend: Alert history log tab
- [x] Frontend: Summary KPI cards (total rules, active, triggered, log count)
- [x] Frontend: Budget Monitor link in Home.tsx nav and features
- [x] Vitest tests for budgetAlert router and alertEngine (18 tests passing)

## Automated Report System
- [ ] Database schema: report_schedules table (user, ad account, schedule config, cron task uid)
- [ ] Database schema: report_logs table (history of sent reports)
- [ ] Backend: reportGenerator.ts — fetch Meta API insights (Spend, Leads, Purchases, ROAS, Impressions, Clicks)
- [ ] Backend: generatePdfReport() using pdfkit/jsPDF — styled summary table + KPI cards
- [ ] Backend: generateExcelReport() using exceljs — formatted spreadsheet with daily breakdown
- [ ] Backend: upload generated file to S3 storage and return URL
- [ ] tRPC router: report.createSchedule (create schedule + heartbeat cron 8:00 UTC+7 = 01:00 UTC)
- [ ] tRPC router: report.listSchedules
- [ ] tRPC router: report.updateSchedule (change format, channels, toggle active)
- [ ] tRPC router: report.deleteSchedule (delete + cancel heartbeat)
- [ ] tRPC router: report.getLogs (view sent report history)
- [ ] tRPC router: report.sendNow (manual trigger)
- [ ] Scheduled endpoint: POST /api/scheduled/send-report (heartbeat handler)
- [ ] Frontend: /auto-report page with schedule management
- [ ] Frontend: Create Schedule dialog (ad account, format PDF/Excel, channels LINE/Email)
- [ ] Frontend: Schedule list with toggle active / delete / send now
- [ ] Frontend: Report history log with download links
- [ ] Frontend: Auto Report link in Home.tsx nav and features
- [ ] Vitest tests for report router and report generator
