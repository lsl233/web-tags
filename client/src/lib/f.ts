import { useStore } from "@/lib/hooks/store.hook";

interface FetchJSONOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | { [key: string]: any } | null;
}
export const f = async <T = any>(
  url: string,
  options: FetchJSONOptions = {}
) => {
  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
  ) {
    options.body = JSON.stringify(options.body);
  }

  if (!url.startsWith("http")) {
    url = `${process.env.API_URL}${url}`;
  }

  const tokenStore = await chrome.storage.local.get("token");

  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  if (tokenStore.token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${tokenStore.token}`,
    };
  }

  options.credentials = "include";

  const res = await fetch(url, options as RequestInit);

  const json = await res.json();
  if (!res.ok) {
    switch (res.status) {
      case 401:
        await chrome.storage.local.remove("token");
        useStore.getState().setSignDialogOpen(true);
        return;
      default:
        alert(json.message);
    }
    throw new Error(json.message);
  }
  return json as T;
};
