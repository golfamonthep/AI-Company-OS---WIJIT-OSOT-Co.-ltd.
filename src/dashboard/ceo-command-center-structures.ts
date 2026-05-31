export type CeoPlanStructure = {
  key: string;
  label: string;
  step: string;
  owner: string;
  status: string;
  detail: string;
};

export type DelegatedTaskStructure = {
  key: string;
  name: string;
  role: string;
  status: string;
  currentWork: string;
};

export type ApprovalStateStructure = {
  key: string;
  label: string;
  summary: string;
  risk: string;
};

export type MemoryItemStructure = {
  key: string;
  title: string;
  detail: string;
  type: string;
  confirmationNote: string;
};

export type DailyBriefItemStructure = {
  key: string;
  text: string;
  source: string;
};

export const defaultCeoPlans: CeoPlanStructure[] = [
  {
    key: "offer-campaign-plan",
    label: "เสนอแผน",
    step: "เสนอแผนแคมเปญ TikTok สำหรับแม่และเด็ก",
    owner: "CEO AI",
    status: "เสนอแผน",
    detail: "สรุปเป้าหมาย กลุ่มลูกค้า ข้อความหลัก และงานที่ต้องรออนุมัติก่อนเริ่มใช้จริง"
  },
  {
    key: "review-customer-angle",
    label: "วิเคราะห์ลูกค้า",
    step: "ตรวจมุมสื่อสารสำหรับคุณแม่มือใหม่",
    owner: "ทีมวิเคราะห์ลูกค้า",
    status: "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
    detail: "เน้นความมั่นใจ ความปลอดภัย และคำแนะนำที่เข้าใจง่ายสำหรับการดูแลลูก"
  },
  {
    key: "draft-content-pack",
    label: "เตรียมคอนเทนต์",
    step: "ร่างฮุก แคปชัน และสคริปต์สั้น",
    owner: "ทีมคอนเทนต์",
    status: "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
    detail: "ทำเป็นชุดตรวจง่ายก่อนนำไปใช้ ไม่กล่าวอ้างเกินจริง และไม่ถูกนำไปใช้เอง"
  },
  {
    key: "approval-before-use",
    label: "รออนุมัติ",
    step: "รออนุมัติก่อนใช้จริง",
    owner: "คุณ + CEO AI",
    status: "รออนุมัติ",
    detail: "CEO AI ช่วยสรุปสิ่งที่ต้องตัดสินใจ แต่คุณเป็นคนยืนยันก่อนดำเนินการ"
  }
];

export const defaultDelegatedTasks: DelegatedTaskStructure[] = [
  {
    key: "marketing-angle",
    name: "Marketing AI",
    role: "ช่วยวิเคราะห์ลูกค้าและมุมสื่อสาร",
    status: "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
    currentWork: "เตรียมมุมแคมเปญสำหรับคุณแม่มือใหม่ที่ต้องการข้อมูลชัดเจนและน่าเชื่อถือ"
  },
  {
    key: "content-pack",
    name: "Content Creator AI",
    role: "ช่วยร่างคอนเทนต์ให้ CEO AI ตรวจทาน",
    status: "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
    currentWork: "เตรียมฮุก แคปชัน และสคริปต์ที่รอคุณตรวจยืนยันก่อนใช้จริง"
  },
  {
    key: "ads-readiness",
    name: "Ads Performance AI",
    role: "ช่วยประเมินความพร้อมก่อนลงโฆษณา",
    status: "พร้อมดำเนินการเมื่อได้รับอนุมัติ",
    currentWork: "เตรียมข้อควรระวังด้านงบ กลุ่มเป้าหมาย และความคาดหวังผลลัพธ์"
  }
];

export const defaultApprovalStates: ApprovalStateStructure[] = [
  {
    key: "waiting-content-approval",
    label: "รออนุมัติ",
    summary: "ชุดคอนเทนต์รอให้คุณตรวจข้อความก่อนใช้จริง",
    risk: "ปานกลาง"
  },
  {
    key: "waiting-budget-approval",
    label: "รออนุมัติ",
    summary: "คำแนะนำด้านงบโฆษณาต้องรอคุณยืนยันก่อนดำเนินการ",
    risk: "สูง"
  },
  {
    key: "approved-internal-note",
    label: "บันทึกหลังยืนยัน",
    summary: "บทเรียนจากงานที่ผ่านการตรวจจะบันทึกหลังคุณยืนยัน",
    risk: "ต่ำ"
  }
];

export const defaultMemoryItems: MemoryItemStructure[] = [
  {
    key: "brand-voice-thai-mom",
    title: "น้ำเสียงสำหรับกลุ่มแม่และเด็ก",
    detail: "ใช้ภาษาง่าย อบอุ่น ไม่กดดัน และให้เหตุผลที่ตรวจสอบได้ก่อนชวนซื้อ",
    type: "brand",
    confirmationNote: "บันทึกเป็นความจำหลังผู้ใช้ยืนยัน"
  },
  {
    key: "approval-before-publishing",
    title: "กฎก่อนนำงานไปใช้จริง",
    detail: "ข้อความแคมเปญ คำแนะนำเรื่องงบ และการติดต่อลูกค้าต้องรอคุณอนุมัติก่อน",
    type: "การอนุมัติ",
    confirmationNote: "บันทึกเป็นความจำหลังผู้ใช้ยืนยัน"
  },
  {
    key: "winning-content-angle",
    title: "มุมคอนเทนต์ที่ควรทดลอง",
    detail: "แนวทางแบบเช็กลิสต์และคำแนะนำที่ช่วยลดความกังวล เหมาะกับกลุ่มคุณแม่มือใหม่",
    type: "แคมเปญ",
    confirmationNote: "บันทึกเป็นความจำหลังผู้ใช้ยืนยัน"
  }
];

export const defaultDailyBriefItems: DailyBriefItemStructure[] = [
  {
    key: "sales-and-content-focus",
    text: "วันนี้ควรดูยอดขายเบื้องต้น พร้อมแผนคอนเทนต์ที่ CEO AI เสนอไว้",
    source: "CEO AI"
  },
  {
    key: "approval-first",
    text: "มีงานที่รออนุมัติให้ตรวจ ก่อนนำข้อความหรือคำแนะนำด้านงบไปใช้จริง",
    source: "การอนุมัติ"
  },
  {
    key: "memory-after-confirmation",
    text: "บทเรียนจากรอบนี้จะถูกบันทึกหลังคุณยืนยันเท่านั้น",
    source: "บทเรียน"
  }
];
