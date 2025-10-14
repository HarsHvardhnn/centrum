# Test Individual Slug Endpoints

Based on your API responses, here are curl commands to test the **individual** service/news/doctor pages that Google is trying to index:

## Test Individual Service Pages (from your response)

```bash
# Test: Konsultacja chirurgiczna
curl -X GET "https://backend.centrummedyczne7.pl/services/slug/konsultacja-chirurgiczna"

# Test: Konsultacja proktologiczna
curl -X GET "https://backend.centrummedyczne7.pl/services/slug/konsultacja-proktologiczna"

# Test: Konsultacja online
curl -X GET "https://backend.centrummedyczne7.pl/services/slug/konsultacja-online"

# Test: Konsultacja neurologiczna
curl -X GET "https://backend.centrummedyczne7.pl/services/slug/konsultacja-neurologiczna"

# Test: Leczenie stopy cukrzycowej
curl -X GET "https://backend.centrummedyczne7.pl/services/slug/leczenie-stopy-cukrzycowej"
```

## Test Individual Doctor Pages

```bash
# Test doctor endpoint variations
curl -X GET "https://backend.centrummedyczne7.pl/docs"
curl -X GET "https://backend.centrummedyczne7.pl/doctors"

# Once you know the doctor slugs, test individual profiles:
# Replace {doctor-slug} with actual slug
curl -X GET "https://backend.centrummedyczne7.pl/docs/profile/slug/{doctor-slug}"
curl -X GET "https://backend.centrummedyczne7.pl/docs/slug/{doctor-slug}"
```

## Test News Individual Pages

```bash
# First, check what news items you have
curl -X GET "https://backend.centrummedyczne7.pl/news"

# Then test an individual news page (replace with actual slug from response)
curl -X GET "https://backend.centrummedyczne7.pl/news/slug/{news-slug}"
```

## Test Blogs/Poradnik (if you have any)

```bash
# This is the one that's failing - check if you actually have blogs
curl -X GET "https://backend.centrummedyczne7.pl/blogs"

# If blogs exist, test individual page
curl -X GET "https://backend.centrummedyczne7.pl/blogs/slug/{blog-slug}"
```

## Key Questions to Answer

After running these tests, please tell me:

1. **Do the `/services/slug/{slug}` endpoints work?** (Test 3-5 of them)
2. **Do the `/news/slug/{slug}` endpoints work?** (If you have news items)
3. **What structure does `/docs` return?** (Is it an array? Does it have slugs?)
4. **Do you actually have any blog articles?** (Is `/blogs` supposed to exist?)

## Expected Issues

Based on the code, I suspect:

- ✅ `/services` works (returns list)
- ❌ `/services/slug/{slug}` **might be failing**
- ✅ `/news` works (returns list)  
- ❌ `/news/slug/{slug}` **might be failing**
- ✅ `/docs` works (returns list)
- ❌ `/docs/profile/slug/{slug}` **might be failing**
- ❌ `/blogs` doesn't exist **at all**

This would explain why Google can't index individual pages!


