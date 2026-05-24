# 🏥 ArogyaQueue — Smart OPD AI Triage System

![ArogyaQueue Banner](https://img.shields.io/badge/ArogyaQueue-Smart_OPD_Triage-blue?style=for-the-badge&logo=hospital)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=flat-square)
![Next.js](https://img.shields.io/badge/Framework-Next.js_15-black?style=flat-square&logo=next.js)
![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash-blueviolet?style=flat-square&logo=google-gemini)
![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green?style=flat-square&logo=mongodb)

---
## 🧠 Overview

**ArogyaQueue** is a production-ready, AI-powered **OPD Queue & Smart Triage System** designed specifically for:

> 🏥 **Indira Gandhi Memorial (I.G.M.) Hospital, Bhiwandi**  
> *Building the bridge between technology and healthcare accessibility.*

ArogyaQueue modernizes hospital OPD workflows by eliminating physical queues through AI-driven intelligence. It handles everything from patient self-registration to real-time administrative analytics.

### 🔑 Key Pillars
- **Efficiency:** Instant token generation via AI Triage.
- **Security:** PII (Personally Identifiable Information) protection using SHA-256.
- **Scalability:** Role-Based Access Control (RBAC) for Doctors, Receptionists, and Admins.

Powered by **Gemini 2.5 Flash**, the system intelligently analyzes patient symptoms and routes them to the correct medical department fetched dynamically from the database.

---

# 🎬 System Demo


## 📱 Patient Self-Ticketing


## 👨‍⚕️ Doctor Live Queue Dashboard


## 🏢 Reception Counter System


## ⚙️ Admin Control Panel


---



## 🚀 Core Modules & Features

### 📱 Patient Self-Ticketing Portal (`/`)
*   **Smart Registration:** Features **Aadhaar-based lookup**. If a patient has visited before, their details (Name, DOB, Gender, Mobile) are automatically fetched via a secure lookup API.
*   **Natural Language Triage:** Patients describe symptoms in plain English or Hindi.
*   **Intelligent Routing:** Dynamically routes patients to specialized departments using Gemini 2.5 Flash.
*   **Emergency Guardrail:** Immediate detection of life-threatening symptoms (chest pain, heavy bleeding), bypassing the queue and alerting them to go to Casualty.
*   **Rate Limiting:** Protects the system from spam using IP-based (5/hr) and Mobile-based (10/hr) limits.

### 🏢 Reception Counter Desk (`/reception`)
*   **High-Speed Entry:** Optimized for staff to handle walk-ins. Includes the same Aadhaar lookup feature as the patient portal.
*   **On-Spot Printing:** Generates a professional digital OPD slip with a unique ID and QR-ready format.
*   **Status Tracking:** Staff can see real-time allocation of the AI.

---

### 👨‍⚕️ Doctor Command Center (`/doctor`)
*   **Live Queue Sync:** Real-time dashboard showing the current patient and upcoming list.
*   **Smart Filtering:** Automatically filters the queue to show only patients assigned to the specific doctor's department.
*   **Hydration Optimized:** Smooth UI loading that prevents data mismatch and ensures stable session handling.
*   **One-Click Completion:** Doctors can mark patients as "Completed" to instantly fetch the next in line.

---

### ⚙️ Master Admin Control Room (`/admin`)
*   **Real-time Analytics:** Integrated with **Chart.js** to show daily, weekly, and monthly patient trends.
*   **Staff CRUD:** Full control to add/remove Doctors and Receptionists.
*   **Department Factory:** Admin can dynamically create hospital departments and assign unique Short Codes (e.g., ENT, CARD).
*   **Staff Availability:** Toggle "On Duty" or "Off Duty" status for doctors which instantly affects the AI triage routing.
*   **Data Export:** One-click **CSV Download** for hospital records and auditing.

---

## 🔐 Security & Architecture

### 🛡️ Authentication & Middleware
*   **JWT Security:** Uses JSON Web Tokens stored in **HTTP-only Cookies** to prevent XSS attacks.
*   **Server-Side Protection:** Next.js Middleware acts as a gatekeeper, validating every request to `/admin`, `/doctor`, and `/reception`.
*   **RBAC (Role Based Access Control):** 
    *   **Admin:** Full access to everything.
    *   **Doctor:** Access to their specific queue.
    *   **Receptionist:** Access to registration and slip generation.
*   **PII Security:** Aadhaar numbers are never stored in plain text. They are hashed using **SHA-256**, ensuring that even database leaks do not compromise patient identity.

---

### 🧠 AI Triage Engine
The heart of ArogyaQueue is its Triage Logic. It uses a **Hybrid Context Injection** model:
1. **Dynamic Context:** The system fetches the *current* list of active hospital departments from MongoDB.
2. **Prompt Engineering:** Gemini 2.5 Flash is instructed to prioritize "General Medicine" for common symptoms (fever, cold) and only route to specialists (Cardiology, Ortho) for organ-specific complaints.
3. **Multilingual Support:** Handles Hinglish inputs like *"Mujhe 3 din se bukhar hai"* with high accuracy.

**Triage Workflow:**
1.  Fetches active departments directly from MongoDB.
2.  Matches patient's symptoms against the live department list.
3.  Returns a mapping to the most relevant medical category.
4.  **Fallback Logic:** Automatically defaults to "General Medicine" if the AI is busy or symptoms are vague.

---

## 🛠️ Tech Stack
### Backend Architecture
- **Sequential Token Generation:** Implements an atomic increment logic to ensure no two patients get the same token number, even during high concurrency.
- **Date-Locked Queues:** Tokens are automatically reset every midnight, maintaining a daily sequential order (e.g., MED-1, MED-2).
<br>

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Chart.js |
| **Backend** | Next.js API Routes (Edge Compatible) |
| **Database** | MongoDB Atlas (Mongoose) |
| **AI Engine** | Google Gemini 2.5 Flash |
| **Auth** | JWT (jose) |
| **Icons** | Lucide React |

---

# 📦 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Farhan-Ansari-1/arogya-queue.git
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
arogya-queue/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/          # Admin operations (CRUD Staff/Depts)
│   │   │   ├── auth/login/     # JWT Authentication
│   │   │   ├── doctor/         # Queue management for doctors
│   │   │   └── triage/         # Gemini AI Triage Engine
│   │   ├── doctor/             # Doctor's Dashboard UI
│   │   ├── layout.js           # Global Layout & Fonts
│   │   └── page.js             # Patient Portal (Registration)
│   ├── components/             # Reusable UI (Navbar, Slip, Footer)
│   ├── lib/                    # Shared utilities (MongoDB config)
│   ├── models/                 # Mongoose Schemas (Token, Staff, etc.)
│   └── route.js                # Receptionist API (Token overrides)
├── public/                     # Static assets (Images, Logos)
├── .env.local                  # Environment variables (Private)
├── jsconfig.json               # Path aliases (@/*)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies
└── README.md                   # Documentation
```

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
