# 🚀 How to Run the Name Generators Website

## ⚠️ IMPORTANT: You MUST use a web server!

**DO NOT** open the HTML files directly (file:///). Browsers block fetch requests for security.

## ✅ Quick Start

### Option 1: Use the Start Script (Easiest)
```bash
./START-SERVER.sh
```

### Option 2: Manual Start
```bash
cd "/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators V2"
python3 -m http.server 8000
```

## 📝 Then Open in Browser

Once the server is running, open:

**Homepage:**
http://localhost:8000/index.html

**Dwarf Generator:**
http://localhost:8000/posts/dwarf-name-generator.html

**Elf Generator:**
http://localhost:8000/posts/elf-name-generator.html

## 🔍 Verify Server is Running

Check if server is running:
```bash
curl http://localhost:8000/data/fantasy.json
```

If you see JSON data, the server is working!

## ❌ Common Error

If you see "Failed to fetch" errors:
- You're opening the file directly (file:///)
- Close that tab
- Use http://localhost:8000/ instead


