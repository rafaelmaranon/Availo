# 🚀 Daytona Workspace Setup Instructions for Availo

Follow these steps to complete your Daytona workspace setup and capture the required screenshots.

## 📋 Step-by-Step Process

### 1. Create Daytona Workspace
1. Go to [Daytona Dashboard](https://daytona.io)
2. Click "New Workspace" or "Create Workspace"
3. Enter repository URL: `https://github.com/rafaelmaranon/Availo.git`
4. Select branch: `main`
5. Choose template: Node.js/React
6. Click "Create Workspace"

### 2. Configure Environment Variables
Once the workspace is created, add these environment variables:
```bash
VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
VITE_CONVEX_URL=your_actual_convex_production_url_here
```

**How to add environment variables in Daytona:**
- Look for "Environment Variables" or "Settings" section
- Add each variable name and value
- Save configuration

### 3. Install Dependencies & Start Server
In the workspace terminal, run:
```bash
pnpm install
pnpm dev
```

### 4. Open HTTPS Preview
- Look for "Preview" or "Open in Browser" button
- Copy the HTTPS URL (should be something like `https://xyz.daytona.io:5173`)
- Test the application thoroughly

### 5. Test Key Features
- **GPS Location**: Allow location access and test location detection
- **Voice Input**: Test microphone access for speech-to-text
- **AI Agent**: Run through the parking spot demo flow
- **Seed Data**: Click "Seed Demo Data" and test search functionality

### 6. Invite Teammate
- Look for "Share" or "Collaborate" option in Daytona workspace
- Invite a teammate or create an alternate account
- Grant appropriate access level (Developer/Editor)

### 7. Capture Screenshots
Take two screenshots:

#### Screenshot 1: Daytona Dashboard
- Show the workspace overview/dashboard
- Include workspace name, status, and configuration details
- Save as: `docs/screenshots/daytona-dashboard.png`

#### Screenshot 2: Running Application
- Show Availo app running in the HTTPS preview
- Demonstrate key features (AI agent reasoning, search interface)
- Save as: `docs/screenshots/availo-preview.png`

### 8. Update Documentation
After capturing screenshots:
1. Place screenshot files in `docs/screenshots/` directory
2. Update `docs/daytona-proof.md` with:
   - Actual Daytona workspace URL
   - Live preview URL
   - Any specific configuration notes
   - Performance metrics you observed

## 🎯 Success Criteria
- [ ] Daytona workspace created and running
- [ ] Environment variables configured
- [ ] Application accessible via HTTPS preview
- [ ] GPS and voice features working
- [ ] Teammate invited and can access workspace
- [ ] Screenshots captured and saved
- [ ] Documentation updated with actual URLs

## 💡 Tips
- Keep the workspace running while capturing screenshots
- Test all major features to ensure they work in the cloud environment
- Note any performance differences compared to local development
- Document any issues or solutions for future reference

## 🔗 Resources
- [Daytona Documentation](https://daytona.io/docs)
- [Your GitHub Repository](https://github.com/rafaelmaranon/Availo)
- [Mapbox Token Setup](https://docs.mapbox.com/help/getting-started/access-tokens/)
- [Convex Documentation](https://docs.convex.dev/)

---
**Next Steps**: Follow this guide to complete the Daytona setup, then update the documentation with your actual results!
