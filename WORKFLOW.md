# 🔄 Availo Development Workflow

## Clean Development Process

### For Local Development:
```bash
# 1. Work on main branch
git checkout main

# 2. Make your changes
# Edit files, add features, fix bugs

# 3. Test locally
npm install
npm run dev
# Visit http://localhost:5173

# 4. Commit your changes
git add .
git commit -m "Your change description"
```

### For Deployment:
```bash
# 1. Build the project
npm run build

# 2. Deploy to GitHub Pages
npm run deploy
# This automatically pushes to gh-pages branch
```

---

## Branch Responsibilities

### 🔧 **main** - Your Active Development
- Source code lives here
- Make all changes here
- Test locally here
- Commit improvements here

### 🏆 **rollback-2577153** - Your Safety Net
- **NEVER TOUCH THIS BRANCH**
- Contains working production build
- Tagged as `v1.0-hackathon-working`
- Use only for emergency recovery

### 🚀 **gh-pages** - Auto-Deployment
- Managed by `npm run deploy`
- Contains built files for production
- Users see this at https://rafaelmaranon.github.io/Availo

---

## Development Environment Setup

### First Time Setup:
```bash
# 1. Clone and setup
git clone https://github.com/rafaelmaranon/Availo.git
cd Availo
npm install

# 2. Create environment file (optional)
# Create .env.local if you want to use Convex
echo "VITE_CONVEX_URL=your-convex-url-here" > .env.local

# 3. Start development
npm run dev
```

### Daily Development:
```bash
# Always start here
git checkout main
git pull origin main

# Make changes, test, commit
npm run dev  # Test locally
git add .
git commit -m "Description of changes"
git push origin main

# Deploy when ready
npm run build
npm run deploy
```

---

## Troubleshooting

### White Screen Issues:
- Check browser console for errors
- Ensure `npm install` was run
- Verify `npm run dev` shows no errors
- Check if Convex URL is needed (see .env.local setup)

### Deployment Issues:
- Ensure `npm run build` works locally
- Check that gh-pages branch exists
- Verify GitHub Pages is enabled in repository settings

### Emergency Recovery:
- See RECOVERY-GUIDE.md
- Use `rollback-2577153` branch as last resort

---

## File Structure
```
Availo/
├── src/                 # Source code
├── public/             # Static assets
├── dist/               # Built files (auto-generated)
├── convex/             # Backend functions
├── package.json        # Dependencies and scripts
├── vite.config.ts      # Build configuration
├── RECOVERY-GUIDE.md   # Emergency procedures
└── WORKFLOW.md         # This file
```

**Remember: Keep it simple, keep rollback-2577153 safe, and test locally before deploying!**
