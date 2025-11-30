#!/bin/bash
# Start the web server for Name Generators

cd "$(dirname "$0")"
echo "🚀 Starting web server on port 8000..."
echo ""
echo "📝 Once started, open in your browser:"
echo "   http://localhost:8000/posts/dwarf-name-generator.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8000


