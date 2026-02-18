import { cookies } from "next/headers";

import { BAMBOO_LOCALE_COOKIE_KEY, parseBambooLocale } from "@/lib/bamboo-i18n";

export async function getBambooLocale() {
  const cookieStore = await cookies();
  return parseBambooLocale(cookieStore.get(BAMBOO_LOCALE_COOKIE_KEY)?.value);
}
