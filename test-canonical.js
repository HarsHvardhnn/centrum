// Test script to verify canonical URL generation
import express from 'express';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy the utility functions from server.js
const normalizeUrl = (url) => {
  if (!url) return '';
  
  // Remove trailing slash except for root
  let normalized = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
  
  // Ensure lowercase for consistency
  normalized = normalized.toLowerCase();
  
  // Remove any query parameters for canonical URLs
  normalized = normalized.split('?')[0];
  
  // Remove any fragments
  normalized = normalized.split('#')[0];
  
  return normalized;
};

// Test various URL scenarios
const testUrls = [
  '/uslugi/konsultacja-chirurgiczna',
  '/uslugi/konsultacja-chirurgiczna/',
  '/uslugi/Konsultacja-Chirurgiczna',
  '/uslugi/konsultacja-chirurgiczna?param=value',
  '/uslugi/konsultacja-chirurgiczna#section',
  '/uslugi/konsultacja-online',
  '/uslugi/konsultacja-online/',
  '/uslugi/Konsultacja-Online',
  '/',
  '/o-nas',
  '/o-nas/',
  '/O-NAS'
];

const BASE_URL = 'https://centrummedyczne7.pl';

console.log('🧪 Testing Canonical URL Generation\n');
console.log('=' .repeat(80));

testUrls.forEach(testUrl => {
  const normalized = normalizeUrl(testUrl);
  const canonical = `${BASE_URL}${normalized}`;
  const finalCanonical = canonical.replace(/\/$/, '') || BASE_URL;
  
  console.log(`Original: ${testUrl}`);
  console.log(`Normalized: ${normalized}`);
  console.log(`Canonical: ${finalCanonical}`);
  console.log(`Self-referencing: ${testUrl === normalized ? '✅' : '🔄'}`);
  console.log('-'.repeat(40));
});

console.log('\n✅ All canonical URLs should be self-referencing and properly normalized!');
