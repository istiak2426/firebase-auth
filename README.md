# SyncSphere - Cloud Workspace

A modern real-time personal workspace with Google Firebase Authentication, instant Firestore syncing, smart notes, task management, and offline support.

---

## 🚀 Running Locally on Your PC

### Prerequisites
- **Node.js**: Version 18.x or higher (recommended: Node 20 LTS or Node 22)
- **Package Manager**: `npm` (bundled with Node), `bun`, or `pnpm`

---

### Step 1: Download or Clone the Project
Make sure all project files are in a local folder on your computer:
```bash
cd /path/to/syncsphere
```

Ensure the following files are in the root directory:
- `firebase-applet-config.json` (contains the Firebase project credentials)
- `package.json`
- `vite.config.ts`
- `src/` directory

---

### Step 2: Install Dependencies
Open your terminal inside the project directory and run:

```bash
npm install
```

> **Tip**: If your local `npm` version flags a peer dependency conflict, run:
> ```bash
> npm install --legacy-peer-deps
> ```

---

### Step 3: Start the Local Development Server
Run the dev script:

```bash
npm run dev
```

Your terminal will display:
```
  VITE v8.3.0  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<your-ip>:3000/
```

Open **`http://localhost:3000`** in your browser.

---

## 🔑 Firebase Google Sign-In on Localhost

The app is already pre-configured to connect to your Firebase project via `firebase-applet-config.json`.

When running on `http://localhost:3000`:
1. Click **Google Sign-In** in the top right.
2. Sign in with your Google account.
3. Your notes and tasks will sync live to Firestore in real-time.

> **Note on Firebase Authorized Domains**:
> `localhost` is authorized by default in standard Firebase projects. If you encounter an `auth/unauthorized-domain` error when clicking Google Sign-In locally:
> 1. Go to the [Firebase Console](https://console.firebase.google.com/).
> 2. Open your project (`gen-lang-client-0288594606`).
> 3. Navigate to **Authentication** > **Settings** > **Authorized domains**.
> 4. Ensure `localhost` is listed.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deploying to Vercel

The repository is already configured with `vercel.json` for single-page application routing.

### Option A: Via GitHub & Vercel Dashboard (Recommended)
1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com/) and click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

### ⚠️ Crucial Step for Google Sign-In on Vercel:
Once deployed, Vercel gives you a URL like `https://your-app-name.vercel.app`:
1. Copy your Vercel URL domain (e.g. `your-app-name.vercel.app`).
2. Go to [Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0288594606/authentication/settings).
3. Under **Authentication** > **Settings** > **Authorized domains**, click **Add domain**.
4. Paste your Vercel domain (`your-app-name.vercel.app`) and click **Save**.
5. Google Sign-In is now live on your production Vercel site!

---

## 🛠 Features
- **Real-Time Cloud Sync**: Uses Firestore snapshot listeners for instant updates without page refreshes.
- **Google Identity Authentication**: Secure user login with profile pictures and verified accounts.
- **Smart Cloud Notes**: Pinned notes, category folders, customizable accent colors, markdown support, tag indexing, and copy-to-clipboard.
- **Action Tasks Kanban**: To Do, In Progress, and Completed columns with priority levels (High, Medium, Low) and due dates.
- **Offline / Local Sandbox**: Create and test notes even while signed out or offline, with local storage caching and one-click cloud migration.
- **Data Portability**: Instant one-click JSON backup export.
