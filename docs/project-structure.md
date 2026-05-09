# Next.js Project Structure

โครงสร้างนี้ออกแบบเป็น modular monolith สำหรับ AI Company OS โดยให้ frontend, backend API, domain modules และ Supabase schema อยู่ใน repo เดียวกัน

```txt
ai-company-os/
  public/
  scripts/
  tests/
    unit/
    integration/
    e2e/
  src/
    app/
      (auth)/
      api/
      dashboard/
      content/
      agents/
      departments/
      tasks/
      memory/
      sop/
      skills/
      workflows/
      reports/
      settings/
    components/
      ui/
      layout/
      dashboard/
      agents/
      tasks/
      memory/
      sop/
      reports/
    config/
    hooks/
    i18n/
    lib/
      ai/
      env/
      logger/
      supabase/
    modules/
      agents/
      analytics/
      auth/
      departments/
      integrations/
      memory/
      orchestration/
      skills/
      sop/
      tasks/
      workflows/
    server/
      actions/
      queries/
    types/
  supabase/
    migrations/
    seed.sql
  docs/
```

## Folder Responsibilities

- `src/app`: Next.js routes, pages, layouts และ API route handlers
- `src/components`: UI components แยกตาม feature และ reusable primitives
- `src/modules`: business logic ของแต่ละ domain
- `src/server`: server actions และ server-side queries ที่ใช้กับ Supabase
- `src/lib`: shared infrastructure เช่น Supabase client, env, logger, AI client
- `src/i18n`: Thai-first copy และ future English locale
- `src/types`: shared TypeScript types เช่น generated Supabase database types
- `supabase`: migrations, RLS, seed data
- `docs`: architecture, schema, roadmap และ system design
