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
  shopName: "ร้านขายยาวิจิตรโอสถ",
  tagline: "ร้านขายยาโดยแพทย์ผู้เชี่ยวชาญ",
  registrationNo: "0205567009303",
  registeredOn: "8 กุมภาพันธ์ 2567",
  capital: "1,000,000 บาท",
  category: "การขายส่งสินค้าทางเภสัชภัณฑ์และทางการแพทย์",
  address: "19/3 หมู่ที่ 2 ตำบลหัวถนน อำเภอพนัสนิคม จังหวัดชลบุรี 20140",
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
    subtitle: "Wijit Herb — Bone & Joint Herbal Formula",
    shortDesc:
      "อาหารเสริมสมุนไพรไทย สูตรพัฒนาร่วมกับแพทย์และเภสัชกร ดูแลกระดูก ไขข้อ และเส้นเอ็นที่ตึงตัวจากการใช้งานหนัก",
    benefits: [
      "บำรุงกระดูกและไขข้อ",
      "บรรเทาอาการปวดเรื้อรัง",
      "ผ่อนคลายอาการออฟฟิศซินโดรม",
      "ช่วยให้นอนหลับสบายขึ้น",
    ],
    size: "20 เม็ด / กระปุก",
    price: "฿390",
    promoPrice: "฿899 (โปร 2 ฟรี 1)",
    rating: 4.8,
    sold: "ขายแล้ว 18+ ชิ้น",
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/product-wijitherb-cpuWV2BrDkJaf6zCiHb586.webp",
    category: "อาหารเสริมสมุนไพร",
    badge: "ขายดี",
  },
  {
    id: "turmeric-powder",
    name: "ขมิ้นชันสกัด ชนิดผงชง",
    subtitle: "Turmeric Extract Powder",
    shortDesc:
      "ผงชงดื่มจากขมิ้นชันแท้ 100% ไม่ใส่สี ไม่ใส่สารกันเสีย ช่วยดูแลสุขภาพระบบทางเดินอาหารและตับ",
    benefits: [
      "ดูแลระบบทางเดินอาหาร",
      "บำรุงตับและระบบขับถ่าย",
      "ต้านอนุมูลอิสระ",
      "ผงชงดื่มสะดวกพกพา",
    ],
    size: "100 กรัม / ซอง",
    price: "฿320",
    rating: 4.9,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/product-2-66wTrawfcn2YCynu6iGu5K.webp",
    category: "ผงชงสมุนไพร",
    badge: "ใหม่",
  },
  {
    id: "vitality-cap",
    name: "ไวทัลลิตี้ เฮิร์บ",
    subtitle: "Vitality Herbal Capsule",
    shortDesc:
      "ผลิตภัณฑ์เสริมอาหารชนิดแคปซูล ผสมงาดำ ขมิ้นชัน และสมุนไพรไทยคัดพิเศษ บำรุงร่างกายและสุขภาพเส้นผม",
    benefits: [
      "บำรุงเส้นผมและหนังศีรษะ",
      "เสริมสารต้านอนุมูลอิสระ",
      "ฟื้นฟูร่างกายจากภายใน",
      "ทานง่าย ดูดซึมดี",
    ],
    size: "60 แคปซูล / ขวด",
    price: "฿590",
    rating: 4.7,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/product-3-dCDAvrG3qtxdLea8LHFB9z.webp",
    category: "อาหารเสริมแคปซูล",
  },
  {
    id: "liver-tincture",
    name: "ลิเวอร์ ซัพพอร์ต ทิงเจอร์",
    subtitle: "Liver Support Herbal Tincture",
    shortDesc:
      "ทิงเจอร์สมุนไพรเข้มข้น สกัดเย็นจากสมุนไพรไทยที่ช่วยฟื้นฟูตับ เสริมการขับสารพิษและปรับสมดุลร่างกาย",
    benefits: [
      "บำรุงและฟื้นฟูตับ",
      "ขับสารพิษตามธรรมชาติ",
      "ใช้ปริมาณน้อย ดูดซึมเร็ว",
      "ขวดหยดสะดวกใช้",
    ],
    size: "30 มล. / ขวด",
    price: "฿790",
    rating: 4.8,
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663685131820/kMKPed9PK4PhoRn6gWeuQ3/product-4-DPYmbhXuHyc9HpvgiS2axN.webp",
    category: "สารสกัดสมุนไพร",
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
