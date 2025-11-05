# Meta Title Format Examples

## 📰 Articles (News & Blog)

### Format:
**Meta Title = Article Title (exact match, no suffix)**

### Examples:

#### News Article (`/aktualnosci/`)
**Article Title:** `Nowa przychodnia w Skarżysku-Kamiennej – opieka specjalistyczna`

**Meta Title:**
```
Nowa przychodnia w Skarżysku-Kamiennej – opieka specjalistyczna
```

#### Blog Article (`/poradnik/`)
**Article Title:** `Wszywka alkoholowa (Disulfiram/Esperal) Skarżysko-Kamienna`

**Meta Title:**
```
Wszywka alkoholowa (Disulfiram/Esperal) Skarżysko-Kamienna
```

**Meta Description:**
- Uses `shortDescription` from API

---

## 🏥 Services

### Format Rules:
1. **Default (when title fits):**
   - `{service title} – Skarżysko-Kamienna | Centrum Medyczne 7`

2. **Short (when title > ~55 chars total):**
   - `{service title shortened}… – Skarżysko-Kamienna | CM7`

### Examples:

#### Example 1: Short Service Title
**Service Title:** `Konsultacja online`

**Meta Title:**
```
Konsultacja online – Skarżysko-Kamienna | Centrum Medyczne 7
```
*Total: ~65 characters* ✅ Uses full brand name

---

#### Example 2: Medium Service Title
**Service Title:** `Konsultacja chirurgiczna`

**Meta Title:**
```
Konsultacja chirurgiczna – Skarżysko-Kamienna | Centrum Medyczne 7
```
*Total: ~72 characters* ✅ Uses full brand name

---

#### Example 3: Long Service Title (Will be truncated)
**Service Title:** `Specjalistyczne poradnictwo żywieniowe`

**Meta Title:**
```
Specjalistyczne poradnictwo żywien… – Skarżysko-Kamienna | CM7
```
*Total: ~60 characters* ✅ Truncated, uses CM7

---

#### Example 4: Very Long Service Title
**Service Title:** `Usunięcie chirurgiczne szwów i opatrunków specjalistycznych`

**Meta Title:**
```
Usunięcie chirurgiczne szwów i opat… – Skarżysko-Kamienna | CM7
```
*Total: ~60 characters* ✅ Truncated, uses CM7

---

## 📋 Summary Table

| Type | Format | Example |
|------|--------|---------|
| **News Article** | `{article title}` | `Nowa przychodnia w Skarżysku-Kamiennej – opieka specjalistyczna` |
| **Blog Article** | `{article title}` | `Wszywka alkoholowa (Disulfiram/Esperal) Skarżysko-Kamienna` |
| **Service (short)** | `{title} – Skarżysko-Kamienna \| Centrum Medyczne 7` | `Konsultacja online – Skarżysko-Kamienna \| Centrum Medyczne 7` |
| **Service (long)** | `{title}… – Skarżysko-Kamienna \| CM7` | `Specjalistyczne poradnictwo żywien… – Skarżysko-Kamienna \| CM7` |

---

## 🔍 How It Works

### Articles:
- ✅ **Meta title = Article title exactly** (no modifications)
- ✅ Uses `shortDescription` for meta description

### Services:
- ✅ **Checks total length** (service title + suffix)
- ✅ **If ≤ 70 chars:** Uses full format with "Centrum Medyczne 7"
- ✅ **If > 70 chars:** Truncates service title and uses "CM7"
- ✅ **Always includes:** City (Skarżysko-Kamienna) and brand name
- ✅ **Truncation:** Adds "…" (ellipsis) when shortening

---

## 📏 Length Guidelines

- **Google Recommended:** 50-60 characters (optimal)
- **Maximum:** 70 characters (still acceptable)
- **Our Target:** ~60 characters when truncating

---

## ✅ Confirmation Checklist

Please confirm with client:

- [ ] Articles: Meta title = exact article title (no suffix) ✅
- [ ] Services: Default format with full brand name ✅
- [ ] Services: Short format with CM7 when title is long ✅
- [ ] City always included in service titles ✅
- [ ] Truncation uses ellipsis (…) ✅

---

## 🧪 Test URLs

After deployment, test these:

1. **News Article:**
   - `https://centrummedyczne7.pl/aktualnosci/nowa-przychodnia-w-skarzysku-kamiennej-opieka-specjalistyczna-2`
   - Check: Title should be exact article title

2. **Blog Article:**
   - `https://centrummedyczne7.pl/poradnik/wszywka-alkoholowa-disulfiram-esperal-skarzysko-kamienna`
   - Check: Title should be exact article title

3. **Short Service:**
   - `https://centrummedyczne7.pl/uslugi/konsultacja-online`
   - Check: Should use full brand name

4. **Long Service:**
   - `https://centrummedyczne7.pl/uslugi/specjalistyczne-poradnictwo-zywieniowe`
   - Check: Should be truncated with CM7

