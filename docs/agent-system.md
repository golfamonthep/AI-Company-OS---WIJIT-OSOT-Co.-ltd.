# Agent System

Agent ทุกตัวมี role, goals, personality, memory, skills, SOP และ task ownership

## Content Creator AI MVP

Content Creator AI เป็น functional agent สำหรับงานคอนเทนต์ ทำหน้าที่:

- รับ brief ภาษาไทยผ่านหน้า `/content`
- สร้าง social post, short video script, campaign ideas หรือ content calendar
- คืนผลลัพธ์เป็น hook, draft, hashtags, CTA, production notes และ assumptions
- ใช้ endpoint `POST /api/content/command`
- โครง workflow อยู่ที่ `src/modules/orchestration/content-workflow.ts`

## CEO AI MVP

CEO AI เป็น supervisor แรกของระบบ ทำหน้าที่:

- รับคำสั่งจาก CEO Command Dashboard
- วิเคราะห์ intent
- ดึง memory และ SOP ที่เกี่ยวข้อง
- สร้าง task หรือ report
- เสนอ action plan ภาษาไทย
- บันทึก feedback เป็น learning event

## Agent Communication

Flow พื้นฐาน:

1. ผู้ใช้ส่ง command
2. ระบบสร้าง conversation thread และ message
3. CEO AI โหลด profile, task, memory, SOP
4. workflow ตัดสินใจว่าจะตอบ สร้าง task หรือสร้าง report
5. action ทุกอย่างถูกบันทึกใน `tool_runs`, `messages`, `tasks`, `reports`
6. feedback ถูกบันทึกใน `agent_feedback` และใช้สร้าง `agent_learning_events`

## Future Multi-Agent Routing

เมื่อเพิ่ม Agent อื่น CEO AI จะทำหน้าที่ supervisor:

- CTO AI: architecture, automation, engineering
- Marketing AI: campaign, content plan, growth
- CFO AI: budget, cashflow, financial report
- Support AI: customer response และ knowledge grounding
