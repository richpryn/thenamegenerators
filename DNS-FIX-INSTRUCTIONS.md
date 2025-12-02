# DNS Configuration Fix for thenamegenerators.com

## Current Status ✅

Your A records for the apex domain (@) are **CORRECT**:
- ✅ 185.199.108.153
- ✅ 185.199.109.153
- ✅ 185.199.110.153
- ✅ 185.199.111.153

Your AAAA records are also **CORRECT**:
- ✅ 2606:50c0:8000::153
- ✅ 2606:50c0:8001::153
- ✅ 2606:50c0:8002::153
- ✅ 2606:50c0:8003::153

## Issue Found ❌

Your `www` CNAME record is **WRONG**:
- ❌ Currently points to: `178.128.137.126` (IP address)
- ✅ Should point to: `richpryn.github.io`

## Fix Required

### Step 1: Fix the www CNAME Record

In your Bluehost DNS settings:

1. Find the CNAME record for `www`
2. **Delete** the current record that points to `178.128.137.126`
3. **Add a new CNAME record**:
   - **Type**: CNAME
   - **Host Record**: `www`
   - **Point To**: `richpryn.github.io` (NOT an IP address!)
   - **TTL**: 4 Hours (or default)

### Step 2: Verify GitHub Pages Custom Domain

1. Go to: https://github.com/richpryn/thenamegenerators/settings/pages
2. Under "Custom domain", make sure it says: `thenamegenerators.com`
3. If it's empty, add `thenamegenerators.com` and click Save
4. Wait 1-2 minutes for GitHub to verify

### Step 3: Test DNS Configuration

After making changes, test with:

```bash
# Test A records (apex domain)
dig thenamegenerators.com +noall +answer -t A

# Should show all 4 GitHub IPs:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

# Test www CNAME
dig www.thenamegenerators.com +noall +answer -t CNAME

# Should show:
# www.thenamegenerators.com. IN CNAME richpryn.github.io.
```

## Complete DNS Configuration

Here's what your DNS should look like:

### A Records (Apex Domain - @)
- ✅ A | @ | 185.199.108.153 | 4 Hours
- ✅ A | @ | 185.199.109.153 | 4 Hours
- ✅ A | @ | 185.199.110.153 | 4 Hours
- ✅ A | @ | 185.199.111.153 | 4 Hours

### AAAA Records (IPv6 - @)
- ✅ AAAA | @ | 2606:50c0:8000::153 | 4 Hours
- ✅ AAAA | @ | 2606:50c0:8001::153 | 4 Hours
- ✅ AAAA | @ | 2606:50c0:8002::153 | 4 Hours
- ✅ AAAA | @ | 2606:50c0:8003::153 | 4 Hours

### CNAME Record (www subdomain)
- ❌ **FIX THIS**: CNAME | www | 178.128.137.126 → **DELETE**
- ✅ **ADD THIS**: CNAME | www | richpryn.github.io | 4 Hours

## What to Keep

**Keep these records** (they're for email/hosting):
- autoconfig, autodiscover, mail, webdisk, whm (A records pointing to 69.195.124.136)
- cpanel, ftp, imap, pop, smtp, webmail (CNAME records)
- MX record for email
- TXT _dmarc record
- SRV _autodiscover record

**These are fine to keep** - they don't interfere with GitHub Pages.

## After Making Changes

1. **Wait 15-60 minutes** for DNS to propagate
2. **Check DNS propagation**: https://dnschecker.org
   - Enter: `thenamegenerators.com`
   - Select: A record
   - Should show all 4 GitHub IPs globally
3. **Test your site**: https://thenamegenerators.com
4. **Wait 24-48 hours** for GitHub to provision SSL certificate
5. **Enable HTTPS**: In GitHub Pages settings, check "Enforce HTTPS"

## Verification Commands

Run these to verify DNS is correct:

```bash
# Check A records
dig thenamegenerators.com +short

# Check www CNAME
dig www.thenamegenerators.com +short

# Should show: richpryn.github.io
```

## Summary

**What's Wrong:**
- www CNAME points to IP address instead of richpryn.github.io

**What to Do:**
1. Delete the www CNAME pointing to 178.128.137.126
2. Add new www CNAME pointing to richpryn.github.io
3. Verify custom domain in GitHub Pages settings
4. Wait for DNS propagation (15-60 minutes)
5. Wait for SSL certificate (24-48 hours)



