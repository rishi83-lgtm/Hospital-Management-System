# Hospital Management System

MedCare is a JavaScript hospital-management starter with a React dashboard matching the supplied TSX reference, a Tailwind UI, and an Express/MongoDB API.

## Technology

- Frontend: React 18, JSX, Vite, Tailwind CSS, lucide-react, Recharts
- Backend: Node.js ES modules, Express, MongoDB/Mongoose, JWT

The supplied `.tsx` reference uses JavaScript with JSX syntax (it does not use TypeScript types), so this project uses `.jsx` and `.js` files.

## Create the first administrator

Public registration only creates patient accounts. Create the first administrator once from the server directory. Set credentials in the current PowerShell session; choose a unique email and a strong password of at least 12 characters:

```powershell
cd server
$env:ADMIN_NAME = "Hospital Administrator"
$env:ADMIN_EMAIL = "admin@your-hospital.example"
$env:ADMIN_PASSWORD = Read-Host "Choose a strong administrator password"
npm run create-admin
Remove-Item Env:ADMIN_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

The command creates an administrator and seeds the standard departments. It refuses to overwrite an existing account. Keep the administrator password private.

## Run locally

1. Install Node.js 18 or newer and MongoDB.
2. In `server/.env`, set `MONGODB_URI`, `CLIENT_ORIGINS`, and a private `JWT_SECRET` with at least 32 characters. Never commit production secrets.
3. Create the first administrator as described above.
4. Start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

5. In another terminal, start the React app:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

6. Open the local URL printed by Vite (normally `http://localhost:5173`). Staff and patients sign in with their own accounts; patients can also register from the login screen. Vite proxies `/api` to the backend.

## Working features

- Patient registration, login, session restore, and logout
- Admin management of doctor, receptionist, and patient accounts
- Department creation and database-backed staff/patient/appointment lists
- Patient appointment booking and cancellation
- Reception/admin scheduling; staff appointment confirmation and completion
- Doctor appointment queue, prescription creation, and saved availability
- Role-scoped prescriptions and patient records

Protected API routes require a valid JWT bearer token. Public registration cannot choose or elevate account roles. Admin accounts are bootstrapped through the one-time CLI command rather than a public endpoint.
