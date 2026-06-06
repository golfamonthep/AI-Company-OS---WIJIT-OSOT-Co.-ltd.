# Wijitosot Admin Panel — Todo

## Phase 1: Upgrade
- [x] อัปเกรดเป็น full-stack ด้วย web-db-user feature
- [x] อ่าน README ของ template ใหม่หลังอัปเกรด

## Phase 2: Schema & Seed
- [x] ออกแบบตาราง products (id, name, subtitle, shortDesc, benefits, size, price, promoPrice, rating, sold, image, category, badge, sortOrder, isActive)
- [x] ออกแบบตาราง site_content (key/value) สำหรับข้อมูลบริษัท/ช่องทางสั่งซื้อ
- [x] Seed ข้อมูลปัจจุบันเข้าฐานข้อมูล

## Phase 3: API
- [x] GET /api/products (public)
- [x] GET /api/site-content (public)
- [x] CRUD /api/admin/products (auth required, owner only)
- [x] PUT /api/admin/site-content (auth required, owner only)
- [x] Image upload endpoint

## Phase 4: Refactor Public Pages
- [x] เปลี่ยน const.ts เป็นการ fetch API
- [x] ทำให้ทุก section ดึงข้อมูลจาก backend

## Phase 5: Admin Panel
- [x] หน้า /admin login
- [x] หน้า /admin/products รายการ + CRUD
- [x] หน้า /admin/products/new และ /admin/products/:id (form)
- [x] หน้า /admin/content แก้ไขข้อมูลบริษัท/ช่องทาง

## Phase 6: Test & Ship
- [x] ทดสอบทั้ง flow
- [x] checkpoint และส่งมอบ

## UX Refresh (Snake Brand Audit)
- [x] index.css heading hierarchy + tap targets
- [x] Hero mobile-first + quick-action chips + trust pills
- [x] ProductsSection card redesign + multi-channel CTA dropdown
- [x] StandardsSection trust icon grid (FDA, GMP, แพทย์พัฒนา, ผลิตในไทย)
- [x] AboutSection benefit bullets + accordion
- [x] FloatingChannels labels + Facebook + 44px tap targets
- [x] ContactSection trust badges (ร้านขายยา, จัดส่งทั่วไทย, รับประกัน)
- [x] SiteFooter policy links (นโยบายคืนสินค้า, FAQ)

## Admin Panel Development
- [x] ตรวจสอบ schema products ที่มีอยู่ใน drizzle/schema.ts
- [x] เพิ่ม CRUD procedures ใน routers.ts (createProduct, updateProduct, deleteProduct, adminOnly)
- [x] เพิ่ม image upload procedure (storagePut)
- [x] สร้างหน้า /admin — redirect ไป /admin/products ถ้า login แล้ว
- [x] สร้างหน้า /admin/products — ตารางสินค้าพร้อมปุ่ม เพิ่ม/แก้ไข/ลบ
- [x] สร้างหน้า /admin/products/new — ฟอร์มเพิ่มสินค้า + อัปโหลดรูป
- [x] สร้างหน้า /admin/products/:id — ฟอร์มแก้ไขสินค้า + อัปโหลดรูป
- [x] ลงทะเบียน routes ใน App.tsx
- [x] ทดสอบ CRUD flow ครบ (เพิ่ม/แก้ไข/ลบ/อัปโหลดรูป)
- [x] checkpoint และส่งมอบ Admin Panel
