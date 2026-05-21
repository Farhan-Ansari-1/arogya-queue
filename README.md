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
> *Building the bridge between technology and healthcare accessibility.*

The platform modernizes traditional hospital OPD workflows by combining:

* 📱 Digital self-ticketing
* 🧠 AI-based patient triage
* 👨‍⚕️ Doctor queue management
* 🔐 Secure JWT-based Authentication & RBAC (Role Based Access Control)
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

## 🚀 Core Modules & Features

### 📱 Patient Self-Ticketing Portal (`/`)
*   **Smart Registration:** Features **Aadhaar-based lookup**. If a patient has visited before, their details (Name, DOB, Gender, Mobile) are automatically fetched via a secure lookup API.
*   **Natural Language Triage:** Patients describe symptoms in plain English or Hindi.
*   **AI Routing:** Dynamically routes patients to specialized departments using Gemini 1.5 Flash.
*   **Emergency Guardrail:** Immediate detection of life-threatening symptoms (chest pain, heavy bleeding), bypassing the queue and alerting them to go to Casualty.
*   **Rate Limiting:** Protects the system from spam using IP and Mobile-based limits.

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
*   **Aadhaar Privacy:** Aadhaar numbers are hashed using **SHA-256** before being stored, ensuring PII (Personally Identifiable Information) security.

---

### 🧠 AI Triage Engine
The system utilizes **Gemini 1.5 Flash** with custom system instructions:
1.  Fetches active departments directly from MongoDB.
2.  Matches patient's symptoms against the live department list.
3.  Returns a mapping to the most relevant medical category.
4.  **Fallback Logic:** Automatically defaults to "General Medicine" if the AI is busy or symptoms are vague.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Chart.js |
| **Backend** | Next.js API Routes (Edge Compatible) |
| **Database** | MongoDB Atlas (Mongoose) |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Auth** | JWT (jose) |

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
