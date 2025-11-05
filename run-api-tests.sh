#!/bin/bash

# Script to run API response tests
echo "🧪 Running API Response Structure Tests..."
echo ""

# Run the test script
node test-api-responses.js

# Check if results file was created
if [ -f "api-test-results.json" ]; then
    echo ""
    echo "✅ Test results saved to api-test-results.json"
    echo ""
    echo "📋 Quick summary:"
    echo "   - Check api-test-results.json for full results"
    echo "   - Look for 'recommendations' in each test"
    echo "   - Compare response structures across endpoints"
else
    echo "❌ Test results file not created"
fi

