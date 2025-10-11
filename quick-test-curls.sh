#!/bin/bash

# Quick Test Curls for API Debugging
# Run this to quickly test all critical endpoints

echo "================================"
echo "Testing Backend API Endpoints"
echo "================================"

echo ""
echo "1. Testing Services List (should work)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/services"

echo ""
echo "2. Testing Individual Service Pages (CRITICAL - might fail)..."
echo "   - Konsultacja chirurgiczna:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna"

echo "   - Konsultacja proktologiczna:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/services/slug/konsultacja-proktologiczna"

echo "   - Leczenie stopy cukrzycowej:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/services/slug/leczenie-stopy-cukrzycowej"

echo ""
echo "3. Testing Doctors List (should work)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/docs"

echo ""
echo "4. Testing News List (should work)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/news"

echo ""
echo "5. Testing Blogs List (might fail)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://backend.centrummedyczne7.pl/blogs"

echo ""
echo "================================"
echo "Full Response Tests"
echo "================================"

echo ""
echo "Getting full service details for: konsultacja-chirurgiczna"
curl -s "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna" | head -20

echo ""
echo "================================"
echo "Done! Check the status codes above:"
echo "  200 = Success"
echo "  404 = Not Found (this is the problem!)"
echo "  500 = Server Error"
echo "================================"

