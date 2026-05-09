# Core Database Schema

ไฟล์ migration หลัก:

- `supabase/migrations/202605070001_initial_schema.sql`
- `supabase/migrations/202605070002_core_agent_operating_schema.sql`

## Departments

- `departments`: โครงสร้างแผนกขององค์กร
- `department_agent_roles`: บทบาทของ Agent ในแผนก เช่น lead, operator, reviewer

## Agents

- `agents`: role, name, goals, personality, system prompt, model config, status
- `agent_sops`: SOP ที่ Agent ใช้อ้างอิง
- `agent_feedback`: feedback จากผู้ใช้ต่อ output ของ Agent
- `agent_learning_events`: เหตุการณ์เรียนรู้จาก feedback, memory, SOP และผลลัพธ์

## Skills

- `skills`: skill catalog ระดับองค์กร
- `skill_prerequisites`: skill tree / dependency ระหว่าง skill
- `agent_skill_assignments`: skill ที่ Agent มี พร้อม proficiency, evidence และ learning goal
- `agent_skills`: ตาราง legacy/simple skill assignment จาก migration แรก ใช้ได้สำหรับ MVP แบบง่าย

## Memory

- `memory_items`: long-term memory ของ Agent และองค์กร พร้อม `embedding extensions.vector(1536)`
- รองรับ memory type: `fact`, `decision`, `preference`, `lesson`, `sop_improvement`, `report_summary`
- ใช้ HNSW pgvector index สำหรับ semantic search

## Content Creator Memory

- `brand_voice_profiles`: brand voice, preferred words, blocked words, tone examples และ compliance notes
- `content_assets`: คอนเทนต์ที่สร้างแล้ว พร้อม hook, draft, CTA, hashtags และ embedding
- `content_performance`: metrics และ performance score ของคอนเทนต์
- `audience_insights`: pain points, desires, objections, buying triggers และ language style
- `content_feedback_events`: feedback, edited version และ learning summary

## Tasks

- `tasks`: งานหลักของระบบ
- `task_dependencies`: dependency ระหว่างงาน
- `task_events`: timeline ของงาน เช่น created, assigned, status_changed, completed

## Workflows

- `workflows`: workflow definition ระดับสูง
- `workflow_steps`: step ภายใน workflow เช่น agent task, tool call, approval, memory write
- `workflow_step_edges`: graph edge ระหว่าง step เพื่อรองรับ LangGraph-style routing
- `workflow_runs`: execution instance
- `workflow_run_tasks`: mapping ระหว่าง workflow run กับ task ที่ถูกสร้าง
- `tool_runs`: audit trail ของ tool execution

## Security

ทุกตาราง core เปิด Row Level Security และใช้ policy `public.is_org_member(organization_id)` เพื่อแยกข้อมูลตามองค์กร
