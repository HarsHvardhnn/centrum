import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SEOTester = () => {
  const location = useLocation();
  const [metaTags, setMetaTags] = useState({});

  useEffect(() => {
    // Get all meta tags from document head
    const tags = {};
    
    // Basic meta tags
    tags.title = document.title;
    tags.description = document.querySelector('meta[name="description"]')?.content || 'Not set';
    tags.keywords = document.querySelector('meta[name="keywords"]')?.content || 'Not set';
    
    // Open Graph tags
    tags.ogTitle = document.querySelector('meta[property="og:title"]')?.content || 'Not set';
    tags.ogDescription = document.querySelector('meta[property="og:description"]')?.content || 'Not set';
    tags.ogImage = document.querySelector('meta[property="og:image"]')?.content || 'Not set';
    tags.ogUrl = document.querySelector('meta[property="og:url"]')?.content || 'Not set';
    
    // Twitter tags
    tags.twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content || 'Not set';
    tags.twitterDescription = document.querySelector('meta[name="twitter:description"]')?.content || 'Not set';
    tags.twitterImage = document.querySelector('meta[name="twitter:image"]')?.content || 'Not set';
    
    // Canonical URL
    tags.canonical = document.querySelector('link[rel="canonical"]')?.href || 'Not set';
    
    setMetaTags(tags);
  }, [location.pathname]);

  if (import.meta.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      maxWidth: '400px',
      backgroundColor: '#f0f0f0',
      border: '2px solid #008c8c',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <h4 style={{ margin: '0 0 10px', color: '#008c8c' }}>SEO Debug Panel</h4>
      <p><strong>Page:</strong> {location.pathname}</p>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Title:</strong> {metaTags.title}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Description:</strong> {metaTags.description?.substring(0, 100)}...
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>OG Image:</strong> 
        {metaTags.ogImage && metaTags.ogImage !== 'Not set' && (
          <img src={metaTags.ogImage} alt="OG" style={{ width: '50px', height: 'auto', marginLeft: '5px' }} />
        )}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Canonical:</strong> {metaTags.canonical}
      </div>
      
      <details>
        <summary>All Meta Tags</summary>
        <pre style={{ fontSize: '10px', overflow: 'auto' }}>
          {JSON.stringify(metaTags, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default SEOTester; 