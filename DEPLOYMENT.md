# Deployment Guide: E-Waste Management System

This guide walks you through hosting the project for **free** using:

- **MongoDB Atlas** – cloud database  
- **Render** – backend (Express API)  
- **Vercel** – frontend (React/Vite)  

You can do the steps in this order. After each step, note any URLs or values you create; you’ll need them later.

---

## Prerequisites

- GitHub repository with your code pushed
- Accounts (free):
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
  - [Render](https://render.com/register)
  - [Vercel](https://vercel.com/signup) (GitHub login is easiest)

---

## 1. MongoDB Atlas (Database)

1. **Log in** at [cloud.mongodb.com](https://cloud.mongodb.com).

2. **Create a cluster** (if you don’t have one):
   - Click **Build a Database** → choose **M0 FREE** → **Create**.

3. **Create a database user**:
   - Security → **Database Access** → **Add New Database User**.
   - Choose **Password** and set a username/password. Save them.
   - Database User Privileges: **Atlas admin** (or **Read and write to any database**).
   - **Add User**.

4. **Network access** (so Render can connect):
   - Security → **Network Access** → **Add IP Address**.
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`).
   - **Confirm**.

5. **Get the connection string**:
   - **Database** → **Connect** on your cluster.
   - **Connect your application** → copy the URI.
   - It looks like:  
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your DB user.  
   - For your app database, add the database name before `?`:  
     `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ewaste?retryWrites=true&w=majority`  
     (use any name you like instead of `ewaste`).

Save this as your **MONGO_URI**; you’ll use it on Render.

---

## 2. Render (Backend / API)

1. **Log in** at [render.com](https://render.com) and connect your **GitHub** account if asked.

2. **New Web Service**:
   - Dashboard → **New +** → **Web Service**.

3. **Connect repository**:
   - Select your GitHub repo.
   - If it’s a monorepo (client + server in one repo), you’ll set the **Root Directory** in the next step.

4. **Configure the service**:
   - **Name**: e.g. `ewaste-api` (or any name).
   - **Region**: Choose the closest to your users.
   - **Root Directory**: `server`  
     (so Render only builds/runs the Express app).
   - **Runtime**: **Node**.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**.

5. **Environment variables** (Environment tab):
   - **MONGO_URI** = your Atlas connection string from step 1.
   - **JWT_SECRET** = a long random string (e.g. generate one at [randomkeygen.com](https://randomkeygen.com/)).
   - **FRONTEND_URL** = leave empty for now; you’ll set it after deploying the frontend (your Vercel URL, e.g. `https://your-app.vercel.app`).

   Render sets **PORT** automatically; your app already uses `process.env.PORT`, so no need to add it.

6. **Create Web Service**. Wait for the first deploy to finish.

7. **Copy your backend URL**  
   It will look like: `https://ewaste-api.onrender.com` (or similar).  
   This is your **API URL**; you’ll use it in Vercel and in **FRONTEND_URL** on Render.

8. **After Vercel is done** (Section 3):
   - Render → your service → **Environment**.
   - Set **FRONTEND_URL** = your Vercel app URL (e.g. `https://your-app.vercel.app`) — no trailing slash.
   - Save. Render will redeploy. This allows your frontend origin in CORS so the browser can call the API.

---

## 3. Vercel (Frontend)

1. **Log in** at [vercel.com](https://vercel.com) with **GitHub**.

2. **Import project**:
   - **Add New** → **Project**.
   - Import the same GitHub repo.

3. **Configure project**:
   - **Root Directory**: click **Edit** → set to `client` (so Vercel only builds the React app).
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment variable**:
   - **Key**: `VITE_API_URL`  
   - **Value**: your Render API URL + `/api`, e.g. `https://ewaste-api.onrender.com/api`  
   - No trailing slash.

5. **Deploy**. When it’s done, copy your frontend URL (e.g. `https://your-project.vercel.app`).

6. **Go back to Render** and set **FRONTEND_URL** to that Vercel URL (see step 8 in Section 2).

---

## 4. CORS and credentials (what’s already in the project)

The backend is configured to allow only your frontend and to send cookies/credentials:

```js
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

- **FRONTEND_URL** on Render = your Vercel URL.  
  You can change it anytime in Render’s Environment tab; no need to push to GitHub.
- **credentials: true** allows the browser to send auth cookies/headers with requests.

The client uses **withCredentials: true** and **VITE_API_URL** so in production it talks to your Render API. Locally it still uses `http://localhost:5000/api` when **VITE_API_URL** is not set.

---

## 5. Quick reference

| Where        | Variable        | Example / purpose                          |
|-------------|-----------------|--------------------------------------------|
| **Render**  | MONGO_URI       | Atlas connection string                    |
| **Render**  | JWT_SECRET      | Long random string for JWT signing         |
| **Render**  | FRONTEND_URL    | `https://your-app.vercel.app` (Vercel URL) |
| **Vercel**  | VITE_API_URL    | `https://ewaste-api.onrender.com/api`      |

---

## 6. Optional: seed data and free-tier limits

- **Render free tier**: the service may spin down after ~15 minutes of no traffic. The first request after that can be slow (cold start).
- To seed the database (e.g. test users), you can run the seed script once from your machine with **MONGO_URI** set to your Atlas URI, or add a one-off deploy step/script if you prefer.
- **Vercel**: free tier is usually enough for a small project; check [Vercel limits](https://vercel.com/docs/limits) if you grow.

---

## 7. Troubleshooting

- **CORS errors in browser**  
  - Ensure **FRONTEND_URL** on Render exactly matches your Vercel URL (no trailing slash).  
  - Redeploy the Render service after changing env vars.

- **API not reachable / 503**  
  - On Render free tier, wait 30–60 seconds on first request after idle.  
  - Check Render **Logs** for crashes or wrong **MONGO_URI**.

- **Frontend can’t reach API**  
  - Confirm **VITE_API_URL** on Vercel is `https://your-render-app.onrender.com/api`.  
  - Redeploy the Vercel project after changing env vars (Vite bakes `VITE_*` into the build).

- **MongoDB connection failed**  
  - Check **MONGO_URI** (correct user, password, DB name).  
  - In Atlas, ensure **Network Access** allows `0.0.0.0/0` (or add Render’s IPs if you restrict later).

Once **FRONTEND_URL** and **VITE_API_URL** are set correctly and both apps are deployed, the site should work end-to-end. If you add a custom domain later, update **FRONTEND_URL** on Render and **VITE_API_URL** on Vercel if the API URL changes.
