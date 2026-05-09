# AI Company OS MVP Roadmap v1

Roadmap นี้โฟกัสการสร้างระบบที่ใช้งานได้จริงก่อน: CEO AI หนึ่งตัว, dashboard ภาษาไทย, memory, SOP, task engine และรายงานพื้นฐาน

## Version 1 Goal

ทำให้ผู้ใช้สามารถสั่งงาน `CEO AI` เป็นภาษาไทย แล้วระบบสามารถ:

- วิเคราะห์คำสั่ง
- ดึงบริบทจาก SOP และ memory
- สร้าง task ที่ติดตามได้
- บันทึกบทเรียนหรือ decision สำคัญ
- สร้างรายงานผู้บริหารพื้นฐาน
- รองรับการขยายเป็น Agent แผนกอื่นใน v2

## v1.0 Milestones

### M1: Project Foundation

เป้าหมาย: ให้เว็บแอป Next.js + Supabase พร้อมพัฒนา production feature

Deliverables:

- Next.js App Router + TypeScript + TailwindCSS
- Thai-first app shell และ navigation
- Supabase client/server setup
- Environment validation
- Base dashboard pages
- Health endpoint

Acceptance criteria:

- เปิด `/dashboard` ได้
- UI หลักเป็นภาษาไทย
- config พร้อมเชื่อม Supabase
- โครงสร้าง module แยกชัดเจน

### M2: Database And Security Foundation

เป้าหมาย: ฐานข้อมูลรองรับ company workspace, agents, memory, tasks, skills, departments และ workflows

Deliverables:

- Supabase migrations
- RLS policies แยกข้อมูลตาม organization
- pgvector extension และ memory index
- seed data สำหรับ organization, departments และ CEO AI
- schema docs

Acceptance criteria:

- migration รันบน Supabase ได้
- organization member เห็นเฉพาะข้อมูลบริษัทตัวเอง
- memory_items รองรับ embedding
- workflow schema รองรับ graph steps และ task mapping

### M3: CEO AI Command Center

เป้าหมาย: ผู้ใช้สั่งงาน CEO AI ผ่าน dashboard ได้

Deliverables:

- CEO Command UI
- `POST /api/ceo/command`
- CEO agent definition
- orchestration adapter สำหรับ LangGraph
- deterministic workflow stub สำหรับ dev mode
- response ภาษาไทยพร้อม recommended actions

Acceptance criteria:

- ส่งคำสั่งภาษาไทยแล้วได้คำตอบภาษาไทย
- ระบบแยก intent เบื้องต้นได้ เช่น plan, report, task
- คำตอบมี action ที่นำไปทำต่อได้
- API contract พร้อมเปลี่ยนเป็น LangGraph จริงโดยไม่แก้ UI

### M4: Task Engine

เป้าหมาย: CEO AI และผู้ใช้สร้าง/ติดตามงานได้

Deliverables:

- Task list page
- Create task API/repository
- Task status: todo, in_progress, review, done, blocked
- Priority: low, medium, high, critical
- Task events timeline
- Task dependency model

Acceptance criteria:

- สร้าง task ได้จาก command
- task มี owner agent
- task เปลี่ยนสถานะได้
- task event ถูกบันทึกทุกครั้งที่มีการเปลี่ยนแปลงสำคัญ

### M5: SOP / Knowledge Base

เป้าหมาย: Agent ใช้ SOP เป็นฐานการทำงานได้

Deliverables:

- SOP list page
- Knowledge document repository
- Create/edit SOP flow
- Assign SOP to agent
- Basic full-text search

Acceptance criteria:

- เพิ่ม SOP ได้
- CEO AI อ้างอิง SOP ได้ใน workflow
- SOP ผูกกับ Agent ได้
- ค้นหา SOP จากคำสั่งหรือ keyword ได้

### M6: Memory System

เป้าหมาย: Agent มี long-term memory ที่ค้นคืนได้

Deliverables:

- Memory list page
- Create memory repository
- Memory types: fact, decision, preference, lesson, sop_improvement, report_summary
- Importance score
- Tags
- pgvector search function

Acceptance criteria:

- บันทึก memory ได้
- ค้น memory จาก organization และ agent ได้
- memory สำคัญถูกนำกลับมาใช้ใน CEO workflow
- รองรับ embedding search สำหรับขั้น production

### M7: Reports And Analytics

เป้าหมาย: CEO AI สรุปสถานะบริษัทจาก task/memory/SOP ได้

Deliverables:

- Reports page
- Report repository
- Executive report template
- Dashboard metrics: open tasks, completed tasks, memory count, feedback score
- Basic weekly report workflow definition

Acceptance criteria:

- สร้าง report ได้
- report ผูกกับ agent และ organization
- dashboard แสดง metrics สำคัญ
- report ใช้ข้อมูลจาก task และ memory

### M8: Feedback And Learning Loop

เป้าหมาย: Agent เริ่มเรียนรู้จาก feedback ได้

Deliverables:

- Feedback capture model
- Accepted output tracking
- Learning event creation
- Memory promotion candidate
- SOP improvement candidate

Acceptance criteria:

- ผู้ใช้ให้ feedback ต่อ output ได้
- feedback สร้าง learning event ได้
- learning event เสนอว่าจะบันทึกเป็น memory หรือ SOP improvement
- มี audit trail สำหรับการเรียนรู้

## v1 Release Criteria

v1 ถือว่าพร้อมใช้งานเมื่อ:

- ผู้ใช้ login และเข้า dashboard ได้
- CEO AI รับคำสั่งภาษาไทยและตอบภาษาไทย
- CEO AI สร้าง task จากคำสั่งได้
- ระบบบันทึก memory และ SOP ได้
- CEO AI ใช้ memory/SOP เป็น context
- สร้างรายงานผู้บริหารพื้นฐานได้
- RLS แยกข้อมูลแต่ละ organization ได้
- มีเอกสาร architecture, schema, memory และ agent system

## Not In v1

- Agent ครบทุกแผนก
- Autonomous background execution เต็มรูปแบบ
- Video editing automation
- Accounting automation
- Ads platform integration
- Plugin marketplace
- Advanced permission model ระดับ enterprise
- Multi-model routing ขั้นสูง

## Recommended Build Order

1. ติดตั้ง dependencies และรัน Next.js dev server
2. เชื่อม Supabase project และรัน migrations
3. ทำ auth + organization bootstrap
4. เปลี่ยน sample data ใน UI เป็นข้อมูลจริงจาก Supabase
5. ทำ CEO command ให้เขียน thread/message/task ลง database
6. เพิ่ม SOP CRUD
7. เพิ่ม memory CRUD และ embedding pipeline
8. เชื่อม LangGraph workflow จริง
9. เพิ่ม report generation
10. เพิ่ม feedback learning loop

## v1 Risks

- AI workflow อาจซับซ้อนเกินไปถ้าเพิ่มหลาย Agent เร็วเกินไป
- pgvector เพียงพอสำหรับ MVP แต่ต้อง monitor latency เมื่อ memory โตขึ้น
- RLS ต้องทดสอบจริงเพื่อป้องกันข้อมูลข้าม organization
- ถ้ายังไม่มี background worker งาน long-running ต้องจำกัด scope ให้สั้น
- ภาษาไทยต้องทดสอบทั้ง UI และ prompt behavior เพื่อให้ Agent ไม่สลับภาษาเอง
