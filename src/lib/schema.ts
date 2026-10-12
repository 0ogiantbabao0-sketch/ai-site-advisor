import { z } from "zod";
import { validDate } from "./dates";
export function publicUrl(raw: string, httpsOnly = false): string | null {
  try {
    const u = new URL(raw);
    if (
      !(httpsOnly ? ["https:"] : ["https:", "http:"]).includes(u.protocol) ||
      u.username ||
      u.password ||
      u.port
    )
      return null;
    const host = u.hostname.toLowerCase();
    if (
      !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
      /\.(local|localhost|internal|invalid|test)$/.test(host)
    )
      return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}
export const inputSchema = z
  .object({
    area: z.string().trim().min(2, "駅名・地域を入力してください").max(120),
    radius: z.number().int().min(5).max(100),
    targetDate: z
      .string()
      .refine(
        (s) => validDate(s) && s >= "2020-01-01" && s <= "2100-12-31",
        "対象日が不正です",
      ),
    machines: z.array(z.string().trim().min(1).max(100)).max(5),
    preferredSites: z
      .array(
        z
          .string()
          .max(500)
          .refine(
            (s) => !!publicUrl(s, true),
            "調査先は公開サイトのHTTPS URLで指定してください",
          ),
      )
      .max(5),
    notes: z.string().trim().max(600),
  })
  .strict();
