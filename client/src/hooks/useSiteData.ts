import { trpc } from "@/lib/trpc";
import { COMPANY as DEFAULT_COMPANY, CHANNELS as DEFAULT_CHANNELS, type Product as ConstProduct } from "@/const";

/**
 * useSiteData — Centralized site data hook.
 * Fetches products + site settings from backend; falls back to defaults from const.ts
 * so initial render still has values while loading.
 */
export function useSiteData() {
  const productsQuery = trpc.products.listPublic.useQuery(undefined, {
    staleTime: 60_000,
  });
  const settingsQuery = trpc.siteSettings.getAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const settings = settingsQuery.data ?? {};

  const company = {
    nameTh: settings["company.nameTh"] || DEFAULT_COMPANY.nameTh,
    nameEn: settings["company.nameEn"] || DEFAULT_COMPANY.nameEn,
    shopName: settings["company.shopName"] || DEFAULT_COMPANY.shopName,
    tagline: settings["company.tagline"] || DEFAULT_COMPANY.tagline,
    address: settings["company.address"] || DEFAULT_COMPANY.address,
    phone: settings["company.phone"] || DEFAULT_COMPANY.phone,
    phoneDisplay: settings["company.phoneDisplay"] || DEFAULT_COMPANY.phoneDisplay,
    email: settings["company.email"] || DEFAULT_COMPANY.email,
    mapUrl: DEFAULT_COMPANY.mapUrl,
  };

  const channels = {
    shopee: settings["channel.shopee"] || DEFAULT_CHANNELS.shopee,
    facebook: settings["channel.facebook"] || DEFAULT_CHANNELS.facebook,
    tiktok: settings["channel.tiktok"] || DEFAULT_CHANNELS.tiktok,
    line: settings["channel.line"] || DEFAULT_CHANNELS.line,
  };

  // Map DB product rows to the same shape used previously
  const products: ConstProduct[] = (productsQuery.data ?? []).map((p) => ({
    id: p.slug,
    name: p.name,
    subtitle: p.subtitle ?? "",
    shortDesc: p.shortDesc ?? "",
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    size: p.size ?? "",
    price: p.price ?? "",
    promoPrice: p.promoPrice ?? undefined,
    rating: (p.rating ?? 0) / 10,
    sold: p.sold ?? undefined,
    image: p.image ?? "",
    category: p.category ?? "",
    badge: p.badge ?? undefined,
  }));

  return {
    company,
    channels,
    products,
    isLoading: productsQuery.isLoading || settingsQuery.isLoading,
  };
}
