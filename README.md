# 🏥 ArogyaQueue — Smart OPD AI Triage System

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Framework](https://img.shields.io/badge/framework-Next.js-black)]()
[![Database](https://img.shields.io/badge/database-MongoDB-green)]()
[![AI](https://img.shields.io/badge/AI-Gemini%202.5-blueviolet)]()
[![Hospital](https://img.shields.io/badge/deployment-I.G.M.%20Hospital-red)]()

---

## 🧠 Overview

**ArogyaQueue** is a production-ready, AI-powered **OPD Queue & Smart Triage System** designed specifically for:

> 🏥 **Indira Gandhi Memorial (I.G.M.) Hospital, Bhiwandi**

The platform modernizes traditional hospital OPD workflows by combining:

* 📱 Digital self-ticketing
* 🧠 AI-based patient triage
* 👨‍⚕️ Doctor queue management
* 🔐 Secure JWT-based Authentication & RBAC
* 🏢 Reception desk operations
* ⚙️ Real-time administrative control

Powered by **Gemini 2.5 Flash**, the system intelligently analyzes patient symptoms and routes them to the correct medical department fetched dynamically from the database.

---

# 🎬 System Demo

> ⚠️ Replace these placeholders with real GIF recordings from `/assets`

## 📱 Patient Self-Ticketing

![Patient Portal](assets/patient-demo.gif)

## 👨‍⚕️ Doctor Live Queue Dashboard

![Doctor Portal](assets/doctor-demo.gif)

## 🏢 Reception Counter System

![Reception Portal](assets/reception-demo.gif)

## ⚙️ Admin Control Panel

![Admin Panel](assets/admin-demo.gif)

---

# 🚀 Core Features & Modules

---

## 📱 Patient Self-Ticketing Portal (`/`)

Designed for citizens using smartphones from home or hospital waiting areas.

### Features

* Patient registration form
* Natural-language symptom input
* AI-based department routing (Dynamic)
* Real-time token generation
* Instant digital OPD slip

### Required Inputs

* Name
* Age
* Gender
* Mobile Number
* Symptoms

---

## 🏢 Reception Counter Desk (`/reception`)

Built for hospital staff handling:

* Elderly patients
* Offline citizens
* Walk-in emergency cases

### Features

* Fast registration UI
* Printer-friendly layout
* PDF slip generation
* Desktop optimized workflow

---

## 👨‍⚕️ Doctor Command Center (`/doctor`)

Live queue management system for OPD consultants.

### Features

* “Now Serving” section
* Upcoming waiting list
* Real-time database sync
* One-click patient completion
* Automatic queue advancement

---

## ⚙️ Master Admin Control Room (`/admin`)

Centralized hospital management dashboard with full CRUD capabilities.

### Features

* **Staff Management:** Register, update, and remove Doctors and Receptionists.
* **Secure Setup:** Master Key protected admin initialization.
#### 🏭 Dynamic Department Factory

Admin can:

* Add departments
* Remove departments
* Assign short codes

Examples:

```text
Cardiology → CARD
Ophthalmology → EYE
Gynaecology → GYN
```

---

#### 👨‍⚕️ Doctor & Cabin Management

Admin can:

* Deploy new doctors
* Bind doctors to departments
* Assign cabin numbers
* Toggle active/inactive status

---

# 🧠 AI Triage Engine (`/api/triage`)

The heart of the system.

Powered by:

```text
gemini-2.5-flash
```

---

## ⚡ How It Works

1. Patient enters symptoms
2. AI analyzes severity & intent
3. System fetches active departments from DB
4. AI selects the best medical category
5. Token generated automatically

---

## 🚨 Emergency Detection System

Critical symptoms bypass normal OPD flow.

Examples:

* Chest pain
* Heavy bleeding
* Breathing issues
* Stroke symptoms

### Result

```text
🚨 RED ALERT — DIRECT TO CASUALTY
```

This ensures emergency patients receive immediate medical attention.

---

# 🧱 System Architecture

```text
Patient / Reception
        │
        ▼
┌────────────────────┐
│   Next.js Frontend │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│   API Route Layer  │
│   /api/triage      │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ Gemini 2.5 Flash AI│
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ MongoDB Atlas DB   │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ Doctor/Admin Panels│
└────────────────────┘
```

---

# 🛠️ Tech Stack

| Layer     | Technology         |
| --------- | ------------------ |
| Frontend  | Next.js 16         |
| Styling   | Tailwind CSS       |
| Icons     | Lucide React       |
| Backend   | Next.js API Routes |
| Database  | MongoDB Atlas      |
| ORM       | Mongoose           |
| AI Engine | Gemini 2.5 Flash   |
| Runtime   | Node.js            |

---

# 📦 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/arogya-queue.git
cd arogya-queue
```

---

## 2️⃣ Install Packages

```bash
npm install
```

---

# 🔐 Environment Variables

Create:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=your_google_ai_studio_api_key

MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxx.mongodb.net/arogya_db?retryWrites=true&w=majority
```

---

# 🚀 Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 📂 Project Structure

```bash
ArogyaQueue/
│
├── app/
│   ├── page.tsx                # Patient Portal
│   ├── reception/              # Reception Desk
│   ├── doctor/                 # Doctor Dashboard
│   ├── admin/                  # Admin Control Room
│   └── api/
│       └── triage/route.ts     # AI Triage Engine
│
├── components/                 # Shared UI
├── lib/                        # DB + AI utilities
├── models/                     # Mongoose schemas
├── assets/                     # GIF demos
├── .env.local
├── package.json
└── README.md
```

---

# 🔮 Roadmap

* [ ] Secure authentication (NextAuth / JWT)
* [ ] Live token display TVs
* [ ] SMS / WhatsApp notifications
* [ ] Voice-assisted registration
* [ ] Multi-language support
* [ ] Doctor analytics dashboard
* [ ] Offline hospital fallback mode

---

# ⚠️ Disclaimer

This project is intended for:

* Educational purposes
* Hospital workflow modernization
* AI-assisted medical routing research

It is **NOT** a replacement for licensed medical diagnosis or emergency services.

---

# 💀 Final Line

> ArogyaQueue is not just a queue system.
> It’s an AI-powered digital bridge between patients, doctors, and hospital infrastructure.

---

<p align="center">
⭐ Star the repo • 🏥 Modernize healthcare • 🚀 Build the future
</p>
