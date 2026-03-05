export const useMediaUrl = () => {
  const config = useRuntimeConfig();
  const requestUrl = useRequestURL();

  const apiBase = String(config.public.apiBase || "").trim();
  const apiOrigin = /^https?:\/\//i.test(apiBase)
    ? new URL(apiBase).origin
    : requestUrl.origin;

  const normalizeMediaUrl = (input?: string | null): string => {
    if (!input) return "";
    const raw = String(input).trim();
    if (!raw || raw === "null" || raw === "undefined") return "";

    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
      if (raw.startsWith("//")) {
        return `${requestUrl.protocol}${raw}`;
      }
      return raw;
    }

    const path = raw.replace(/^\/+/, "");
    return `${apiOrigin.replace(/\/+$/, "")}/${path}`;
  };

  const normalizeMediaList = (input?: string | null): string[] => {
    if (!input) return [];

    const raw = String(input).trim();
    if (!raw || raw === "null" || raw === "undefined") return [];

    let items: string[] = [];

    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          items = parsed.map((item) => String(item ?? "").trim());
        }
      } catch {
        items = [];
      }
    }

    if (items.length === 0 && raw.includes(",")) {
      items = raw.split(",").map((item) => item.trim());
    }

    if (items.length === 0) {
      items = [raw];
    }

    return items.map(normalizeMediaUrl).filter(Boolean);
  };

  return {
    normalizeMediaUrl,
    normalizeMediaList,
  };
};
