import { Router } from "express";

const router = Router();

router.post("/webpage", async (req, res, next) => {
  const { url } = req.body;
  const response = await fetch(url);
  const html = await response.text();
  const title = findTitle(html);
  const description = findDescription(html);
  const faviconUrl = await findFaviconUrl(url, html);

  res.json({
    title,
    description,
    icon: faviconUrl,
  });
});

function findTitle(html: string): string {
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  return titleMatch ? titleMatch[1] : "";
}

function findDescription(html: string): string {
  const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/);
  return descriptionMatch ? descriptionMatch[1] : "";
}

async function findFaviconUrl(baseUrl: string, html: string): Promise<string> {
  const linkIconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  if (linkIconMatch) {
    return new URL(linkIconMatch[1], baseUrl).href;
  }

  // 查找根目录下的 favicon.ico
  const faviconUrl = new URL('/favicon.ico', baseUrl).href;
  try {
    const response = await fetch(faviconUrl, { method: 'HEAD' });
    if (response.ok) {
      return faviconUrl;
    }
  } catch (error) {
    console.error('Error checking favicon.ico:', error);
  }
  return '';
}

export default router;
