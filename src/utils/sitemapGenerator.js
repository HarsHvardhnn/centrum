import { apiCaller } from './axiosInstance';

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

// Helper function to validate slug
const isValidSlug = (slug) => {
  return slug && 
         slug.trim() !== '' && 
         slug !== 'undefined' && 
         slug !== 'null' &&
         !slug.includes('undefined');
};

const generateSitemap = async () => {
  let dynamicUrls = [];
  
  try {
    // Fetch news articles
    const newsResponse = await apiCaller('GET', '/news');
    const newsItems = newsResponse.data || [];
    
    const validNewsUrls = newsItems
      .filter(item => isValidSlug(item.slug))
      .map(item => ({
        url: `/aktualnosci/${item.slug}`,
        lastmod: item.updatedAt || item.date,
        priority: '0.6'
      }));
    
    dynamicUrls = [...dynamicUrls, ...validNewsUrls];
    
    // Fetch blog/poradnik articles
    const blogsResponse = await apiCaller('GET', '/blogs');
    const blogItems = blogsResponse.data || [];
    
    const validBlogUrls = blogItems
      .filter(item => isValidSlug(item.slug))
      .map(item => ({
        url: `/poradnik/${item.slug}`,
        lastmod: item.updatedAt || item.date,
        priority: '0.6'
      }));
    
    dynamicUrls = [...dynamicUrls, ...validBlogUrls];
    
    // Fetch services if available
    try {
      const servicesResponse = await apiCaller('GET', '/services');
      const serviceItems = servicesResponse.data || [];
      
      const validServiceUrls = serviceItems
        .filter(item => isValidSlug(item.slug))
        .map(item => ({
          url: `/uslugi/${item.slug}`,
          lastmod: item.updatedAt || item.date,
          priority: '0.7'
        }));
      
      dynamicUrls = [...dynamicUrls, ...validServiceUrls];
    } catch (serviceError) {
      console.log('Services not available for sitemap generation');
    }
    
  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
    // Continue with static routes only if API fails
  }

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
  ${dynamicUrls.map(item => `
    <url>
      <loc>${BASE_URL}${item.url}</loc>
      <lastmod>${item.lastmod ? new Date(item.lastmod).toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${item.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

  return sitemap;
};

export default generateSitemap; 