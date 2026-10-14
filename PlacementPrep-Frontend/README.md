# PlacementPrep Frontend

A modern React + Vite frontend for the PlacementPrep Smart Placement Preparation & Career Tracking Platform.

## Run in VS Code

1. Install Java 17 or newer, start MySQL, and make sure the `placementprep` database and credentials in the backend's `src/main/resources/application.properties` are configured.
2. Open `placementprep-backend/placementprep-backend` in a terminal and run:
   `.\mvnw.cmd spring-boot:run`
3. Open `PlacementPrep-Frontend` in a second terminal and run:
   `npm install`
4. Start the frontend:
   `npm run dev`
5. Open the localhost URL shown by Vite (usually `http://localhost:5173`). Vite forwards `/api` requests to `http://localhost:8080`.

Sign in or create an account from the landing screen. The JWT session is stored in browser local storage and attached automatically to authenticated API requests. Set `VITE_BACKEND_URL` before starting Vite to change the dev proxy target. For a deployment without the Vite proxy, set `VITE_API_BASE_URL` to the backend API base URL (including `/api`).

## Included screens

- Dashboard
- My Profile
- Practice Questions
- Mock Tests
- Interview Preparation
- Company Resources
- My Progress
- Registration and login via the Spring Boot API
- Practice questions loaded from the authenticated Spring Boot API
