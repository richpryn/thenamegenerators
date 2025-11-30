# Quick Start - Where to Run Commands

## Your Project Location

Your project is located at:
```
/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators V2
```

## How to Navigate There

### On Mac (Terminal):

1. **Open Terminal** (Applications → Utilities → Terminal, or press `Cmd + Space` and type "Terminal")

2. **Navigate to your project**:
   ```bash
   cd "/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators V2"
   ```

3. **Verify you're in the right place**:
   ```bash
   pwd
   ```
   Should show: `/Volumes/Video HD 8TB/01 Projects/cursor-files/Name Generators V2`

4. **Check what files are there**:
   ```bash
   ls
   ```
   Should show: `index.html`, `data/`, `posts/`, `scripts/`, etc.

### On Windows (Command Prompt or PowerShell):

1. **Open Command Prompt** (Press `Win + R`, type `cmd`, press Enter)

2. **Navigate to your project**:
   ```cmd
   cd "Z:\01 Projects\cursor-files\Name Generators V2"
   ```
   (Note: The drive letter might be different - check "This PC" to see what drive letter your external drive uses)

3. **Or use PowerShell**:
   ```powershell
   cd "Z:\01 Projects\cursor-files\Name Generators V2"
   ```

## Now Run the Git Commands

Once you're in the project directory, run:

```bash
# Check if git is installed
git --version

# Initialize git (if not already done)
git init

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Name Generators site"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/name-generators.git

# Push to GitHub
git push -u origin main
```

## Alternative: Use VS Code Terminal

If you're using VS Code or Cursor:

1. **Open the project** in VS Code/Cursor
2. **Open Terminal**:
   - VS Code: `View → Terminal` or press `` Ctrl + ` ``
   - Cursor: Same as VS Code
3. **The terminal will automatically be in the project directory**
4. **Run the git commands directly**

## Quick Verification

After navigating, verify you're in the right place:

```bash
# Should show your project files
ls

# Should show index.html exists
ls index.html

# Should show the data directory
ls data/
```

## Troubleshooting

**"No such file or directory" error?**
- Make sure the path is exactly right (copy-paste it)
- Check if the drive is mounted (Mac) or accessible (Windows)
- Try navigating step by step:
  ```bash
  cd "/Volumes/Video HD 8TB"
  cd "01 Projects"
  cd "cursor-files"
  cd "Name Generators V2"
  ```

**"Command not found: git" error?**
- Install Git: https://git-scm.com/downloads
- Or on Mac, install Xcode Command Line Tools: `xcode-select --install`

**Permission denied?**
- Make sure you have read/write access to the directory
- On Mac, you might need to grant Full Disk Access to Terminal

