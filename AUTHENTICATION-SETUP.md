# GitHub Authentication Setup

The push failed because GitHub needs to verify your identity. Here are the easiest options:

## Option 1: Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: Give it a name like "Name Generators Project"
4. Expiration: Choose how long (90 days, 1 year, or no expiration)
5. Scopes: Check **"repo"** (this gives full repository access)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you won't see it again!

### Step 2: Use Token to Push

**Method A: Enter token when prompted**
```bash
git push -u origin main
```
- Username: `richpryn`
- Password: **Paste your token** (not your GitHub password!)

**Method B: Store token in URL (temporary)**
```bash
git remote set-url origin https://richpryn:YOUR_TOKEN@github.com/richpryn/name-generators.git
git push -u origin main
```
(Replace `YOUR_TOKEN` with your actual token)

**Method C: Use credential helper (saves for future)**
```bash
git config --global credential.helper osxkeychain
git push -u origin main
```
Then enter username and token when prompted (Mac will save it)

## Option 2: GitHub CLI (Easiest)

### Install GitHub CLI:
```bash
brew install gh
```

### Login:
```bash
gh auth login
```
Follow the prompts - it will open a browser for authentication.

### Then push:
```bash
git push -u origin main
```

## Option 3: SSH Keys (More Secure, One-Time Setup)

### Generate SSH Key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
(Press Enter to accept defaults)

### Add to GitHub:
1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
2. Go to: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Paste the key and save

### Change remote to SSH:
```bash
git remote set-url origin git@github.com:richpryn/name-generators.git
git push -u origin main
```

## Quick Recommendation

**Easiest for now:** Use Personal Access Token (Option 1, Method A)
1. Create token at https://github.com/settings/tokens
2. Run: `git push -u origin main`
3. Username: `richpryn`
4. Password: Paste your token

**Best long-term:** Set up SSH keys (Option 3) - then you never need to enter credentials again


