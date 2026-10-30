# Our Little Universe 💗
### A Dreamy, Cute & Interactive Romantic Web Experience with Mandatory Real Authentication

Welcome to **Our Little Universe** — a private, magical, heartwarming romantic website filled with pastel colors, floating hearts, scrapbooked polaroids, love letters, delightful interactive surprises, real-website legal pages (**Privacy Policy** and **Terms of Use**), and a **mandatory, real authentication system**.

---

## 🔐 Mandatory Authentication & Privacy Architecture

The main universe content (`index.html`) is **strictly protected** and cannot be viewed without an active authenticated session.

### 1. Dual-Layer Protection Guard
- **Server-Side Route Enforcement (`serve.js`)**: Direct HTTP requests to `/` or `/index.html` without a valid session token receive an immediate **HTTP 302 Redirect** to `/login.html`. Direct URL access cannot bypass authentication.
- **Client-Side Auth Guard (`index.html`)**: The `<head>` executes an immediate `UniverseAuth.requireAuth()` check before revealing the DOM (`html:not(.auth-verified) body { display: none !important; }`), ensuring zero flash of protected content.

### 2. Dual-Engine Authentication System (`js/auth.js`)
1. **Production Mode — Supabase Cloud Auth**:
   - Integrates the official `@supabase/supabase-js` SDK.
   - Real email & password authentication, email confirmation links, JWT session management, and password resets.
   - Includes full database migrations and **Row Level Security (RLS)** in `supabase-schema.sql`.
   - Never exposes secret or service-role keys in client files (configured via `.env` or client public anon key).
2. **Local Development Mode — Secure PBKDF2 Engine (`auth.js` & `serve.js`)**:
   - When Supabase credentials have not yet been configured in `.env`, the system automatically falls back to an integrated local server engine using **PBKDF2 cryptographic hashing** (10,000 rounds of SHA-512) with random salts and HttpOnly session cookies.
   - Shows an honest, clear status badge in the UI explaining which authentication engine is active so you are never misled.

---

## 🌸 Visual Aesthetic & Design System

- **Pastel Color Palette**:
  - Blush Pink: `#FFD6E7`
  - Soft Pink: `#FFB6D5`
  - Lavender: `#DCD6FF`
  - Cream: `#FFF8F2`
  - Rose Red: `#FF5C8A`
  - Dark Plum: `#51364F`
  - Soft Gold: `#FFE29A`
- **Dreamy Micro-Animations**:
  - Canvas-driven floating pastel hearts, twinkling stars, and sparkles.
  - Interactive desktop mouse sparkle trail (automatically disabled on mobile/touch screens).
  - Glowing glassmorphism cards with smooth backdrop blur.
  - Interactive pulsing center heart with celebratory heart bursts.
- **Typography**:
  - Cursive headings: *Caveat* & *Sacramento* (Google Fonts)
  - Readable body: *Nunito* (Google Fonts)

---

## ✨ Multi-Page Architecture

### 1. Protected Main Universe (`index.html`)
- Accessible **only after successful authentication**.
- Displays a personalized greeting banner: *"Welcome back, Luna 💗! The universe has missed you."*
- Includes a dedicated user account navigation pill with the user's display name and a working **"Logout 🚪"** button.
- All interactive features preserved:
  - Hero section with interactive pulsing heart.
  - Scrapbook Polaroid gallery with high-res vector SVGs and Lightbox modal.
  - Interactive folded wax-seal 3D love letter with typewriter animation, heart showers, and clipboard copy.
  - Deterministic Love Calculator ("Magic Match").
  - 4-question relationship personality archetype quiz.
  - Live anniversary/milestone countdown timer with `localStorage` persistence.
  - Magical 3D gift box with secret romantic message.
  - Dual-engine background music player with Web Audio synthesizer fallback.
  - 3-column real-website footer with dynamic copyright year.

### 2. Login Page (`login.html`)
- Heading: **"Welcome Back to Our Little Universe 💗"**
- Subtitle: *"Your little world of magic is waiting for you."*
- Email, Password with Show/Hide toggle button (`👁️` / `🙈`), Remember Me option, and Forgot Password link.
- **Quick Demo Login button**: Pre-fills default lover credentials (`luna@ouruniverse.love` / `CosmicLove2026!`) for 1-click testing.
- Links to Sign Up, Privacy Policy, and Terms of Use.

### 3. Sign-Up Page (`signup.html`)
- Heading: **"Join Our Little Universe ✨"**
- Display name, Email, Password with interactive 8+ character validation checklist, and Password Confirmation.
- Mandatory Terms of Use and Privacy Policy acceptance checkbox.
- Duplicate account prevention and friendly feedback.

### 4. Password Reset Page (`reset-password.html`)
- Dual-state password recovery flow:
  1. Request reset link by entering account email.
  2. Set and confirm new password (minimum 8 characters) when arriving with recovery token.

### 5. Privacy Policy (`privacy.html`) & Terms of Use (`terms.html`)
- Accessible publicly from login and registration cards.
- Accurately details account information collection, cryptographic password hashing, email verification, session tokens, password resets, Supabase third-party processing, and account deletion options.

---

## 📁 Project File Structure

```
our-little-universe/
├── index.html                   # Protected main romantic experience
├── login.html                   # Dreamy login page with validation & show/hide toggle
├── signup.html                  # Sign-up page with display name & password checklist
├── reset-password.html          # Secure password reset request & confirmation
├── privacy.html                 # Complete Privacy Policy with account disclosures
├── terms.html                   # Complete Terms of Use with account security rules
├── css/
│   └── style.css                # Custom CSS3 styles, glassmorphism, responsive grid & auth UI
├── js/
│   ├── auth.js                  # Client-side UniverseAuth manager (Supabase + Local fallback)
│   ├── script.js                # Vanilla JS interactions, canvas, audio & state
│   └── three.module.js          # Three.js module
├── assets/
│   ├── images/                  # Scrapbook memory SVG illustrations
│   └── music/                  # Background music assets
├── data/
│   ├── users.json               # Local secure PBKDF2 user storage
│   ├── sessions.json            # Active session tokens
│   └── resets.json              # Time-limited password reset tokens
├── auth.js                      # Server-side PBKDF2 authentication engine
├── serve.js                     # Node HTTP server with route protection & cookies
├── supabase-schema.sql          # Supabase SQL migration script with Row Level Security (RLS)
├── .env.example                 # Environment variables template for Supabase
├── .gitignore                   # Ignores sensitive environment files & modules
├── test-site.js                 # Automated route protection & endpoint test runner
├── test-logic.js                # Core interactive logic contract verification
├── test-verification.js         # Comprehensive multi-page & auth verification suite
└── README.md                    # Project documentation & setup guide
```

---

## 🚀 How to Run the Website

### Step 1: Start the Development Server
```bash
node serve.js
```
The server will start at `http://localhost:5500`.

### Step 2: Open in Your Browser
Navigate to `http://localhost:5500/`.
- Notice that because you are unauthenticated, you will be **automatically redirected to `login.html`**.
- Direct URL access to `http://localhost:5500/index.html` is protected and will also redirect to `login.html`.

### Default Demo Account for Immediate Testing
- **Email**: `luna@ouruniverse.love`
- **Password**: `CosmicLove2026!`
- *(Tip: Click the **"✨ Quick Demo Login"** button on `login.html` to fill this automatically!)*

---

## ☁️ Setting Up Supabase Cloud Auth (Optional / Production)

To connect Our Little Universe to your own Supabase project:

1. **Create a Free Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a project.
2. **Apply Database Schema & Row Level Security**:
   - Open your project dashboard -> **SQL Editor**.
   - Copy the contents of [`supabase-schema.sql`](file:///d:/Projects/Card%20PROJECT%20OUR%20LITTLE%20UNIVERSE%20%F0%9F%92%97/supabase-schema.sql) and click **Run**.
   - This creates the `profiles` table, the `user_memories` table, triggers, and all Row Level Security policies.
3. **Configure Environment Variables**:
   - Go to **Project Settings -> API**.
   - Copy your **Project URL** and **anon public key**.
   - Create a `.env` file in the project root:
     ```bash
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - Restart the server (`node serve.js`). The frontend will automatically detect Supabase and activate Cloud Auth mode!

---

## 🧪 Automated Quality & Security Verification

Run all test suites to verify 100% contract compliance, security guards, and broken-link freedom:

```bash
# 1. Verify core interactive logic & DOM IDs
node test-logic.js

# 2. Verify server-side route protection (302 redirects) and public endpoints
node test-site.js

# 3. Verify all multi-page auth features, RLS schema, and legal terms
node test-verification.js
```

---

## 📋 Pre-Publication Checklist for Website Owners

- [ ] **Configure Supabase Cloud Auth** or verify that local server credentials meet your needs.
- [ ] **Replace Contact Email Placeholders**: Search for `[Add your contact email here]` in `index.html`, `privacy.html`, `terms.html`, and replace with your genuine contact email.
- [ ] **Personalize Scrapbook Photos**: Place your photos into `assets/images/` and update captions in `index.html`.
- [ ] **Personalize Background Music**: Drop your song into `assets/music/background.mp3`.
- [ ] **Personalize the Love Letter**: Edit `LOVE_LETTER_CONTENT` in `js/script.js`.
- [ ] **Verify Secret Exclusions**: Ensure `.env` is listed in `.gitignore` and never committed to version control.

---

Made with a little HTML, a little CSS, and a lot of imagination 💗
#   L i t t l e U n i v e r s e  
 