# AccessAble AI – Intelligent Accessibility Assistant

> Production-grade, AI-powered digital accessibility platform that directly assists people with disabilities using custom assistive technology tools and empowers web developers to audit and remediate WCAG 2.1 compliance barriers.

---

## Key Capabilities

1. **Direct Support for Disabled Users**:
   - **Visual**: 4 contrast themes (Standard Light, Dark Slate, High-Contrast Yellow on Black, Crisp Black on White), dynamic text scaling (100% to 145%), high-visibility focus indicators.
   - **Auditory & Speech**: Built-in Text-to-Speech (TTS) engine reading audit reports and page contents, plus hands-free Voice Navigation commands.
   - **Motor**: Complete keyboard navigation (Tab, Shift+Tab, Enter, Escape), accessible skip links (WCAG 2.4.1), and large touch targets (WCAG 2.5.5).
   - **Cognitive**: Dyslexia-friendly typography, 1.85 easy-reading line/letter spacing, and reduced-motion toggle.

2. **Automated WCAG 2.1 Accessibility Scanner**:
   - Automated rule engine detecting missing image alt attributes, low color contrast ratios, unlabelled form inputs, skipped heading hierarchies, and missing buttons names.
   - Strict SSRF protection rejecting internal IPs, loopback, private RFC 1918 networks, and cloud metadata.
   - Pre-packaged test environments (`inaccessible.html` with known flaws and `accessible.html` with 100% AAA compliance).

3. **AI Repair Assistant**:
   - Plain-English breakdown of why an issue violates WCAG.
   - Impact assessment broken down by disability group (Blind, Low-Vision, Motor, Cognitive).
   - Side-by-side original vs fixed HTML/CSS code diffs.
   - Safe visual sandbox preview with live re-test validation.
   - Supports Google Gemini API with intelligent built-in rule knowledge base fallback.

4. **Installable PWA & Android Capacitor Support**:
   - Service worker offline fallback (`sw.js`) and Web App Manifest (`manifest.json`).
   - Capacitor configuration (`capacitor.config.ts`) and full Android APK release guide (`ANDROID_BUILD.md`).

---

## Architecture Overview

```
accessable-ai/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # Accessible UI components & SkipLink
│   │   │   ├── layout/           # Navbar, Footer, SkipLink
│   │   │   ├── accessibility/    # AccessibilityToolbar, VoiceModal, ShortcutsModal
│   │   │   └── common/           # Button, Card, Badge
│   │   ├── pages/                # Home, Dashboard, Scanner, Report, AI Repair, History, Hub
│   │   ├── context/              # AccessibilityContext, ScanContext, AuthContext
│   │   ├── services/             # api.ts, tts.ts, speechRecognition.ts
│   │   └── types/                # TypeScript interfaces
│   ├── public/                   # manifest.json, sw.js, favicon.svg
│   └── capacitor.config.ts       # Android / Mobile integration config
│
├── backend/                      # Python FastAPI + SQLAlchemy + SQLite / Postgres
│   ├── app/
│   │   ├── api/                  # /health, /auth, /scans, /assistant, /preferences
│   │   ├── core/                 # security.py, ssrf_validator.py, scanner.py
│   │   ├── ai/                   # engine.py, rules_db.py
│   │   ├── models/               # User, ScanReport, AccessibilityFinding, UserPreference
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── static/test_pages/    # accessible.html and inaccessible.html fixtures
│   ├── tests/                    # 15 automated test suites (SSRF, Scans, AI, Auth, Health)
│   ├── requirements.txt
│   └── run.py                    # Startup runner
│
└── ANDROID_BUILD.md              # Android APK generation & signing guide
```

---

## Quick Start (Local Development)

### 1. Start the Backend API

```powershell
cd backend
# Optional: create and activate virtual environment
# python -m venv venv; .\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python run.py
```
Backend will start on `http://127.0.0.1:8000`.
- Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend Application

```powershell
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`.

---

## Running the Automated Test Suite

### Run Backend Unit & Integration Tests (15 tests)
```powershell
cd backend
python -m pytest -v
```

### Run Frontend TypeScript Compilation & Bundle Build
```powershell
cd frontend
npm run build
```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8000` | Port for the backend server |
| `DATABASE_URL` | `sqlite:///./accessable.db` | Database connection string (PostgreSQL for prod) |
| `SECRET_KEY` | `accessable_ai_super_secret...` | JWT token secret key |
| `GEMINI_API_KEY` | `""` | Optional Google Gemini API key for live AI |
| `SCAN_TIMEOUT_SECONDS` | `30` | Max duration per website audit |

### Frontend (`frontend/.env`)
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api` | Base URL for REST API calls |

---

## Production Deployment

### Production Start (Backend)
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Production Build (Frontend)
```bash
npm run build
# Output in frontend/dist ready for Nginx, Vercel, Netlify, or S3
```
