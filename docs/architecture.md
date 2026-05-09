# AI Company OS Architecture

AI Company OS เป็น modular monolith บน Next.js ที่ออกแบบให้ขยายเป็น multi-agent workforce ได้โดยไม่ต้องแยก microservices ตั้งแต่วันแรก

ดูแผนภาพ architecture ฉบับเต็มได้ที่ `docs/architecture-diagram.md`

## Runtime

- Next.js App Router เป็นทั้ง frontend และ backend-for-frontend
- Supabase ใช้สำหรับ Auth, Postgres, RLS, storage และ pgvector
- LangGraph TypeScript เป็น orchestration engine สำหรับ agent workflow
- Vercel deploy web/API, Supabase deploy database/auth

## Domain Modules

- `agents`: role, personality, goals, skills และ system prompt
- `orchestration`: workflow ของ Agent และ interface สำหรับ LangGraph
- `memory`: short-term และ long-term memory
- `tasks`: task engine และ execution tracking
- `sop`: SOP และ knowledge base
- `departments`: โครงสร้างองค์กร
- `analytics`: dashboard metrics และ reporting inputs
- `integrations`: tool registry และ plugin adapter ในอนาคต

## Scaling Path

1. เริ่มจาก CEO AI ตัวเดียว
2. เพิ่ม CTO, Marketing, Support เป็น specialized agents
3. เพิ่ม supervisor routing ระหว่างแผนก
4. แยก background worker สำหรับ long-running workflow
5. แยก service เฉพาะเมื่อมี bottleneck จริง เช่น embeddings, video, ads automation
