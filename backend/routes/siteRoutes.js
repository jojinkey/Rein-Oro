import { Router } from "express";
import { queryFirestoreCollection } from "../util/firestore.js";

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
 try {
  const products = await queryFirestoreCollection("products");
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const staticUrls = [
   { loc: "https://reinoro.com/#/", changefreq: "daily", priority: "1.0" },
   { loc: "https://reinoro.com/#/shop", changefreq: "daily", priority: "0.8" },
   {
    loc: "https://reinoro.com/#/about",
    changefreq: "monthly",
    priority: "0.5",
   },
   {
    loc: "https://reinoro.com/#/contact",
    changefreq: "monthly",
    priority: "0.5",
   },
  ];
  for (const u of staticUrls) {
   xml += "  <url>\n";
   xml += `    <loc>${u.loc}</loc>\n`;
   xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
   xml += `    <priority>${u.priority}</priority>\n`;
   xml += "  </url>\n";
  }
  for (const p of products) {
   xml += "  <url>\n";
   xml += `    <loc>https://reinoro.com/#/product/${p.id || p}</loc>\n`;
   xml += "    <changefreq>weekly</changefreq>\n";
   xml += "    <priority>0.7</priority>\n";
   xml += "  </url>\n";
  }
  xml += "</urlset>";
  res.header("Content-Type", "application/xml");
  res.send(xml);
 } catch (err) {
  res.status(500).send("Error generating sitemap");
 }
});

router.get("/robots.txt", (req, res) => {
 res.type("text/plain");
 res.send(
  "User-agent: *\nDisallow: /admin/\nDisallow: /admin\nSitemap: https://reinoro.com/sitemap.xml\n",
 );
});

export default router;
