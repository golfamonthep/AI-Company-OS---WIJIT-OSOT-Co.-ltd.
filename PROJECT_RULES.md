# PROJECT_RULES

## 2026-05-07 Architecture Reset

- The project direction is reset toward a layered AI Company OS.
- Do not continue adding feature work from the previous sequence until the layer structure is stable.
- Canonical operating structure lives in `company-os/`.
- Required layers are Agent, Skill, Harness, Memory, Workflow, Governance, Learning, and Operations.
- Skill is an operational manual: SOP, workflow, input/output, quality checklist, and guardrails.
- Harness is the real execution capability: runtime, tool, API connector, browser, file system, or database.
- Governance is the supervision capability: permissions, approvals, audit trail, safety boundaries, and emergency controls.
- Learning is the controlled improvement capability: feedback, execution analysis, metrics, proposals, human review, and audit logs.
- Learning must not rewrite governance, permissions, audit systems, or core runtime architecture automatically.
- Operations is the supervised proactive capability: monitoring, triggers, schedules, recommendations, risk detection, approval routing, and logs.
- Operations must not execute high-impact external actions without governance approval.
- Dashboard is the control surface: visualization, approval controls, monitoring, memory inspection, learning review, operations oversight, and realtime readiness.
- External Integrations is the connector boundary: OAuth-ready stubs, connector permissions, read/write action contracts, rate-limit preparation, connector audit logs, and approval-gated external actions.
- Integrations must not publish, send, spend, delete, modify financial data, change account settings, or contact customers without explicit governance approval.
- Real external accounts must not be connected until connector settings, encrypted token storage, approval APIs, and audit review UI are implemented.
- Database and Persistence is the durable state boundary: schema migrations, typed repositories, Supabase client config, in-memory fallback, and migration bridge from markdown/files.
- Persistence must not require Supabase env vars for local demos; file-based fallback must keep working until migration is verified.
- Never hardcode Supabase credentials, API keys, database URLs, or service role secrets.
- API Layer is the official backend interface: validate all inputs, call repositories/runtime modules, enforce permission guards, and audit important actions.
- API routes must not bypass governance, connector approval gates, emergency controls, or persistence fallback rules.
- Future work must identify agent owner, skill manual, harness capability, memory behavior, and workflow before implementation.
- Do not delete old files during migration. Use adapters and safe migration.

ไฟล์นี้คือกฎหลักของโปรเจกต์ AI Company OS ให้ Codex/session ใหม่อ่านก่อนทำงานเสมอ

## Product Principles

- ระบบนี้ไม่ใช่ chatbot platform แต่เป็น AI-native company operating system
- ทุก feature ต้องช่วยให้ AI agents ทำงานเหมือนองค์กรจริง: วางแผน, มอบหมายงาน, สื่อสาร, เรียนรู้, บันทึก memory และสร้างผลลัพธ์ทางธุรกิจ
- เริ่มเล็กแต่ scalable: ทำ core architecture และ single-agent/multi-agent foundation ก่อน ไม่ทำทุกอย่างพร้อมกัน
- UI สำหรับผู้ใช้คนไทยเป็นหลัก แต่ code, database, API และ module naming ใช้ภาษาอังกฤษ
- Agent response ใช้ภาษาไทยเป็น default ยกเว้นผู้ใช้ขอภาษาอื่น

## Technical Rules

- Stack หลัก: Next.js App Router, TypeScript, TailwindCSS, Supabase, PostgreSQL, pgvector, LangGraph TypeScript
- ใช้ Supabase RLS และ `organization_id` ในตาราง business data ทุกตาราง
- ใช้ modular monolith ก่อน แยก domain logic ใน `src/modules`
- Database migrations อยู่ใน `supabase/migrations`
- เอกสาร architecture อยู่ใน `docs`
- Repo คือ long-term memory หลักของโปรเจกต์ ห้ามพึ่ง chat context อย่างเดียว
- ทุกระบบ Agent ต้องมี audit trail หรือ activity log เมื่อเป็น action สำคัญ

## UI Rules

- Main dashboard ต้องรู้สึกเหมือน control center ของ AI-powered company
- Dark mode, premium SaaS, cinematic, minimal but powerful
- ไม่ทำหน้า landing page ถ้า user ขอ app/tool/dashboard ให้สร้าง usable interface ทันที
- ใช้ lucide icons และ shadcn-style components/source components
- หลีกเลี่ยง UI ที่ corporate boring หรือ generic card grid เกินไป

## Agent Rules

- Agent ทุกตัวควรมี role, goals, personality, memory, skills, SOPs, task ownership และ communication ability
- Agent ต้องไม่อ้างว่าทำ external action สำเร็จถ้าไม่มี tool run หรือหลักฐาน
- Content Creator AI ต้องสร้างคอนเทนต์ที่ใช้งานได้จริง พร้อม hook, draft, CTA, hashtags, assumptions และ self-evaluation
- CEO AI เป็น supervisor/command agent สำหรับ routing, planning, delegation และ executive reports

## Session Rules

- แยกงานเป็น session: CEO Planning, Frontend, Backend, Agent System, Content AI, Marketing AI
- ก่อนจบ session ให้อัปเดต `CURRENT_STATUS.md` และ `NEXT_TASKS.md`
- ถ้ามี decision ใหม่ที่กระทบทั้งระบบ ให้อัปเดต `PROJECT_RULES.md`
- เมื่อ context เริ่มยาว ให้หยุดเพิ่ม feature, สรุปลงไฟล์, แล้วเริ่ม session ใหม่
