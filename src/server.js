const express = require('express');
const path = require('path');
const generateSitemap = require('./utils/sitemapGenerator');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(generateSitemap());
});

// Block search engine robots for login pages
app.get('/logowanie', (req, res) => {
  // Set headers to block search engine indexing
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/login', (req, res) => {
  // Set headers to block search engine indexing
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Handle all routes for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = import.meta.env.PORT || 3000;
app.listen(PORT, () => {
  //(`Server is running on port ${PORT}`);
}); 