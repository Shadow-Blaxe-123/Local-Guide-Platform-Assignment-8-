# 🗺️ Local Guide Platform

## 1. Project Overview

Local Guide Platform connects travelers with passionate local experts who can offer authentic, personalized experiences. Unlike generic tour agencies, this platform empowers individuals to share their city’s hidden gems, culture and stories. Travelers can find guides who match their interests whether for a food crawl, a photography walk or a historical tour and explore a destination like a local.

This project democratizes travel guiding, allowing locals to monetize their knowledge and travelers to access unique, off-the-beaten-path experiences.

## 2. Objectives

- Build a platform connecting travelers with local guides.
- Provide detailed profiles with reviews and verification to ensure trust.
- Implement a secure booking workflow.
- Create an engaging, friendly UI/UX for discovering experiences.

## 3. Core Features Breakdown

### 3.1 User Authentication & Roles

- **Roles**:
  - **Guide**: Can create tour listings and accept bookings.
  - **Admin**: Can manage users, tour listings and bookings.

### 3.5 Booking System

- **Booking Workflow**:
  - Guide accepts or declines.
  - Status updates: Pending, Confirmed, Completed, Cancelled.

### 3.6 Review & Rating System

- **Post-Tour**:
  - **Tourist**: Can rate and review guides after the tour.

### 3.7 Payment Integration

- **Booking Payments**:
  - Guide can receive payment after the tour.
  
### 🌐 API Endpoints

> **Note:** These are suggested API endpoints to implement core features. You must add, modify or remove endpoints as needed to support all functionality in your application.

| Method | Endpoint                | Description           |
| :----- | :---------------------- | :-------------------- |
| POST   | `/api/bookings`         | Request a booking     |
| PATCH  | `/api/bookings/:id`     | Accept/Reject booking |
| POST   | `/api/reviews`          | Submit a review       |
| POST   | `/api/payments/booking` | Pay for booking       |

### 2. Error Handling

- Backend errors should be gracefully caught and communicated to the frontend.

---

## 🛠️ Technology Stack

| Category       | Technologies            |
| :------------- | :---------------------- |
| **Deployment** | Vercel, Render, Railway |

---

## 📤 Submission Guidelines

### 1. Codebase & Documentation

**README.md**: Must be professional and include:

- Project Name & Live URL.
- Features & Technology Stack.
- Setup & Usage Instructions.

### 2. Video Walkthrough

- **Duration**: 10-15 minutes.
- **Language**: English (recommended) or Bengali.
- **Platform**: Google Drive (ensure public access).
- **Content**: Demonstrate key features and workflow.

### 3. What You Need to Provide

- GitHub Repository Link
- Live Deployment Link
- Video Explanation (Public Link)
- Admin or other necessary credentials (If you don't provide, you will get zero marks)

#### 📝 Example Submission Format

```bash
GitHub Client Repo: Your GitHub Client Repo Link
GitHub Server Repo: Your GitHub Server Repo Link

Client Live Deployment: Your Client Live Deployment Link
Server Live Deployment: Your Server Live Deployment Link

Video Explanation: Your Video Explanation Link

Admin Credentials:
Email: Your Admin Email
Password: Your Admin Password
```

---

## 🎓 Assignment Distribution & Deadlines

### ⏰ Deadline

- December 09, 2025, at 11:59 PM
