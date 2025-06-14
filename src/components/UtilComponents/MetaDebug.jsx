import { useEffect, useState } from 'react';

const MetaDebug = () => {
  const [metaTags, setMetaTags] = useState({});

  useEffect(() => {
    // Get all meta tags
    const tags = document.getElementsByTagName('meta');
    const metaData = {};
    
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      if (name) {
        metaData[name] = tag.getAttribute('content');
      }
    }

    // Get title
    metaData.title = document.title;
    
    setMetaTags(metaData);
  }, []);

  if (import.meta.env.PROD) return null; // Don't show in production

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Current Meta Tags:</h3>
      <pre className="text-xs overflow-auto max-h-96">
        {JSON.stringify(metaTags, null, 2)}
      </pre>
    </div>
  );
};

export default MetaDebug; 