# Wijitosot Admin Panel — Todo

## Phase 1: Upgrade
- [ ] อัปเกรดเป็น full-stack ด้วย web-db-user feature
- [ ] อ่าน README ของ template ใหม่หลังอัปเกรด

## Phase 2: Schema & Seed
- [ ] ออกแบบตาราง products (id, name, subtitle, shortDesc, benefits, size, price, promoPrice, rating, sold, image, category, badge, sortOrder, isActive)
- [ ] ออกแบบตาราง site_content (key/value) สำหรับข้อมูลบริษัท/ช่องทางสั่งซื้อ
- [ ] Seed ข้อมูลปัจจุบันเข้าฐานข้อมูล

## Phase 3: API
- [ ] GET /api/products (public)
- [ ] GET /api/site-content (public)
- [ ] CRUD /api/admin/products (auth required, owner only)
- [ ] PUT /api/admin/site-content (auth required, owner only)
- [ ] Image upload endpoint

## Phase 4: Refactor Public Pages
- [ ] เปลี่ยน const.ts เป็นการ fetch API
- [ ] ทำให้ทุก section ดึงข้อมูลจาก backend

## Phase 5: Admin Panel
- [ ] หน้า /admin login
- [ ] หน้า /admin/products รายการ + CRUD
- [ ] หน้า /admin/products/new และ /admin/products/:id (form)
- [ ] หน้า /admin/content แก้ไขข้อมูลบริษัท/ช่องทาง

## Phase 6: Test & Ship
- [ ] ทดสอบทั้ง flow
- [ ] checkpoint และส่งมอบ

## UX Refresh (Snake Brand Audit)
- [x] index.css heading hierarchy + tap targets
- [x] Hero mobile-first + quick-action chips + trust pills
- [x] ProductsSection card redesign + multi-channel CTA dropdown
- [x] StandardsSection trust icon grid (FDA, GMP, แพทย์พัฒนา, ผลิตในไทย)
- [x] AboutSection benefit bullets + accordion
- [x] FloatingChannels labels + Facebook + 44px tap targets
- [x] ContactSection trust badges (ร้านขายยา, จัดส่งทั่วไทย, รับประกัน)
- [x] SiteFooter policy links (นโยบายคืนสินค้า, FAQ)
