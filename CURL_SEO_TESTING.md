# 🔥 cURL Commands for SEO Testing

## 🚀 Quick Test Commands

### Test Bot vs User on Same Route

**Test Googlebot (should get SEO HTML):**
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
```

**Test Regular User (should get React SPA):**
```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze
```

## 🧪 Test All Routes with Googlebot

### Homepage:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/
```

### About Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/o-nas
```

### Doctors Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
```

### Services Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/uslugi
```

### News Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/aktualnosci
```

### Blog Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/poradnik
```

### Contact Page:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/kontakt
```

## 🤖 Different Bot User Agents

### Facebook Bot:
```bash
curl -H "User-Agent: facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" http://localhost:5174/lekarze
```

### Twitter Bot:
```bash
curl -H "User-Agent: Twitterbot/1.0" http://localhost:5174/lekarze
```

### LinkedIn Bot:
```bash
curl -H "User-Agent: LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com/help/homepage)" http://localhost:5174/lekarze
```

### Bing Bot:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" http://localhost:5174/lekarze
```

## 📊 Advanced Testing Commands

### Get Only Headers:
```bash
curl -I -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
```

### Save Response to File:
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze -o bot-response.html
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze -o user-response.html
```

### Test Response Time:
```bash
curl -w "@curl-format.txt" -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### Silent Mode (No Progress):
```bash
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
```

## 🔍 Quick Validation Commands

### Check for Title Tag:
```bash
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze | grep -o '<title>.*</title>'
```

### Check for Meta Description:
```bash
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze | grep -o '<meta name="description"[^>]*>'
```

### Check for Open Graph Tags:
```bash
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze | grep -o '<meta property="og:[^"]*"[^>]*>'
```

### Count HTML Lines (Bot vs User):
```bash
# Bot response (should be shorter)
curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze | wc -l

# User response (should be longer with React bundle)
curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze | wc -l
```

## 🎯 One-Liner Test Script

**Windows PowerShell:**
```powershell
# Test bot vs user quickly
$bot = curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
$user = curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze
if ($bot -ne $user) { Write-Host "✅ SEO Working - Different responses!" } else { Write-Host "❌ SEO Not Working - Same responses" }
```

**Linux/Mac Bash:**
```bash
# Test bot vs user quickly
BOT=$(curl -s -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze)
USER=$(curl -s -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze)
if [ "$BOT" != "$USER" ]; then echo "✅ SEO Working - Different responses!"; else echo "❌ SEO Not Working - Same responses"; fi
```

## 🚀 Production Testing

**Replace localhost with your domain:**
```bash
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://centrummedyczne7.pl/lekarze
```

## 🔧 Expected Results

### ✅ Bot Response Should Contain:
- `<title>Nasi lekarze – Centrum Medyczne 7`
- `<meta name="description"`
- `<meta property="og:title"`
- `<h1>` tags with content
- Static HTML content

### ✅ User Response Should Contain:
- `<div id="root"></div>`
- `<script type="module" src="/src/main.jsx"></script>`
- Minimal HTML structure
- React app loading scripts

**If both responses are identical, your SEO middleware isn't working yet!**

## 🎉 Quick Start:

1. **Start dev server:** `npm run dev`
2. **Run bot test:** 
   ```bash
   curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:5174/lekarze
   ```
3. **Run user test:**
   ```bash
   curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" http://localhost:5174/lekarze
   ```
4. **Compare the outputs!** 