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
  shopeeUrl?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "chatuphalathika-cap",
    name: "จตุผลาธิกะแบบแคป 1 กระปุก 60 เม็ด",
    subtitle: "สมอเทศ สมอไทย สมอพิเภก มะขามป้อม",
    shortDesc:
      "จตุผลาธิกะแบบแคป 1 กระปุก 60 เม็ด สมอเทศ สมอไทย สมอพิเภก มะขามป้อม สมุนไพรไทยตำรับโบราณ",
    benefits: [
      "สมอเทศ สมอไทย สมอพิเภก มะขามป้อม",
      "สูตรเข้มข้น วิตามินซีสูงกว่าส้ม 20 เท่า",
      "ปลอดภัย 100% ไม่มีสารเคมี",
      "ทานง่าย 1-2 แคปซูล/วัน",
    ],
    size: "60 แคปซูล / กระปุก",
    price: "฿259 – ฿499",
    rating: 5.0,
    sold: "2 Ratings",
    image: "/manus-storage/product_1_3eac1feb.jpg",
    category: "สมุนไพรไทย",
    badge: "สมุนไพรไทย",
    shopeeUrl: "https://shopee.co.th/%E0%B8%88%E0%B8%95%E0%B8%B8%E0%B8%9C%E0%B8%A5%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%81%E0%B8%B0%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B9%81%E0%B8%84%E0%B8%9B-1-%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%9B%E0%B8%B8%E0%B8%81-60-%E0%B9%80%E0%B8%A1%E0%B9%87%E0%B8%94-%E0%B8%AA%E0%B8%A1%E0%B8%AD%E0%B9%80%E0%B8%97%E0%B8%A8-%E0%B8%AA%E0%B8%A1%E0%B8%AD%E0%B9%84%E0%B8%97%E0%B8%A2-%E0%B8%AA%E0%B8%A1%E0%B8%AD%E0%B8%9E%E0%B8%B4%E0%B9%80%E0%B8%A0%E0%B8%81-%E0%B8%A1%E0%B8%B0%E0%B8%82%E0%B8%B2%E0%B8%A1%E0%B8%9B%E0%B9%89%E0%B8%AD%E0%B8%A1-i.749331879.49560811863",
  },
  {
    id: "wijitherb-bone-joint",
    name: "วิจิตรเฮิร์บ วิจิตรโอสถ อาหารเสริมดูแลกระดูก ไขข้อ เส้นเอ็นตึง บรรเทาอาการนอนไม่หลับ ของแท้ 100% (20เม็ด กระปุก)",
    subtitle: "WIJITHERB — Bone & Joint Herbal Formula",
    shortDesc:
      "วิจิตรเฮิร์บ อาหารเสริมดูแลกระดูก ไขข้อ เส้นเอ็นตึง บรรเทาอาการนอนไม่หลับ ของแท้ 100%",
    benefits: [
      "ดูแลกระดูก ไขข้อ เส้นเอ็น",
      "บรรเทาอาการนอนไม่หลับ",
      "ของแท้ 100% จากวิจิตรโอสถ",
      "ผลิตภัณฑ์โดยแพทย์และเภสัชกร",
    ],
    size: "20 เม็ด / กระปุก",
    price: "฿390",
    rating: 4.8,
    sold: "6 Ratings",
    image: "/manus-storage/product_2_ef5879d5.jpg",
    category: "ผลิตภัณฑ์เสริมอาหาร",
    badge: "ของแท้ 100%",
    shopeeUrl: "https://shopee.co.th/%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%80%E0%B8%AE%E0%B8%B4%E0%B8%A3%E0%B9%8C%E0%B8%9A-%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%82%E0%B8%AD%E0%B8%AA%E0%B8%96-%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%AA%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%94%E0%B8%B9%E0%B9%81%E0%B8%A5%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B9%E0%B8%81-%E0%B9%84%E0%B8%82%E0%B8%82%E0%B9%89%E0%B8%AD-%E0%B9%80%E0%B8%AA%E0%B9%89%E0%B8%99%E0%B9%80%E0%B8%AD%E0%B9%87%E0%B8%99%E0%B8%95%E0%B8%B6%E0%B8%87-%E0%B8%9A%E0%B8%A3%E0%B8%A3%E0%B9%80%E0%B8%97%E0%B8%B2%E0%B8%AD%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%99%E0%B8%AD%E0%B8%99%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%9A-%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%81%E0%B8%97%E0%B9%89-100-(20%E0%B9%80%E0%B8%A1%E0%B9%87%E0%B8%94-%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%9B%E0%B8%B8%E0%B8%81)-i.749331879.51854615040",
  },
  {
    id: "cha-chatuphalathika-30",
    name: "ชาจตุผลาธิกะ 1 ถุง 30 ซองชา ชาสมุนไพรวิจิตรโอสถ ชา จตุผลาธิกะ ( ถุงกรองชาทำจากใยข้าวโพด )",
    subtitle: "ชาสมุนไพรวิจิตรโอสถ — Herbal Tea",
    shortDesc:
      "ชาจตุผลาธิกะ 1 ถุง 30 ซองชา ชาสมุนไพรวิจิตรโอสถ ถุงกรองชาทำจากใยข้าวโพด",
    benefits: [
      "ชาสมุนไพรตำรับโบราณ",
      "ถุงกรองชาจากใยข้าวโพด",
      "ดื่มง่าย สะดวก",
      "30 ซอง / ถุง",
    ],
    size: "30 ซอง / ถุง",
    price: "฿140",
    rating: 4.9,
    sold: "174 Ratings",
    image: "/manus-storage/product_3_43a64b4a.jpg",
    category: "ชาสมุนไพร",
    badge: "ขายดี",
    shopeeUrl: "https://shopee.co.th/%E0%B8%8A%E0%B8%B2%E0%B8%88%E0%B8%95%E0%B8%B8%E0%B8%9C%E0%B8%A5%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%81%E0%B8%B0-1-%E0%B8%96%E0%B8%B8%E0%B8%87-30-%E0%B8%8B%E0%B8%AD%E0%B8%87%E0%B8%8A%E0%B8%B2-%E0%B8%8A%E0%B8%B2%E0%B8%AA%E0%B8%A1%E0%B8%B8%E0%B8%99%E0%B9%84%E0%B8%9E%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%82%E0%B8%AD%E0%B8%AA%E0%B8%96-%E0%B8%8A%E0%B8%B2-%E0%B8%88%E0%B8%95%E0%B8%B8%E0%B8%9C%E0%B8%A5%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%81%E0%B8%B0-(-%E0%B8%96%E0%B8%B8%E0%B8%87%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%97%E0%B8%B3%E0%B8%88%E0%B8%B2%E0%B8%81%E0%B9%83%E0%B8%A2%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B9%82%E0%B8%9E%E0%B8%94-)-i.749331879.42408454925",
  },
  {
    id: "chatuphalathika-grade-a",
    name: "จตุผลาธิกะ (เกรดเอ) 120 กรัม + ถุงกรองชา สมุนไพรวิจิตรโอสถ",
    subtitle: "สมุนไพรวิจิตรโอสถ — เกรดเอ",
    shortDesc:
      "จตุผลาธิกะ (เกรดเอ) 120 กรัม + ถุงกรองชา สมุนไพรวิจิตรโอสถ คุณภาพสูง",
    benefits: [
      "จตุผลาธิกะเกรดเอ คัดพิเศษ",
      "120 กรัม พร้อมถุงกรองชา",
      "สมุนไพรไทยแท้ 100%",
      "มีให้เลือก 1 ถุง หรือ 3 ถุง",
    ],
    size: "120 กรัม + ถุงกรองชา",
    price: "฿55 – ฿110",
    rating: 4.9,
    sold: "99 Ratings",
    image: "/manus-storage/product_4_81445497.jpg",
    category: "สมุนไพรไทย",
    badge: "เกรดเอ",
    shopeeUrl: "https://shopee.co.th/%E0%B8%88%E0%B8%95%E0%B8%B8%E0%B8%9C%E0%B8%A5%E0%B8%B2%E0%B8%98%E0%B8%B4%E0%B8%81%E0%B8%B0-(%E0%B9%80%E0%B8%81%E0%B8%A3%E0%B8%94%E0%B9%80%E0%B8%AD)-120-%E0%B8%81%E0%B8%A3%E0%B8%B1%E0%B8%A1-%E0%B8%96%E0%B8%B8%E0%B8%87%E0%B8%81%E0%B8%A3%E0%B8%AD%E0%B8%87%E0%B8%8A%E0%B8%B2-%E0%B8%AA%E0%B8%A1%E0%B8%B8%E0%B8%99%E0%B9%84%E0%B8%9E%E0%B8%A3%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%82%E0%B8%AD%E0%B8%AA%E0%B8%96-i.749331879.40758454118",
  },
  {
    id: "black-coffee-tea",
    name: "(1 แถม 1) ชากาแฟดำ ตรา วิจิตรโอสถ กาแฟดำเพื่อสุขภาพ บำรุงข้อเข่า กระดูก บำรุงสายตา ผลิตภัณฑ์โดยแพทย์และเภสัชกร",
    subtitle: "BLACK COFFEE TEA Mix-Herbs — วิจิตรโอสถ",
    shortDesc:
      "(1 แถม 1) ชากาแฟดำ ตรา วิจิตรโอสถ กาแฟดำเพื่อสุขภาพ บำรุงข้อเข่า กระดูก บำรุงสายตา",
    benefits: [
      "บำรุงข้อเข่า กระดูก",
      "บำรุงสายตา",
      "0% น้ำตาล ไม่มีคอเลสเตอรอล",
      "ผลิตโดยแพทย์และเภสัชกร",
    ],
    size: "1 แถม 1",
    price: "฿199",
    rating: 4.8,
    sold: "5 Ratings",
    image: "/manus-storage/product_5_01a02cc9.jpg",
    category: "ชาสมุนไพร",
    badge: "1 แถม 1",
    shopeeUrl: "https://shopee.co.th/(1-%E0%B9%81%E0%B8%96%E0%B8%A1-1-)-%E0%B8%8A%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B9%81%E0%B8%9F%E0%B8%94%E0%B8%B3-%E0%B8%95%E0%B8%A3%E0%B8%B2-%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%82%E0%B8%AD%E0%B8%AA%E0%B8%96-%E0%B8%81%E0%B8%B2%E0%B9%81%E0%B8%9F%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%9E%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B8%A0%E0%B8%B2%E0%B8%9E-%E0%B8%9A%E0%B8%B3%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B9%80%E0%B8%82%E0%B9%88%E0%B8%B2-%E0%B8%81%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B9%E0%B8%81-%E0%B8%9A%E0%B8%B3%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B8%95%E0%B8%B2-%E0%B8%9C%E0%B8%A5%E0%B8%B4%E0%B8%95%E0%B8%A0%E0%B8%B1%E0%B8%93%E0%B8%91%E0%B9%8C%E0%B9%82%E0%B8%94%E0%B8%A2%E0%B9%81%E0%B8%9E%E0%B8%97%E0%B8%A2%E0%B9%8C%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B9%80%E0%B8%A0%E0%B8%AA%E0%B8%B1%E0%B8%8A%E0%B8%81%E0%B8%A3-i.749331879.28573606489",
  },
  {
    id: "cha-bumrung-satri",
    name: "(-1แถม 1-) ชาบำรุงสตรี ตรา วิจิตรโอสถ บำรุงมดลูก ปรับฮอร์โมน ช่วยให้ประจำเดือนมาปกติ ฟิต ช่องคลอดแห้ง น้องสาวมีกลิ่น",
    subtitle: "PEACH TEA ชาพลัสสมุนไพร — วิจิตรโอสถ",
    shortDesc:
      "(-1แถม 1-) ชาบำรุงสตรี ตรา วิจิตรโอสถ บำรุงมดลูก ปรับฮอร์โมน ช่วยให้ประจำเดือนมาปกติ ฟิต",
    benefits: [
      "บำรุงมดลูก ปรับฮอร์โมน",
      "ช่วยให้ประจำเดือนมาปกติ",
      "0% น้ำตาล ไม่มีไขมันทรานส์",
      "ผลิตโดยแพทย์และเภสัชกร",
    ],
    size: "1 แถม 1",
    price: "฿222",
    rating: 4.9,
    sold: "14 Ratings",
    image: "/manus-storage/product_6_4a2ee045.jpg",
    category: "ชาสมุนไพร",
    badge: "1 แถม 1",
    shopeeUrl: "https://shopee.co.th/(-1%E0%B9%81%E0%B8%96%E0%B8%A1-1-)-%E0%B8%8A%E0%B8%B2%E0%B8%9A%E0%B8%B3%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B8%B5-%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%88%E0%B8%B4%E0%B8%95%E0%B8%A3%E0%B9%82%E0%B8%AD%E0%B8%AA%E0%B8%96-%E0%B8%9A%E0%B8%B3%E0%B8%A3%E0%B8%B8%E0%B8%87%E0%B8%A1%E0%B8%94%E0%B8%A5%E0%B8%B9%E0%B8%81-%E0%B8%9B%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%AE%E0%B8%AD%E0%B8%A3%E0%B9%8C%E0%B9%82%E0%B8%A1%E0%B8%99-%E0%B8%8A%E0%B9%88%E0%B8%A7%E0%B8%A2%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%88%E0%B8%B3%E0%B9%80%E0%B8%94%E0%B8%B7%E0%B8%AD%E0%B8%99%E0%B8%A1%E0%B8%B2%E0%B8%9B%E0%B8%81%E0%B8%95%E0%B8%B4-%E0%B8%9F%E0%B8%B4%E0%B8%95-%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B9%81%E0%B8%AB%E0%B9%89%E0%B8%87-%E0%B8%99%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B8%A5%E0%B8%B4%E0%B9%88%E0%B8%99-i.749331879.28773615928",
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


// Manus OAuth helper — used by useAuth() and main.tsx for unauthorized redirects
export function getLoginUrl(returnPath?: string) {
  const portalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL as string | undefined;
  const appId = import.meta.env.VITE_APP_ID as string | undefined;
  if (!portalUrl || !appId) return "/";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const state = btoa(JSON.stringify({ origin, returnPath: returnPath || "/" }));
  return `${portalUrl}/oauth/authorize?app_id=${appId}&state=${encodeURIComponent(state)}`;
}
