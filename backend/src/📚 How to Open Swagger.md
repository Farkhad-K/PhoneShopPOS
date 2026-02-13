📚 How to Open Swagger

  1. Start the backend (if not already running):
  npm run start:dev
  2. Open Swagger in your browser:
  http://localhost:5000/api/docs
  3. Login with Basic Auth credentials:
    - Username: admin
    - Password: super-secure-password
  4. To use protected endpoints (after login form):
    - Click the "Authorize" button (🔓 icon at top right)
    - Enter: Bearer <your-jwt-token>
    - You'll get the JWT token after logging in via the /auth/login endpoint

 Background command "Start NestJS development server" was stopped

● Task "Start NestJS server with hot-reload" stopped

● Task "Wait for server to restart" stopped

✶ Testing Phase 2 flow…
  ⎿  ◼ Seed Phase 2 data and test complete flow
     ◻ Implement phone lifecycle management
     ✔ Create Phone entity with status lifecycle
     ✔ Create Purchase entity and module
     ✔ Create Repair entity and module
     ✔ Create Sale entity and module
     ✔ Implement barcode generation for phones
     ✔ Create Phone CRUD module with search