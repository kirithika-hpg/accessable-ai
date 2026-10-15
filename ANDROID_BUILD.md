# AccessAble AI – Android APK Build Guide (Capacitor)

This guide provides step-by-step instructions to bundle and build **AccessAble AI** into an Android APK using **Capacitor**.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18+ or v20+ (`node -v`)
- **Java Development Kit (JDK)**: OpenJDK 17 or 21 (`java -version`)
- **Android Studio**: With Android SDK Platforms (API Level 33 or 34) and Android SDK Build-Tools.
- **Environment Variables**:
  - `ANDROID_HOME`: e.g. `C:\Users\<user>\AppData\Local\Android\Sdk`
  - `PATH`: Includes `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\cmdline-tools\latest\bin`

---

## 2. Configure Production Backend URL

In Capacitor, the mobile web assets run on device inside a WebView (`capacitor://localhost`). To communicate with your backend, configure the production backend API URL in `.env.production` inside the `frontend` folder:

```bash
# In accessable-ai/frontend/.env.production
VITE_API_URL=https://api.accessable.ai/api
```

---

## 3. Install Capacitor Dependencies

From the `frontend/` directory, install Capacitor packages:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
```

---

## 4. Build Production Web Assets & Initialize Android Platform

Compile the React frontend into static assets:

```bash
npm run build
```

Then initialize the Android project:

```bash
npx cap add android
npx cap sync
```

This creates the native Android project in `frontend/android/`.

---

## 5. Build Debug APK via Command Line

You can build a test debug APK directly with Gradle:

```bash
cd android
./gradlew assembleDebug
```

On Windows PowerShell:
```powershell
cd android
.\gradlew.bat assembleDebug
```

The compiled APK will be generated at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

You can install it directly onto a connected Android device or emulator:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Generate a Signed Release APK for Production

### Step A: Generate a Keystore Key
If you do not have an existing release keystore, generate one using Java's `keytool`:

```bash
keytool -genkey -v -keystore accessable-release-key.jks -alias accessable-key -keyalg RSA -keysize 2048 -validity 10000
```
Keep this keystore file and your password secure.

### Step B: Build Release Bundle
```powershell
cd frontend/android
.\gradlew.bat assembleRelease
```
The unsigned APK is created at:
`frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Step C: Sign the APK with `zipalign` and `apksigner`
Align the APK:
```bash
zipalign -v -p 4 app-release-unsigned.apk AccessAble-AI-aligned.apk
```

Sign the APK:
```bash
apksigner sign --ks accessable-release-key.jks --out AccessAble-AI-Production.apk AccessAble-AI-aligned.apk
```

Verify signature:
```bash
apksigner verify AccessAble-AI-Production.apk
```

`AccessAble-AI-Production.apk` is now ready for deployment to the Google Play Console or direct distribution.
