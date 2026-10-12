# CampusFind - College Discovery & Decision-Making Platform

> **"Find the right college. Compare smarter. Choose confidently."**

CampusFind is a college discovery, comparison, and admission prediction platform designed specifically for students appearing for **Telangana State (TS EAMCET / TG EAPCET)** and **Andhra Pradesh State (AP EAMCET / AP EAPCET)** engineering and university admissions.

---

## 🌟 Key Features

1. **State-Focused College Directory (TS & AP)**
   - Over **57 premier universities and engineering colleges** across Telangana and Andhra Pradesh, with verified state counselling codes (`CBIT`, `OUCE`, `JNTH`, `VASV`, `VNRV`, `AUCE`, `SVUCE`, `JNTK`, `GVPV`, `VRSE`, etc.).
   - Covers government state universities, autonomous institutions, national institutes (IIT Hyderabad, NIT Warangal, IIIT Hyderabad), and deemed universities.

2. **Advanced Database-Backed Discovery & Filters**
   - Dynamic search by college name, counselling code, city, and state.
   - Comprehensive filters: State (Telangana / Andhra Pradesh), City, Branch (`CSE`, `AI & ML`, `Data Science`, `IT`, `ECE`, `EEE`, `Mechanical`, `Civil`), College Ownership (Government / Private), Type (Autonomous, University), Maximum Fee slider, Minimum Rating, and Accepted Exams.
   - Deep-linked URL query parameters for shareable and bookmarkable filtered views.

3. **In-Depth College Profiles**
   - **Overview:** Campus acreage, establishment year, affiliation, NAAC accreditation grade, NIRF rankings, and infrastructure facilities.
   - **Courses & Seats:** Branch codes, sanctioned intake, degree, duration, and eligibility criteria.
   - **Fee Breakdown:** Convener quota fees (Category A - 70% seats) vs Management quota fees (Category B - 30% seats).
   - **Verified Placements:** Average package, highest salary, placement percentage, and prominent recruiting firms.
   - **Student Reviews:** Ratings, pros, cons, verified badges, and an interactive review submission form.
   - **Cutoffs History:** Comprehensive opening and closing ranks by category and round.

4. **Interactive Multi-College Comparison (2–3 Colleges)**
   - Persistent bottom comparison tray accessible across cards and profiles.
   - Side-by-side comparative matrix evaluating fees, ratings, placements, courses, accreditations, and accepted exams.
   - Automated intelligent badge highlights for lowest fees, highest average packages, and top ratings.

5. **EAMCET Rank Predictor Engine**
   - Transparent rule-based algorithm evaluating candidate rank against historical opening and closing ranks.
   - Categorizes probability into:
     - 🟢 **Excellent Chance** (Rank comfortably within opening rank bracket)
     - 🔵 **Good Chance** (Rank within opening and closing rank range)
     - 🟡 **Possible** (Slightly above closing rank; viable in Round 2 or sliding rounds)
     - ⚪ **Low Chance** (Ambitious / reach preferences)
   - Supports reservation categories: `OC-General`, `OC-Girls`, `EWS`, `BC-A`, `BC-B`, `BC-D`, `SC`, `ST`.

6. **Secure User Authentication & Shortlists**
   - Registration with email verification and password confirmation.
   - Secure password hashing with `bcryptjs` and stateless session management with JWT tokens.
   - Real-time bookmarking for anonymous visitors with automatic synchronization upon account login.

---

## 🛠 Tech Stack & Architecture

- **Frontend:**
  - React 19 + TypeScript
  - Vite 8
  - Tailwind CSS 4
  - React Router DOM 7
  - Lucide Icons
  - Plus Jakarta Sans typography

- **Backend:**
  - Node.js + Express.js
  - RESTful APIs with structured request logging
  - Zod validation for payloads and query parameters
  - JWT token authentication & Bcrypt password hashing
  - Centralized error handling

- **Database:**
  - Embedded PostgreSQL engine (`@electric-sql/pglite`) with ACID compliance, indexes, relational foreign keys, and persistent storage.

---

## 🗄 Database Entities

- `users`: User profiles, email unique constraint, bcrypt password hashes.
- `colleges`: Master institution details, counselling codes, fees, ratings, and accreditations.
- `courses`: Engineering branch offerings, degree, duration, sanctioned intake, and annual fees.
- `college_exams`: Entrance exams accepted per college (e.g. `TS EAMCET`, `AP EAMCET`, `JEE Main`).
- `cutoffs`: Historical opening and closing ranks across exams, branches, and reservation quotas (3,400+ entries).
- `placements`: Placement rates, median/highest packages, and corporate recruiters.
- `reviews`: Verified student reviews with star ratings, pros, and cons.
- `saved_colleges`: Relational bookmarks with composite unique constraint `(user_id, college_id)`.
- `comparisons`: Multi-college comparison session history.

---

## 🚀 REST API Endpoints

### Authentication
- `POST /api/auth/register` - Create account (validates name, email, password match)
- `POST /api/auth/login` - Login with credentials, returns JWT token
- `GET /api/auth/me` - Get authenticated user profile and stats

### Colleges
- `GET /api/colleges` - Paginated search and multi-facet filtering
- `GET /api/colleges/locations` - Cities and states with college counts
- `GET /api/colleges/popular` - Top ranked institutions
- `GET /api/colleges/:id` - Full college profile
- `GET /api/colleges/:id/courses` - Branches and seats
- `GET /api/colleges/:id/placements` - Placement records and recruiters
- `GET /api/colleges/:id/reviews` - Verified reviews and star distribution
- `POST /api/colleges/:id/reviews` - Post a student review
- `GET /api/colleges/:id/cutoffs` - Cutoff history

### Comparisons
- `POST /api/comparisons` - Compare 2–3 colleges with highlights

### Saved Colleges
- `GET /api/saved-colleges` - Fetch user's shortlisted colleges
- `POST /api/saved-colleges` - Save college to shortlist
- `DELETE /api/saved-colleges/:collegeId` - Remove college from shortlist
- `POST /api/saved-colleges/sync` - Sync anonymous local storage shortlist

### Predictor
- `GET /api/predictor/exams` - Entrance exams and reservation categories
- `POST /api/predictor` - Predict admission chances by rank, category, and preferences

---

## 💻 Local Setup & Running

```bash
# 1. Clone repository
git clone <repo-url>
cd campusfind

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Run automated test suite
npm test

# 5. Start Full-Stack Dev Server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📊 Predictor Scoring Algorithm

For any input rank $R$, opening rank $O$, and closing rank $C$:

$$\text{Chance} = \begin{cases} 
\text{Excellent Chance}, & R \le O \\
\text{Good Chance}, & O < R \le C \\
\text{Possible (Round 2)}, & C < R \le C \times 1.18 \\
\text{Low Chance (Reach)}, & R > C \times 1.18 
\end{cases}$$

The match score is refined with bonus weightings for candidate location and preferred engineering branches.

---

## 🛡 Disclaimer

*Demo dataset for evaluation purposes. Admission cutoffs, fees, and placement figures should be verified with the respective institution or official TSCHE / APSCHE counselling portals.*
