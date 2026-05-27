// Brand assets and shared constants — Wijitosot Co., Ltd.

export const LOGO_URL = "/manus-storage/logo-WIJITOSOT_a6114035.webp";

export const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/hero-herbs-SeYFqQXLkzh8kP3fkYZiWx.webp";
export const ABOUT_LAB_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/about-lab-KGHKeuetxaUT6r9Exy4Sui.webp";
export const HERB_LINE_ART =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/herb-illustration-VXNm5kwrktPFu7Rwck9zSR.webp";

export const COMPANY = {
  nameTh: "บริษัท วิจิตรโอสถ จำกัด",
  nameEn: "WIJITOSOT CO., LTD.",
  shopName: "ห้างขายยาวิจิตรโอสถ",
  tagline: "ร้านขายยาโดยแพทย์และเภสัชกรผู้เชี่ยวชาญ",
  address:
    "19/3 หมู่ที่ 2 ตำบลหัวถนน อำเภอพนัสนิคม จังหวัดชลบุรี 20140",
  phone: "+66 95 464 1103",
  phoneDisplay: "095 464 1103",
  email: "wijit.osot@gmail.com",
  mapUrl:
    "https://www.google.co.th/maps/search/19%2F3+%E0%B8%AB%E0%B8%A1%E0%B8%B9%E0%B9%88%E0%B8%97%E0%B8%B5%E0%B9%88+2+%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%96%E0%B8%99%E0%B8%99+%E0%B8%9E%E0%B8%99%E0%B8%B1%E0%B8%AA%E0%B8%99%E0%B8%B4%E0%B8%84%E0%B8%A1+%E0%B8%8A%E0%B8%A5%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5",
};

export const CHANNELS = {
  shopee: "https://shopee.co.th/wijit.osotthailand",
  shopeeAlt: "https://shopee.co.th/wijit_osot",
  facebook: "https://web.facebook.com/wijit.osot/",
  tiktok: "https://www.tiktok.com/@cher_antiaging",
  // LINE — placeholder; user can update later
  line: "https://line.me/R/ti/p/~wijitosot",
} as const;

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  shortDesc: string;
  benefits: string[];
  size: string;
  price: string;
  promoPrice?: string;
  rating: number;
  sold?: string;
  image: string;
  category: string;
  badge?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "wijit-herb",
    name: "วิจิตรเฮิร์บ",
    subtitle: "WIJITHERB — Bone & Joint Herbal Formula",
    shortDesc:
      "ผลิตภัณฑ์เสริมอาหารสมุนไพรไทย สูตรเฉพาะของห้างขายยาวิจิตรโอสถ ดูแลกระดูก ไขข้อ และเส้นเอ็นที่ตึงตัวจากการใช้งานหนัก",
    benefits: [
      "บำรุงกระดูกและข้อเข่า",
      "บรรเทาอาการปวดเรื้อรัง",
      "ผ่อนคลายอาการออฟฟิศซินโดรม",
      "ทานต่อเนื่องเห็นผลชัดเจน",
    ],
    size: "20 แคปซูล / กระปุก",
    price: "฿390",
    promoPrice: "โปรโมชั่น 2 ฟรี 1",
    rating: 4.9,
    sold: "สินค้าขายดี",
    image: "/manus-storage/wijit-shop-cover_5e4287ea.jpg",
    category: "ผลิตภัณฑ์เสริมอาหาร",
    badge: "2 แถม 1",
  },
  {
    id: "chers-s168",
    name: "เฌอเอส (CHER'S S168)",
    subtitle: "CHER'S Dietary Supplement Product",
    shortDesc:
      "ผลิตภัณฑ์เสริมอาหารสมุนไพรหมอเชอ สูตรช่วยควบคุมน้ำหนัก ลดการสะสมไขมัน ขับโซเดียมส่วนเกิน ได้รับรีวิวจากผู้ใช้จริงจำนวนมาก",
    benefits: [
      "ช่วยคุมหิว ลดจุกจิก",
      "ลดการสะสมของไขมัน",
      "เสริมการเผาผลาญ",
      "ทานง่าย วันละ 1 แคปซูล",
    ],
    size: "10 แคปซูล / กล่อง",
    price: "฿290",
    promoPrice: "2 กล่อง ฿580",
    rating: 4.9,
    sold: "Best Seller",
    image: "/manus-storage/chers-s168-real_0af158b1.jpg",
    category: "ผลิตภัณฑ์เสริมอาหาร",
    badge: "Best Seller",
  },
  {
    id: "ssure-plus",
    name: "S SURE PLUS",
    subtitle: "DR.CHER — สูตรสำหรับสายดื้อ",
    shortDesc:
      "ผลิตภัณฑ์เสริมอาหารสูตรใหม่สำหรับคนที่ทานอาหารเสริมสูตรอื่นแล้วยังไม่เห็นผล ออกแบบเพื่อสายดื้อโดยเฉพาะ",
    benefits: [
      "คุมหิว ลดจุกจิก",
      "อิ่มนาน อิ่มไวขึ้น",
      "เร่งการเผาผลาญ",
      "ลดการสะสมไขมัน",
    ],
    size: "10 แคปซูล / กระปุก",
    price: "฿390",
    rating: 4.8,
    image: "/manus-storage/splus-real_12b2fc2f.jpg",
    category: "ผลิตภัณฑ์เสริมอาหาร",
    badge: "สูตรใหม่",
  },
  {
    id: "win-herb",
    name: "วิน-เฮิร์บ (Win-Herb)",
    subtitle: "ส่วนผสมสมุนไพร 19 ชนิด",
    shortDesc:
      "ผลิตภัณฑ์เสริมอาหารผสมสารสกัดจากสมุนไพร 19 ชนิด ทั้งโสมเกาหลี ถั่งเช่า เห็ดหลินจือ เก๋ากี้ ขมิ้นชัน เจียวกู่หลาน ฯลฯ",
    benefits: [
      "บำรุงร่างกายโดยรวม",
      "เสริมภูมิคุ้มกัน",
      "ฟื้นฟูจากความอ่อนเพลีย",
      "ส่วนผสมพรีเมียม",
    ],
    size: "30 เม็ด / กล่อง",
    price: "฿1,090",
    promoPrice: "2 กล่อง ฿1,090",
    rating: 4.9,
    image: "/manus-storage/winherb-real_790883df.jpg",
    category: "ผลิตภัณฑ์เสริมอาหาร",
    badge: "Premium",
  },
  {
    id: "chatuphalathika",
    name: "จตุผลาธิกะ หริเฮิร์บ",
    subtitle: "Chatuphalatika — Herbal Detox",
    shortDesc:
      "สมุนไพรไทยตำรับโบราณ ช่วยขับส่วนเกิน ดูแลระบบขับถ่าย และปรับสมดุลร่างกาย คัดเลือกวัตถุดิบคุณภาพสูงโดยเภสัชกร",
    benefits: [
      "ขับส่วนเกินตามธรรมชาติ",
      "ดูแลระบบขับถ่าย",
      "ปรับสมดุลร่างกาย",
      "มีให้เลือก 3 ขนาด",
    ],
    size: "ซองชง / มี 3 ขนาด",
    price: "฿199",
    rating: 4.8,
    image: "/manus-storage/chatuphalathika-real_023bc8dc.jpg",
    category: "สมุนไพรไทย",
    badge: "สมุนไพรไทย",
  },
];

export const STANDARDS = [
  {
    code: "FDA",
    label: "อย. รับรอง",
    desc: "ผลิตภัณฑ์ผ่านการขึ้นทะเบียนกับสำนักงานคณะกรรมการอาหารและยา",
  },
  {
    code: "GMP",
    label: "GMP มาตรฐาน",
    desc: "ผลิตในโรงงานที่ได้รับการรับรองมาตรฐาน Good Manufacturing Practice",
  },
  {
    code: "HERBAL",
    label: "สมุนไพรไทยแท้",
    desc: "วัตถุดิบสมุนไพรคัดพิเศษจากแหล่งปลูกที่เชื่อถือได้ในประเทศไทย",
  },
  {
    code: "MD",
    label: "พัฒนาโดยแพทย์",
    desc: "สูตรพัฒนาร่วมกับแพทย์ผู้เชี่ยวชาญและเภสัชกร เพื่อประสิทธิภาพและความปลอดภัย",
  },
];
