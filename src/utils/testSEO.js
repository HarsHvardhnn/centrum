export const testSEO = () => {
  // Only run in development mode
  if (import.meta.env.VITE_NODE_ENV !== 'development') {
    return;
  }

  // Get page title
  const title = document.title;
  
  // Get canonical URL
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  
  // Get all meta tags
  const metaTags = document.getElementsByTagName('meta');
  
  console.group('SEO Test Results');
  console.log('Page Title:', title);
  console.log('Canonical URL:', canonical);
  console.log('Meta Tags:');
  
  // Log all meta tags
  for (let i = 0; i < metaTags.length; i++) {
    const tag = metaTags[i];
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (name && content) {
      console.log(`${name}:`, content);
    }
  }
  
  console.groupEnd();
}; 