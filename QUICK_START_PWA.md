# Quick Start - PWA Testing

## Test Right Now (5 minutes)

### 1. Visit the PWA Page
Open your browser and go to:
```
http://localhost:3000/profile-pwa
```

### 2. See It Working
You should see:
- ✅ Green "Online" indicator in top-right
- ✅ Profile form (name, email, bio)
- ✅ Blue info box showing PWA features

### 3. Test Offline Mode

**In Chrome/Edge:**
1. Press **F12** (open DevTools)
2. Click **Network** tab
3. Select **Offline** from dropdown
4. **Refresh the page** (F5)
5. Page still loads! ✅
6. Try editing and saving - works offline!
7. Go back **Online**
8. See "Syncing changes..." message

### 4. Test on Your Phone

**Quick way:**
1. Find your computer's local IP:
   ```bash
   ipconfig
   # Look for IPv4 Address (like 192.168.1.x)
   ```

2. On your phone (same WiFi), open browser:
   ```
   http://YOUR-IP:3000/profile-pwa
   # Example: http://192.168.1.100:3000/profile-pwa
   ```

3. **Android**: Look for install banner
4. **iPhone**: Share → "Add to Home Screen"

## Deploy to Azure (2 commands)

```bash
# Build the app
npm run build

# If you have Azure CLI configured:
az webapp deploy --name easemycargo77 --resource-group <your-rg>
```

Or just push to git if you have CI/CD setup:
```bash
git add .
git commit -m "Add PWA support"
git push
```

## That's It!

Your app now works offline, is installable on mobile, and syncs with MongoDB!

See **PWA_COMPLETE.md** for full details.
