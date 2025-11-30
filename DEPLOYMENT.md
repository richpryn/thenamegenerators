# Deployment Guide for thenamegenerators.com

This guide covers deploying the site to GitHub Pages with a custom domain.

## Prerequisites

1. GitHub account
2. Domain: `thenamegenerators.com` (already owned)
3. Git installed locally

## GitHub Pages Setup

### 1. Create GitHub Repository

1. Create a new repository on GitHub (e.g., `name-generators`)
2. Make it public (required for free GitHub Pages)
3. Initialize git in your project directory:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/name-generators.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

### 3. Configure Custom Domain

1. In repository Settings → Pages, add custom domain: `thenamegenerators.com`
2. This creates a `CNAME` file automatically

### 4. DNS Configuration

Configure your DNS records at your domain registrar:

**Option A: Apex Domain (thenamegenerators.com)**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

**Option B: CNAME (www.thenamegenerators.com)**
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

**Option C: Both (Recommended)**
- Set up A records for apex domain
- Set up CNAME for www subdomain
- GitHub Pages will handle both

### 5. SSL Certificate

GitHub Pages automatically provisions SSL certificates for custom domains. Wait 24-48 hours after DNS propagation.

## Redirects

### For GitHub Pages

GitHub Pages uses `404.html` for redirects. The file is already configured with:
- JavaScript-based redirects for old URLs
- Automatic fallback to homepage

### For Netlify (Alternative)

If using Netlify instead of GitHub Pages:
1. The `_redirects` file is already configured
2. Deploy to Netlify
3. Configure custom domain in Netlify dashboard

### For Apache/Other Hosting

The `.htaccess` file contains:
- 301 redirects for old URLs
- Security headers
- Compression and caching rules

## Security Features

### Implemented

1. **Security Headers** (in HTML meta tags):
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Permissions-Policy
   - Referrer-Policy: strict-origin-when-cross-origin
   - Content-Security-Policy (basic)

2. **Server-Side Headers** (via .htaccess for Apache):
   - All above headers
   - Strict-Transport-Security (HSTS)
   - Compression
   - Browser caching

### Note on CSP

The Content Security Policy includes `'unsafe-inline'` and `'unsafe-eval'` because:
- The site uses inline JavaScript for generators
- This is necessary for the current architecture
- For enhanced security, consider refactoring to external JS files

## SEO Features

### Implemented

1. **Schema Markup**:
   - Article schema (for generator pages)
   - BreadcrumbList schema
   - WebApplication schema
   - FAQPage schema (for pages with FAQs)

2. **Meta Tags**:
   - Title, description, keywords
   - Open Graph tags (Facebook)
   - Twitter Card tags
   - Canonical URLs

3. **Sitemap**:
   - Auto-generated `sitemap.xml`
   - Includes all pages with priorities
   - Referenced in `robots.txt`

4. **robots.txt**:
   - Allows all public pages
   - Disallows private directories
   - References sitemap

## Old URL Redirects

The following old URLs redirect to new URLs:

| Old URL | New URL |
|---------|---------|
| `/orc-name-generator-skyrim/` | `/posts/skyrim-orc-name-generator.html` |
| `/orc-name-generator-warhammer/` | `/posts/warhammer-orc-name-generator.html` |
| `/orc-name-generator-world-of-warcraft/` | `/posts/wow-orc-name-generator.html` |
| `/orc-name-generator-lord-of-the-rings/` | `/posts/lotr-orc-name-generator.html` |
| `/half-orc-name-generator/` | `/posts/half-orc-name-generator.html` |
| `/dungeon-synth-name-generator/` | `/posts/dungeon-synth-name-generator.html` |
| `/swamp-witch-name-generator/` | `/posts/swamp-witch-name-generator.html` |
| `/dnd-fantasy-name-generator/` | `/posts/dnd-fantasy-name-generator.html` |
| `/witch-name-generator-path-of-exhile/` | `/posts/path-of-exile-witch-name-generator.html` |
| `/witch-name-generator-harry-potter/` | `/posts/harry-potter-witch-name-generator.html` |
| `/witch-name-generator-hogwarts-legacy/` | `/posts/hogwarts-legacy-witch-name-generator.html` |
| `/wizard-name-generator-hogwarts-legacy/` | `/posts/hogwarts-legacy-wizard-name-generator.html` |
| `/funny-wizard-name-generator/` | `/posts/funny-wizard-name-generator.html` |
| `/wizard-name-generator-lord-of-the-rings/` | `/posts/lotr-wizard-name-generator.html` |

## Building the Site

After making changes to JSON data files:

```bash
node scripts/build-pages.js
```

This will:
- Generate all HTML pages
- Create sitemap.xml
- Update all pages with latest data

## Testing

### Before Going Live

1. Test all redirects work
2. Verify SSL certificate is active
3. Check security headers: https://securityheaders.com
4. Validate schema markup: https://validator.schema.org
5. Test SEO: Google Search Console
6. Verify sitemap: https://thenamegenerators.com/sitemap.xml

### Security Testing

1. **Security Headers**: https://securityheaders.com
2. **SSL Test**: https://www.ssllabs.com/ssltest/
3. **CSP Evaluator**: https://csp-evaluator.withgoogle.com/

## Maintenance

### Updating Content

1. Edit JSON files in `data/` directory
2. Run `node scripts/build-pages.js`
3. Commit and push changes
4. GitHub Pages will auto-deploy

### Adding New Generators

1. Add generator to appropriate JSON file in `data/`
2. Run build script
3. Commit and push

## Troubleshooting

### Redirects Not Working

- **GitHub Pages**: Ensure `404.html` is in root directory
- **Netlify**: Check `_redirects` file format
- **Apache**: Verify `.htaccess` is enabled

### SSL Certificate Issues

- Wait 24-48 hours after DNS changes
- Ensure DNS is properly configured
- Check GitHub Pages settings for custom domain

### Security Headers Not Showing

- Meta tags work in HTML
- For server headers, need server configuration
- GitHub Pages doesn't support custom headers (use meta tags)
- Consider Netlify or Cloudflare for full header control

