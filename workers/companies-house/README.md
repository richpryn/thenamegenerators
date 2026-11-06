# Companies House proxy (Cloudflare Worker)

The Business Name Checker uses this to search Companies House live. It keeps the API key out of the website.

## Set it up (about 15 minutes, once)

1. **Get a Companies House API key.** Sign in or register at https://developer.company-information.service.gov.uk/, create an application ("The Name Generators", live), and add a **REST** key. Copy the key.
2. **Create the Worker.** In a free Cloudflare account: Workers & Pages → Create → Create Worker. Name it `ch-proxy` and deploy the starter, then Edit code, paste in all of `worker.js` from this folder and Deploy.
3. **Add the key as a secret.** In the Worker: Settings → Variables and Secrets → Add → type **Secret**, name `CH_API_KEY`, value: your key. Save and deploy. (The key never goes in the code, the repo or a chat.)
4. **Tell the site where it is.** Copy the Worker's address (like `https://ch-proxy.<you>.workers.dev`) into `companiesHouseApi` in `content/affiliates.json`, or send it to Claude to do.

Test it: open `https://ch-proxy.<you>.workers.dev/?q=greggs` in a browser. You should see a list of companies.
