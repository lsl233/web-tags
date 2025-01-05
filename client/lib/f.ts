import { useStore } from "@/lib/hooks/store.hook";
import { toast } from "sonner";
import { ZodError } from "zod";

interface FetchJSONOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | { [key: string]: any } | null;
  query?: { [key: string]: any } | null;
}

// interface FetchResponseError extends Response, Error {}

class FetchResponseError extends Error {
  status: number;
  statusText: string;
  url: string;
  message: string;

  constructor(response: Response, message: string) {
    super(
      `Request to ${response.headers.get("method")} ${
        response.url
      } failed with status ${response.status}: ${
        response.statusText
      } ${message}`
    );
    this.name = "FetchError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.message = message;
  }
}

const cacheFetch = new Map<string, string>();

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

  if (options.query) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    url += `?${searchParams.toString()}`;
  }

  if (!url.startsWith("http")) {
    url = `${import.meta.env.WXT_API_URL}${url}`;
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

  if (cacheFetch.has(JSON.stringify(options))) {
    // toast.loading("Submitting, please wait…");
    return false;
  }

  if (options.method && ["POST", "PUT", "DELETE"].includes(options.method)) {
    cacheFetch.set(JSON.stringify(options), 'submitting');
  }

  const res = await fetch(url, options as RequestInit);

  const json = await res.json();

  cacheFetch.delete(JSON.stringify(options));

  if (!res.ok) {
    switch (res.status) {
      case 401:
        await chrome.storage.local.remove("token");
        useStore.getState().setSignDialogOpen(true);
        break;
      default:
        alert(json.message);
    }
    throw new FetchResponseError(res, json.message);
  }
  return json as T;
};
