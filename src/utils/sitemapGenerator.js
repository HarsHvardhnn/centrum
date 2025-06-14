const BASE_URL = import.meta.env.VITE_NODE_ENV === 'development' 
  ? 'http://localhost:5173' 
  : 'https://centrummedyczne7.pl';

const publicRoutes = [
  '/',
  '/o-nas',
  '/lekarze',
  '/uslugi',
  '/aktualnosci',
  '/poradnik',
  '/kontakt',
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${publicRoutes.map(route => `
    <url>
      <loc>${BASE_URL}${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>
  `).join('')}
</urlset>`;

  return sitemap;
};

export default generateSitemap; 