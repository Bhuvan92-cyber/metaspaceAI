# MetaSphere AI — Official API-Based Personal Meta Account Manager

<div align="center">

![MetaSphere AI Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

**A centralized, permission-based AI assistant for authorized Facebook Pages, Instagram Business/Creator accounts, and WhatsApp Business channels.**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![AES-256-GCM](https://img.shields.io/badge/Token_Vault-AES--256--GCM-emerald?style=for-the-badge&logo=lock)](https://nodejs.org/api/crypto.html)

</div>

---

## 🌟 Executive Summary & Core Principle

**MetaSphere AI** is an AI-powered personal account-management platform designed to help creators, brands, and businesses manage their official Facebook, Instagram, and WhatsApp Business presence strictly through **official Meta APIs, OAuth authorization, secure token encryption, and transparent AI assistance**.

> ### 🛡️ The System Principle
> **"No Authorization = No Access."**
> The system operates exclusively within the permissions granted by the authenticated user through official Meta authorization dialogues. It does **not** scrape data, bypass end-to-end encryption, read personal WhatsApp chats, or use unofficial client hacks.

---

## 🚀 Key Modules & Capabilities

```text
                               ┌──────────────────────────┐
                               │   MetaSphere AI Suite    │
                               └─────────────┬────────────┘
                                             │
      ┌────────────────────┬─────────────────┼──────────────────┬────────────────────┐
      ▼                    ▼                 ▼                  ▼                    ▼
┌─────────────┐    ┌───────────────┐  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│ AI Content  │    │  Scheduler &  │  │  Comments   │    │   Business   │    │  AI Command   │
│   Studio    │    │  Auto-Worker  │  │   Triage    │    │  Messaging   │    │   Interface   │
└─────────────┘    └───────────────┘  └─────────────┘    └──────────────┘    └───────────────┘
      │                    │                 │                  │                    │
      └────────────────────┼─────────────────┴──────────────────┼────────────────────┘
                                             ▼
                               ┌──────────────────────────┐
                               │     Official Meta API    │
                               │  (Facebook, IG, WhatsApp)│
                               └──────────────────────────┘
```

### 1. 🎛️ Unified Meta Dashboard (`/dashboard`)
- **Central KPI Metrics**: Real-time 7-day Reach, Engagement Rates, Customer Response Times, and Active Publishing Queues.
- **Channel Health**: Real-time status cards for Facebook Pages, Instagram Creator/Business profiles, and WhatsApp Business Cloud API numbers.
- **AI Recommendations Feed**: Contextual suggestions (optimal posting times, audience engagement spikes, and response velocity).

### 2. ✍️ AI Content Studio (`/content-studio`)
- **Multi-Tone Caption Generator**: Powered by Google Gemini 2.0 with 5 selectable brand tones (*Engaging, Professional, Promotional, Humorous, Informative*).
- **Hashtag Finder & Variation Engine**: 1-click alternative hook variations and relevant hashtag pills.
- **Live Social Media Mockup**: Real-time visual previews for Instagram Posts, Facebook Feed updates, and WhatsApp Business broadcasts.
- **Flexible Actions**: Publish Now via Official API, Schedule for Later, or Save as Draft.

### 3. 📅 Scheduled Content & Publishing Worker (`/scheduled`)
- **Queue & Calendar Management**: Interactive filtered view of Scheduled, Drafted, and Published posts.
- **Background Publishing Worker**: In-process scheduler that automatically publishes queued posts at the scheduled time using official Meta API endpoints.

### 4. 💬 Instagram & Facebook Comment Triage (`/comments`)
- **Sentiment & Priority Tagging**: Automatic detection of customer inquiries, positive feedback, or urgent complaints.
- **1-Click AI Reply Approval**: Generates context-aware reply drafts that users can edit or approve with a single click.

### 5. 📨 Business Messaging Hub (`/messages`)
- **Split-Pane Inbox**: Centralized conversations for WhatsApp Business and Instagram Direct Messages.
- **Intent Classification**: Classifies inbound customer messages into *Sales Inquiry*, *Question*, *Complaint*, or *Feedback*.
- **Supervised Dispatch**: Reply with AI-assisted drafts via the official WhatsApp Cloud API or Instagram Messaging gateway.

### 6. 🤖 Personal AI Command Interface (`/ai-assistant`)
- **Natural Language Analytics Queries**: Ask questions like *"Show me our best performing Instagram post this month"* or *"When is our audience most active?"*.
- **Strategic Synthesis**: Distinguishes between factual platform metrics and actionable AI growth recommendations.

### 7. 📊 Analytics & Performance Insights (`/analytics`)
- **Interactive Recharts Visualizations**: Comparative area and bar charts tracking weekly reach, impressions, and engagement volume.
- **Strict Compliance Delineation**: Raw platform data is cleanly separated from AI-generated strategic interpretations.

### 8. 🔐 Secure Token Vault & Permissions (`/accounts`)
- **Hardware-Grade AES-256-GCM**: OAuth access tokens are encrypted with unique initialization vectors and authentication tags before storage. Tokens are never transmitted to the frontend in plaintext.
- **Granular Permission Toggles**: View and toggle individual OAuth scopes (`pages_manage_posts`, `instagram_basic`, `whatsapp_business_messaging`).
- **1-Click Disconnect**: Instantly revokes authorization and wipes encrypted keys from the database.

### 9. 📜 Activity & Security Audit Trail (`/audit`)
- **Tamper-Evident History**: Searchable and filterable audit logs distinguishing `USER` actions, `AI` suggestions, `SCHEDULER` jobs, and `META_WEBHOOK` ingestion events.

### 10. ⚡ Dual Mode: Sandbox Simulation & Live Meta APIs (`/settings`)
- **Instant Sandbox Mode**: Test the full platform immediately with pre-seeded Facebook Pages, Instagram Creators, and WhatsApp chats without waiting for Meta App Review.
- **Live Meta API Mode**: Connect official App IDs, Page Access Tokens, and WhatsApp Cloud API credentials to interact with real Meta accounts.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 14+](https://nextjs.org/) (App Router, Server Actions, React 18) |
| **Styling & Components** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), Custom Glassmorphism UI |
| **Charts & Visuals** | [Recharts 2.x](https://recharts.org/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with SQLite (local) / PostgreSQL ready |
| **Encryption & Security** | Node.js `crypto` with `AES-256-GCM` Hardware Vault |
| **AI Intelligence** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Gemini 2.0 Flash) + Offline Deterministic Engine |
| **Meta Graph APIs** | Facebook Graph API v19.0, Instagram Graph API, WhatsApp Business Cloud API |

---

## 📦 Project Directory Structure

```text
metaspaceAI/
├── prisma/
│   └── schema.prisma            # 10 Prisma relational models (Users, Vault, Posts, Logs, etc.)
├── src/
│   ├── app/
│   │   ├── (modules)/
│   │   │   ├── accounts/        # Connected Accounts & Token Vault UI
│   │   │   ├── ai-assistant/    # Conversational AI Command Interface
│   │   │   ├── analytics/       # Analytics & Recharts Performance Dashboard
│   │   │   ├── audit/           # Activity & Security Audit Trail
│   │   │   ├── comments/        # Facebook & Instagram Comment Triage
│   │   │   ├── content-studio/  # AI Content Generator & Multi-Platform Preview
│   │   │   ├── dashboard/       # Central Unified Meta Dashboard
│   │   │   ├── messages/        # WhatsApp & Instagram Business Messaging Hub
│   │   │   ├── scheduled/       # Scheduled Queue & Calendar
│   │   │   └── settings/        # API Configuration & Simulation Mode Switch
│   │   ├── api/                 # 12 RESTful API Endpoints (OAuth, Content, AI, Webhooks, etc.)
│   │   ├── globals.css          # Theme styles, glow effects, scrollbar
│   │   ├── layout.tsx           # Global layout with responsive sidebar & header
│   │   └── page.tsx             # Root redirect to /dashboard
│   ├── components/
│   │   ├── Header.tsx           # Channel status indicators, profile, quick actions
│   │   ├── LiveSimulationBanner.tsx # Sandbox vs Live switcher banner
│   │   └── Sidebar.tsx          # Navigation sidebar
│   └── lib/
│       ├── ai/                  # Gemini AI SDK, ContentStudio, Messaging & Analytics AI
│       ├── meta/                # Facebook, Instagram, WhatsApp clients & Sandbox Simulator
│       ├── scheduler/           # Background post publisher worker
│       ├── audit.ts             # Activity logging helper
│       ├── db.ts                # Prisma singleton client
│       ├── encryption.ts        # AES-256-GCM Secure Token Vault
│       └── seed.ts              # Database seeder script
├── .env.example                 # Environment variable template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ Quick Start Guide

### 1. Clone & Install Dependencies
```powershell
# Navigate to project directory
cd metaspaceAI

# Install packages
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or use `.env.example`):
```env
# Local SQLite database
DATABASE_URL="file:./dev.db"

# Master Encryption Key for Token Vault (AES-256-GCM)
TOKEN_VAULT_SECRET="metasphere_super_secret_master_encryption_key_32_bytes_min!"

# Optional: Official Meta App Credentials (for Live Mode)
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
META_WEBHOOK_VERIFY_TOKEN="metasphere_secure_webhook_verify_token"

# Optional: Google Gemini AI API Key
GEMINI_API_KEY=""

# Application Host URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize & Seed Database
```powershell
# Push Prisma schema to SQLite database
npx prisma db push

# Seed demo accounts, posts, comments, and messages
npm run db:seed
```

### 4. Start Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔗 How to Connect Your Accounts

### Option A: Instant Sandbox Mode (Zero Setup)
1. Open **[http://localhost:3000/accounts](http://localhost:3000/accounts)**.
2. Click **"Connect via Meta OAuth"** on Facebook, Instagram, or WhatsApp.
3. Select the **"⚡ Instant Sandbox (Demo)"** tab and click **"Authorize & Connect"**.
4. The account will immediately display as **`✓ AUTHORIZED`** with official permissions enabled.

### Option B: Connect Real Live Meta Accounts
1. Go to [developers.facebook.com](https://developers.facebook.com) and create an app with:
   - **Facebook Login for Business**
   - **Instagram Graph API**
   - **WhatsApp Business Cloud API**
2. Obtain your **Page Access Token**, **Instagram User ID**, or **WhatsApp Phone Number ID**.
3. In MetaSphere AI, navigate to **Connected Accounts (`/accounts`)** > **"Connect via Meta OAuth"**.
4. Select the **"🌐 Official Live API Token"** tab, enter your details, and click **"Save to Vault & Connect"**.
5. Go to **Settings (`/settings`)** and toggle off **Sandbox Simulation Mode** to activate **Live Mode**.

---

## 🔒 Security & Privacy Boundaries

| Principle | Enforcement |
|---|---|
| **No Password Collection** | Passwords are never collected; access is granted via official OAuth 2.0. |
| **AES-256 Token Encryption** | All tokens are encrypted at rest with AES-256-GCM using unique IVs. |
| **Zero Private WhatsApp Access** | Exclusively connects to official WhatsApp Business numbers via Cloud API. |
| **No Scraping or Bypass** | Interacts solely through official Meta Graph API endpoints. |
| **Supervised Automation** | AI reply drafts require explicit user approval before dispatch. |
| **Full Audit Trail** | Every API call, user approval, and AI generation is immutably logged. |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server on `localhost:3000` |
| `npm run build` | Validates TypeScript and generates an optimized production build |
| `npm run start` | Runs the compiled Next.js production server |
| `npm run db:push` | Synchronizes the Prisma schema with the SQLite database |
| `npm run db:seed` | Seeds the database with default accounts, posts, and messages |

---

## 📄 License

This project is licensed under the MIT License — designed for official Meta ecosystem management with strict privacy compliance.
