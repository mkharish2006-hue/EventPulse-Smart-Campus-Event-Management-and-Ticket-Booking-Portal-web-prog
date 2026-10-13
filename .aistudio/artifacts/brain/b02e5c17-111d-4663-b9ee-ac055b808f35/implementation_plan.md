# Role-Based Authentication & User Registration (Admin, Faculty, Student)

Implementation plan to introduce multi-tier authentication with predefined credentials for **Admin**, **Faculty**, and **Student (Harish M)**, alongside a complete **New User Sign-Up (Account Creation)** flow.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The exact login credentials and permissions agreed upon are:
> 1. **Admin Account**: Username `admin`, Password `admin` (Full access to revenue analytics, event CRUD, attendee management, system configs).
> 2. **Faculty Account**: Username `faculty`, Password `faculty123` (Permissions to create & edit department events, access attendee lists, and scan venue gate tickets).
> 3. **Student Account (Harish M)**: Username `harish` (or `Harish M` / `harish.m.2024.it@rajalakshmi.edu.in`), Password `Harish@2006` (Event browsing, ticket booking, pass viewing, cancellation).
> 4. **New User Registration**: Allows any new student, faculty member, or guest to create a personalized account with name, email, roll no/dept, and password, immediately saved to local storage.
> 5. **Authentication Access**: Integrated Login / Sign-Up modal accessible directly from the top navigation bar with 1-click Demo Account Autofill chips for quick grading and examiner presentations.

- **Confirmed Decision 1**: Default credentials for Admin (`admin`/`admin`), Faculty (`faculty`/`faculty123`), and Student (`harish`/`Harish@2006`).
- **Confirmed Decision 2**: Faculty role permissions for departmental event management and ticket gate scanning.
- **Confirmed Decision 3**: Quick 1-click credential autofill buttons on the login modal to streamline viva demonstrations.

---

## 1. Overview & Core Concept

This enhancement transforms the authentication layer into a robust, 3-tier Role-Based Access Control (RBAC) system:
- **Admin (`admin`)**: Institutional superuser with comprehensive control over all campus events, financial metrics, and user registries.
- **Faculty Coordinator (`faculty`)**: Academic event coordinator capable of proposing and publishing departmental workshops and symposiums and validating attendee passes at physical gates.
- **Student Attendee (`harish`)**: Student profile with personalized booking records, student discount eligibility (`REC2024`), and printable QR passes.
- **Guest / New Registrant (Sign-Up)**: Ability to register a new student or attendee account with persistent credentials.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Login Flow**:
   - User clicks the **"Sign In"** button in the top navigation bar.
   - An accessible modal opens with fields for Username / Email and Password.
   - Top banner provides three quick-fill buttons:
     - `[Admin] admin / admin`
     - `[Faculty] faculty / faculty123`
     - `[Student] harish / Harish@2006`
   - Clicking any quick-fill button automatically enters the credentials and authenticates the user into that persona.
   - On successful login, the top bar displays the user's role badge (`Admin`, `Faculty`, `Student`) and name, revealing role-specific navigation tabs.

2. **Sign-Up (Create Account) Flow**:
   - Inside the modal, user clicks the **"Create an Account"** tab.
   - Form inputs: Full Name, Email, Username, Password, Role (Student or Faculty), College / Department, and Roll Number (for students).
   - Validation checks for existing usernames/emails and enforces password strength.
   - On submission, user is registered, saved into persistent storage, and immediately logged in with their new profile.

3. **Role-Gated Navigation & Capabilities**:
   - **Admin**: Views `All Events`, `My Bookings`, `Organizer Admin` (Full CRUD + Total Revenue KPI + CSV Export), `PHP & API Lab`, `Viva & Report`.
   - **Faculty**: Views `All Events`, `My Bookings`, `Faculty Portal` (Department Events CRUD + Gate QR Scanner), `PHP & API Lab`, `Viva & Report`.
   - **Student / Registered Users**: Views `All Events`, `My Bookings` (Personal passes with QR code & countdowns), `PHP & API Lab`, `Viva & Report`.
   - **Sign Out**: Clean logout action that clears active session and returns to guest mode.

### Visual Identity & Theme

- Consistent with EventPulse's high-contrast dark slate theme (`slate-950` canvas, `slate-900` surfaces, `indigo-500` and `amber-500` accents).
- Single-line unboxed status text and clean typography (`Plus Jakarta Sans` and `JetBrains Mono`).
- Role pill-free indicators with subtle colored text markings (`Admin` in amber, `Faculty` in cyan, `Student` in indigo).

---

## 3. Technical Architecture & Data Strategy

### System Architecture & Authentication State

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION STORE                            │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Default Accounts:                                              │   │
│   │ 1. Admin:   id="admin-01", username="admin", role="admin"      │   │
│   │ 2. Faculty: id="fac-01",   username="faculty", role="faculty"  │   │
│   │ 3. Student: id="stud-01",  username="harish", role="student"   │   │
│   │                            name="Harish M"                     │   │
│   │ + Dynamic registered accounts from Sign-Up flow               │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ currentUser state (synced with localStorage 'eventpulse_user') │   │
│   │ - loggedIn: boolean                                            │   │
│   │ - role: 'admin' | 'faculty' | 'student'                        │   │
│   └───────────────┬───────────────────────────────┬────────────────┘   │
└───────────────────┼───────────────────────────────┼────────────────────┘
                    │                               │
        Role: admin │                   Role: faculty/student
                    ▼                               ▼
     ┌─────────────────────────────┐  ┌───────────────────────────────┐
     │ Full Admin Dashboard        │  │ Department Portal / Attendee  │
     │ - Revenue KPIs (INR)        │  │ - Gate Check-In Scanner       │
     │ - Global Event Delete/Edit  │  │ - Department Event Publishing │
     │ - CSV Export                │  │ - Personal Bookings           │
     └─────────────────────────────┘  └───────────────────────────────┘
```

### Updated PHP Auth Script & Schema

The underlying `server/api/auth.php` and `schema.sql` code in the API Workbench will also be synchronized to reflect the three roles (`ENUM('student', 'faculty', 'admin')`), demonstrating `password_verify()` with hashed passwords for `admin`, `faculty123`, and `Harish@2006`.

---

## 4. Implementation Steps

1. **Update User Types & Initial User Store**:
   - Extend `UserProfile` role type to `'student' | 'faculty' | 'admin'`.
   - Populate pre-configured users with credentials:
     * Admin: `username: 'admin'`, `password: 'admin'`
     * Faculty: `username: 'faculty'`, `password: 'faculty123'`
     * Student: `username: 'harish'`, `name: 'Harish M'`, `password: 'Harish@2006'`
   - Persist registered users in localStorage (`eventpulse_users_v2`).

2. **Build `AuthModal` Component**:
   - Tabbed interface: **Sign In** and **Create Account**.
   - 1-Click quick fill demo buttons for Admin, Faculty, and Harish M.
   - Comprehensive registration form with validation and instant session initialization.

3. **Update Top Navigation Bar (`Navbar.tsx`)**:
   - Display active user badge with their specific role.
   - Add **"Sign In"** / **"Sign Out"** button.
   - Role-aware navigation links (Admin Console vs Faculty Console vs Student Views).

4. **Update Portal Views & Role Protections**:
   - Faculty view gives access to Event creation, Event list, and Gate QR Scanner without global destructive permissions.
   - Update `PhpApiWorkbench.tsx` and `schema.sql` to show three-tier role architecture.
