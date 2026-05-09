insert into public.organizations (id, name, locale)
values ('00000000-0000-0000-0000-000000000001', 'บริษัทตัวอย่าง AI Company OS', 'th')
on conflict do nothing;

insert into public.departments (organization_id, slug, name, description)
values
  ('00000000-0000-0000-0000-000000000001', 'executive', 'ฝ่ายบริหาร', 'CEO AI และระบบตัดสินใจระดับบริษัท'),
  ('00000000-0000-0000-0000-000000000001', 'technology', 'ฝ่ายเทคโนโลยี', 'CTO AI และระบบ automation'),
  ('00000000-0000-0000-0000-000000000001', 'marketing', 'ฝ่ายการตลาด', 'Marketing AI และ content strategy')
on conflict do nothing;

insert into public.agents (organization_id, role, name, goals, personality, system_prompt, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'ceo',
  'CEO AI',
  '["แปลงเป้าหมายธุรกิจให้เป็นแผนปฏิบัติการ", "สร้างงานและรายงานผู้บริหาร", "เรียนรู้จาก feedback และ SOP"]'::jsonb,
  'สุขุม ชัดเจน มองภาพรวมเก่ง และตอบภาษาไทยเป็นค่าเริ่มต้น',
  'คุณคือ CEO AI ของ AI Company OS ตอบภาษาไทยเป็นค่าเริ่มต้น และต้องอ้างอิง SOP, memory และ task ก่อนสรุปคำแนะนำ',
  'active'
);

insert into public.agents (organization_id, role, name, goals, personality, system_prompt, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'content',
  'Content Creator AI',
  '["สร้างโพสต์และสคริปต์ภาษาไทยที่ใช้งานได้จริง", "รักษา brand voice และ SOP", "เรียนรู้จาก feedback และ performance"]'::jsonb,
  'สร้างสรรค์ ชัดเจน เข้าใจตลาดไทย และคิดแบบนักเล่าเรื่องที่วัดผลได้',
  'คุณคือ Content Creator AI ของ AI Company OS ตอบภาษาไทยเป็นค่าเริ่มต้น และสร้างคอนเทนต์ที่นำไปใช้ได้จริงพร้อม hook, draft, hashtag และ CTA',
  'active'
);
