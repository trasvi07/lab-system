Patient-Centric Laboratory Management System

A full-stack web app I built to manage lab test bookings, sample tracking, and report generation — basically digitizing the whole workflow of a diagnostic lab so patients, lab staff, and admins don't have to rely on paper registers and phone calls.

I built this to get hands-on with full-stack development beyond tutorials — real auth, real role-based permissions, and a schema that actually needs some thought instead of just one flat table.

What it does


Patients can book lab tests online instead of calling/visiting in person
Lab staff can update test status in real time (pending → in progress → completed)
Reports get auto-classified as Normal / High / Low based on test values
Admins get a dashboard to oversee bookings, staff, and reports across the system
Everything is role-gated — a patient can't see another patient's reports, staff can't access admin settings, etc.


Tech stack

Frontend: React
Backend: Node.js, Express.js
Database: MongoDB (with Mongoose for schemas)
Auth: JWT (JSON Web Tokens) with role-based access control

Why I made some of the choices I did


MongoDB over SQL — the data (bookings, test results, reports) is naturally nested and varies a bit between test types, so a document-based DB made schema design more flexible than forcing everything into rigid relational tables.
JWT instead of sessions — wanted the backend to stay stateless, so I didn't need a session store; the token itself carries the user's role, and every protected route just checks that.
Referencing vs embedding — I used references for things like Users → Bookings (since users have many bookings and I don't want to duplicate user data everywhere), but embedded smaller sub-data directly into documents where it made sense.


Project structure

├── client/            # React frontend
│   ├── components/
│   ├── pages/
│   └── ...
├── server/            # Express backend
│   ├── models/        # Mongoose schemas (User, Booking, Test, Report)
│   ├── routes/        # API endpoints
│   ├── middleware/     # JWT auth + role-checking middleware
│   └── controllers/
└── README.md

Running it locally


Clone the repo


bash   git clone https://github.com/YOUR_USERNAME/lab-management-system.git
   cd lab-management-system


Install dependencies for both frontend and backend


bash   cd server && npm install
   cd ../client && npm install


Add a .env file in /server with:


   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000


Run the backend


bash   cd server && npm start


Run the frontend (separate terminal)


bash   cd client && npm start


App should be running at http://localhost:3000, backend at http://localhost:5000


What I learned building this

This was my first time properly implementing role-based access control instead of just "logged in / not logged in" — figuring out how to structure middleware so it checks roles cleanly without repeating logic everywhere took a few iterations. Also spent a good amount of time getting the MongoDB schema design right, especially deciding what to reference vs embed.

What I'd add if I kept working on it


Email/SMS notifications when a report is ready
Search/filter on the admin dashboard for large numbers of bookings
Unit tests (currently tested manually, which doesn't scale well)
