# PageSpeed Insights Optimization Plan

Based on your PageSpeed Insights report, here's what needs to be fixed.

## Current Scores
- ✅ **Performance**: 91 (Good, but can improve)
- ⚠️ **Accessibility**: 90 (Needs improvement)
- ✅ **Best Practices**: 96 (Very good)
- ✅ **SEO**: 100 (Perfect!)

---

## 🔧 Performance Optimizations (91 → 95+)

### 1. Reduce Unused JavaScript (54 KiB savings)

**Issue**: JavaScript files contain unused code.

**Solutions**:
- [ ] **Minify JavaScript files**
  - Minify `lib/generator.js`
  - Minify inline scripts in generated pages
  - Use a build tool or online minifier
  
- [ ] **Code splitting** (if applicable)
  - Only load generator.js when needed
  - Lazy load for category pages

**Action Items**:
```bash
# Option 1: Use online minifier
# Visit: https://www.minifier.org/
# Minify lib/generator.js

# Option 2: Add minification to build script
# I can add this to build-pages.js
```

### 2. Minify JavaScript (3 KiB savings)

**Fix**: Add JavaScript minification to build process.

**Action**: I'll add minification to the build script.

### 3. Use Efficient Cache Lifetimes (8 KiB savings)

**Issue**: Resources don't have optimal cache headers.

**Fix**: Already in `.htaccess`, but GitHub Pages doesn't support it.

**Alternative**: 
- [ ] Consider using Cloudflare (free) for better caching
- [ ] Or accept this limitation (8 KiB is small)

### 4. Avoid Long Main-Thread Tasks (1 long task found)

**Issue**: JavaScript blocking the main thread.

**Solutions**:
- [ ] **Defer non-critical JavaScript**
- [ ] **Use Web Workers** for heavy computations (if needed)
- [ ] **Optimize generator logic** to be more efficient

**Action**: Review and optimize generator.js performance.

---

## ♿ Accessibility Fixes (90 → 95+)

### 1. Contrast Issues

**Issue**: Background and foreground colors don't have sufficient contrast ratio.

**Fix**: 
- [ ] Review CSS color combinations
- [ ] Ensure text has at least 4.5:1 contrast ratio (WCAG AA)
- [ ] Use contrast checker: https://webaim.org/resources/contrastchecker/

**Action**: I'll check and fix contrast issues in CSS files.

### 2. Missing Main Landmark

**Issue**: Document does not have a `<main>` landmark.

**Fix**: 
- [ ] Add `<main>` tag to wrap main content
- [ ] Already have semantic HTML, just need to add `<main>` wrapper

**Action**: I'll add `<main>` tags to all pages.

---

## 🛡️ Best Practices Improvements (96 → 100)

### 1. Browser Console Errors

**Issue**: Errors logged to console.

**Fix**:
- [ ] Review and fix any JavaScript errors
- [ ] Remove console.error() calls in production
- [ ] Add proper error handling

**Action**: I'll review and fix console errors.

### 2. CSP Effectiveness

**Issue**: CSP includes `'unsafe-inline'` and `'unsafe-eval'`.

**Current Status**: Necessary for current architecture, but flagged.

**Options**:
- [ ] **Option A**: Keep as-is (works, but less secure)
- [ ] **Option B**: Refactor to external JS files (more secure, more work)

**Recommendation**: Keep as-is for now, refactor later if needed.

### 3. HSTS Policy

**Issue**: Need strong HSTS policy.

**Fix**: Requires server-side headers (GitHub Pages doesn't support).

**Alternative**: 
- [ ] Use Cloudflare (free) - supports HSTS
- [ ] Or accept limitation (HTTPS is still enforced by GitHub)

### 4. Origin Isolation (COOP)

**Issue**: Need Cross-Origin-Opener-Policy.

**Fix**: Add COOP header (requires server-side).

**Action**: Add to meta tags as fallback (limited effectiveness).

### 5. Trusted Types (DOM-based XSS)

**Issue**: Mitigate DOM-based XSS with Trusted Types.

**Fix**: Implement Trusted Types policy.

**Action**: I'll add Trusted Types to enhance security.

---

## 📋 Priority Fix List

### High Priority (Do First)
1. [ ] **Add `<main>` landmark** (Accessibility)
2. [ ] **Fix contrast issues** (Accessibility)
3. [ ] **Fix console errors** (Best Practices)
4. [ ] **Minify JavaScript** (Performance)

### Medium Priority
5. [ ] **Optimize generator.js** (Performance)
6. [ ] **Add COOP meta tag** (Best Practices)
7. [ ] **Add Trusted Types** (Best Practices)

### Low Priority (Optional)
8. [ ] **Set up Cloudflare** (Better caching, HSTS)
9. [ ] **Refactor CSP** (Remove unsafe-inline)

---

## 🎯 Target Scores

After optimizations:
- **Performance**: 91 → **95+**
- **Accessibility**: 90 → **95+**
- **Best Practices**: 96 → **100**
- **SEO**: 100 → **100** (maintain)

---

## 📝 Notes

- Some fixes require server-side headers (GitHub Pages limitation)
- Consider Cloudflare for better control
- Performance score of 91 is already good
- Focus on Accessibility first (easiest wins)






