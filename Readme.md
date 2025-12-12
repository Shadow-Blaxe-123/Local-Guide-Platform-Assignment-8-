# Local Guide Platform

Local Guide Platform connects travelers with passionate local experts who can offer authentic, personalized experiences. Unlike generic tour agencies, this platform empowers individuals to share their city’s hidden gems, culture and stories. Travelers can find guides who match their interests whether for a food crawl, a photography walk or a historical tour and explore a destination like a local.

This project democratizes travel guiding, allowing locals to monetize their knowledge and travelers to access unique, off-the-beaten-path experiences.

---

## 🚀 Features

- 📮 User roles: `Admin`, `Guide`, `Tourist`
- 🔐 JWT-based Authentication
- 🔍 Advanced filtering, search, and pagination
- 🧪 Centralized error handling and validation

## Techstack

- **Typescript** --> Type safety.
- **ESLint** --> Code linting.
- **Postgres** --> Database,
- **Express** --> Server Framework.
- **Zod** --> Schema Validation.
- **Bcrypt** --> Password Hashing.
- **JWT** --> Auth tokens.
- **Prisma** --> DB ORM.
- **Render** --> Deployment.
- **Git** + **Github** --> Version Control.

## Folder Structure

```bash
src/
│
├── app.ts              # Main express app
|── server.ts           # Server entry point
├── app/             
      ├── config/             # Environment config
      ├── error/              # Global error handling
      ├── interface/          # Global Interface to extend Express Req
      ├── middleware/         # Auth & validation & Error middleware
      ├── modules/
      │         ├── auth              # Authentication service, controller
      │         ├── bookings/           # Bookings
      │         ├── meta/           # Dashboard
      │         ├── payments/           
      │         ├── reviews/           
      │         ├── tour/           
      │         └── user/             # User model, controller, service
      ├── routes/             # Global Routes
      ├── helper/              # Utility Functions

```

## User Roles Overview

- **Admin** --> Manages everything.
- **Guide** --> Make tour listings. Accept/Decline bookings.
- **Tourist** --> Books a tour. Makes Payment.Confirms/Cancels the booking.Make reviews
