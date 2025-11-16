const express = require('express');
const path = require('path');
const generateSitemap = require('./utils/sitemapGenerator');
const fs = require('fs');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Utility: convert slug to readable title
function humanizeSlug(slug) {
  if (!slug) return '';
  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Utility: render index.html with a VISIBLE pre-content SEO block
function renderWithSEO(res, titleText, descriptionText) {
  try {
    const indexPath = path.join(__dirname, 'build', 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    const escape = (str) => String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const injection = `\n<section id="seo-content" style="padding:16px 0;">\n  <h1 style="margin:0 0 8px 0; font-size:24px; line-height:1.3;">${escape(titleText)}</h1>\n  <p style="margin:0; color:#475467;">${escape(descriptionText)}</p>\n</section>\n<div id="root"></div>`;

    html = html.replace('<div id="root"></div>', injection);
    res.send(html);
  } catch (_) {
    // Fallback to plain index.html if anything goes wrong
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  }
}

// SEO: inject visible pre-content for dynamic service pages
app.get('/uslugi/:slug', (req, res) => {
  const serviceTitle = humanizeSlug(req.params.slug);
  // Title rule: {service title} – Skarżysko-Kamienna | Centrum Medyczne 7 (kept simple for visible block)
  const titleText = `${serviceTitle} – Skarżysko-Kamienna | Centrum Medyczne 7`;
  const descriptionText = `Szczegóły usługi: ${serviceTitle}. Rejestracja i szybkie terminy w Centrum Medycznym 7 w Skarżysku-Kamiennej.`;
  renderWithSEO(res, titleText, descriptionText);
});

// SEO: inject visible pre-content for dynamic doctor pages
app.get('/lekarze/:slug', (req, res) => {
  const name = humanizeSlug(req.params.slug);
  const titleText = `Lekarz ${name} – Skarżysko-Kamienna | CM7`;
  const descriptionText = `Profil lekarza ${name}. Umów wizytę w Centrum Medycznym 7 w Skarżysku-Kamiennej.`;
  renderWithSEO(res, titleText, descriptionText);
});

// Optional: news/blog pages – visible preface to reduce soft 404 risk
app.get(['/aktualnosci/:slug', '/poradnik/:slug'], (req, res) => {
  const readable = humanizeSlug(req.params.slug);
  const isNews = req.path.startsWith('/aktualnosci/');
  const titleText = isNews ? `${readable} | Aktualności – CM7` : `${readable} | Poradnik – CM7`;
  const descriptionText = isNews
    ? `Artykuł aktualności: ${readable}. Informacje z Centrum Medycznego 7.`
    : `Artykuł poradnikowy: ${readable}. Porady od specjalistów Centrum Medycznego 7.`;
  renderWithSEO(res, titleText, descriptionText);
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemap());
});

// Handle all other routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
}); 