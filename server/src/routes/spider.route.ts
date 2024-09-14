import { Router } from "express";

const router = Router();

router.post("/webpage", async (req, res, next) => {
  const { url } = req.body;
  const response = await fetch(url);
  const html = await response.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";
  const descriptionMatch = html.match(
    /<meta name="description" content="(.*?)"/
  );
  const description = descriptionMatch ? descriptionMatch[1] : "";

  res.json({
    title,
    description,
  });
});

export default router;
