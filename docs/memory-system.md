# Memory System

For the shared multi-agent memory design, see `docs/shared-organizational-memory-system.md`.

ระบบ memory แบ่งเป็น 3 ระดับ

สำหรับ Content Creator AI ดูเอกสารเฉพาะที่ `docs/content-creator-memory-architecture.md`

## Short-Term Memory

ใช้ state/checkpoint ของ LangGraph ต่อ conversation thread เพื่อเก็บบริบทระหว่างงานที่กำลังดำเนินอยู่

## Long-Term Memory

ใช้ตาราง `memory_items` บน Supabase Postgres พร้อม `embedding vector(1536)` สำหรับ semantic search ผ่าน pgvector

Memory type:

- `fact`: ข้อเท็จจริงเกี่ยวกับบริษัท
- `decision`: การตัดสินใจที่ต้องอ้างอิงซ้ำ
- `preference`: ความชอบของผู้ใช้หรือบริษัท
- `lesson`: บทเรียนจากงานที่สำเร็จหรือผิดพลาด
- `sop_improvement`: ข้อเสนอปรับ SOP
- `report_summary`: สรุปรายงานที่ควรนำกลับมาใช้

## Institutional Memory

ข้อมูลจาก SOP, report, task result, customer insight และ business decision จะถูกเก็บเป็น knowledge ที่ Agent ใช้ตัดสินใจระยะยาว

## Learning Loop

1. ผู้ใช้ให้ feedback
2. ระบบบันทึก `agent_feedback`
3. ถ้า feedback สำคัญ ระบบสร้าง `agent_learning_events`
4. learning event ที่ผ่านการยืนยันจะกลายเป็น memory หรือ SOP improvement
5. Agent ใช้ข้อมูลนี้ในการตอบครั้งต่อไป
