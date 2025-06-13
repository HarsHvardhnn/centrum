export const testSEO = () => {
  // Test meta tags
  const metaTags = document.getElementsByTagName('meta');
  const title = document.title;
  const canonical = document.querySelector('link[rel="canonical"]');
  
  // console.group('SEO Test Results');
  // console.log('Page Title:', title);
  // console.log('Canonical URL:', canonical?.href);
  
  // Log all meta tags
  // Array.from(metaTags).forEach(tag => {
  //   if (tag.name || tag.property) {
  //     console.log(
  //       `${tag.name || tag.property}:`,
  //       tag.content
  //     );
  //   }
  // });
  // console.groupEnd();
}; 