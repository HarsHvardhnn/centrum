import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title, 
  description, 
  path, 
  robots = "index, follow",
  ogType = "website",
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription
}) => {
  const baseUrl = 'https://centrummedyczne7.pl';
  const fullUrl = `${baseUrl}${path}`;
  const canonicalUrl = `${baseUrl}${path}`;

  // Use provided values or fallback to defaults
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={`${baseUrl}/images/fav_new.png`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={finalTwitterTitle} />
      <meta property="twitter:description" content={finalTwitterDescription} />
      <meta property="twitter:image" content={`${baseUrl}/images/fav_new.png`} />
    </Helmet>
  );
};

export default MetaTags; 