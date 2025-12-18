# Android Emulator Setup Guide (Windows)

## Step 1: Download Android Studio

1. **Visit**: https://developer.android.com/studio
2. **Download**: Android Studio (latest version)
3. **File size**: ~1 GB download

## Step 2: Install Android Studio

1. **Run installer**: `android-studio-xxx-windows.exe`
2. **Installation wizard**:
   - ✅ Click "Next" on welcome screen
   - ✅ Choose "Standard" installation type
   - ✅ Accept all license agreements
   - ✅ Click "Finish"
3. **First launch**: Android Studio will download additional components (~3-4 GB)
   - This may take 10-20 minutes depending on internet speed
   - ☕ Good time for coffee!

## Step 3: Configure Android SDK

Android Studio should auto-configure the SDK, but verify:

1. **Open Android Studio**
2. **Click**: "More Actions" → "SDK Manager"
3. **Verify installed**:
   - ✅ Android SDK Platform (at least API 33 or 34)
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools

If missing, check the boxes and click "Apply" to install.

## Step 4: Create Virtual Device (Emulator)

1. **In Android Studio**:
   - Click "More Actions" → "Virtual Device Manager"
   
2. **Create Device**:
   - Click "Create Device"
   - **Choose**: Pixel 6 or Pixel 7 (recommended)
   - Click "Next"

3. **System Image**:
   - **Select**: Tiramisu (API 33) or UpsideDownCake (API 34)
   - Click "Download" if needed (will download ~1-2 GB)
   - Click "Next"

4. **AVD Configuration**:
   - **Name**: Leave as default or rename to "Pixel_6_API_33"
   - **Startup orientation**: Portrait
   - Click "Finish"

## Step 5: Set Environment Variables

**IMPORTANT**: Add Android SDK to your PATH:

1. **Find SDK location**:
   - Open Android Studio → Settings (File → Settings)
   - Appearance & Behavior → System Settings → Android SDK
   - Copy the "Android SDK Location" path
   - Default is usually: `C:\Users\YourName\AppData\Local\Android\Sdk`

2. **Add to Environment Variables**:
   - Press `Windows + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "User variables", click "New":
     - **Variable name**: `ANDROID_HOME`
     - **Variable value**: (paste SDK path from step 1)
   - Find "Path" variable, click "Edit", then "New":
     - Add: `%ANDROID_HOME%\platform-tools`
     - Add: `%ANDROID_HOME%\emulator`
   - Click "OK" on all dialogs

3. **Restart PowerShell/Terminal** for changes to take effect

## Step 6: Verify Installation

Open a **NEW** PowerShell window and run:

```powershell
adb --version
```

You should see output like: `Android Debug Bridge version 1.x.x`

If you get "command not found", restart your computer and try again.

## Step 7: Start the Emulator

**Option A: From Android Studio**
1. Open "Virtual Device Manager"
2. Click ▶️ (Play button) next to your device
3. Wait for emulator to boot (~30-60 seconds first time)

**Option B: From Command Line**
```powershell
emulator -avd Pixel_6_API_33
```

## Step 8: Run Your App

Once emulator is running:

```powershell
cd c:\Users\Lenovo\.gemini\antigravity\مخزون\inventory-12112\bakhour-inventory
npm run android
```

**First run** will take 2-3 minutes to build. Subsequent runs are faster (~30 seconds).

## 🎉 Success!

You should see your app open on the emulator. Now you can:
- ✅ Add products and see them persist
- ✅ Test order creation
- ✅ Pack orders and verify inventory decreases
- ✅ Close app → Reopen → Data is still there!

## ⚠️ Troubleshooting

### "adb: command not found"
- Restart computer after setting environment variables
- Verify `ANDROID_HOME` is set correctly

### "No connected devices"
- Make sure emulator is running before `npm run android`
- Run `adb devices` to verify emulator is detected

### Build fails
- Run `npm install` again
- Delete `node_modules` and `npm install` fresh
- Try `npx expo start --android` instead

### Emulator is slow
- Increase RAM in AVD settings (Settings → Advanced → RAM: 4096 MB)
- Enable hardware acceleration in BIOS if available

---

**Need help?** Let me know which step you're stuck on!
