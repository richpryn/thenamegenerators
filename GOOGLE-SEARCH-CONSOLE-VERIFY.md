# Google Search Console – Domain verification

Verify **thenamegenerators.com** using a DNS TXT record.

## TXT record to add

In your DNS provider (e.g. Bluehost):

| Field    | Value |
|----------|--------|
| **Type** | TXT |
| **Host** | `@` (apex/root) or leave blank |
| **Value** | `google-site-verification=356Jtg-JUJ1tD-yRQ7ecaQq-8ObeyUVAIZEtmwJE6wI` |
| **TTL**  | 4 Hours or default |

## Steps (Bluehost)

1. Log in to Bluehost → **Domains** → select **thenamegenerators.com** → **DNS/Zone Editor** (or **Manage** → **DNS**).
2. Click **Add Record** (or **Add**).
3. Choose **TXT**.
4. **Host**: `@` or leave blank (for the root domain).
5. **TXT Value**: paste exactly:
   ```
   google-site-verification=356Jtg-JUJ1tD-yRQ7ecaQq-8ObeyUVAIZEtmwJE6wI
   ```
6. Save.
7. Wait **5–30 minutes** for DNS to propagate.
8. In [Google Search Console](https://search.google.com/search-console), open your property and click **Verify**.

## Verify TXT is live

```bash
dig thenamegenerators.com TXT +short
```

You should see a line containing `google-site-verification=356Jtg-JUJ1tD-yRQ7ecaQq-8ObeyUVAIZEtmwJE6wI`.

Or use [dnschecker.org](https://dnschecker.org): type `thenamegenerators.com`, type **TXT**, and confirm the verification value appears.

## If verification fails

- Wait up to 48 hours for propagation, then try again.
- Ensure there are no extra spaces or quotes in the TXT value.
- For “Domain” property in GSC, the TXT must be on the apex (`@`). For “URL prefix” you can use an HTML file or meta tag instead.
