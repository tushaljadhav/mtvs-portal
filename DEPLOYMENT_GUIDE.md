# MTVS Portal – Free Deployment & Go-Live Guide
*मुंबई विडी तंबाखू संघ (MTVS) अधिकृत पोर्टल*

Ye guide aapko pura project **100% FREE** me internet par live karne ke steps batati hai.

---

## Step 1: Free Cloud Database Banayein (TiDB Cloud - 25 GB Free Forever)

1. [https://tidbcloud.com](https://tidbcloud.com) par jayein aur Google account se **Sign In** karein.
2. **"Create Cluster"** par click karein aur **"Serverless" (Free)** select karein.
3. Region me **Asia/Mumbai** ya **Singapore** select karein.
4. Cluster create hone ke baad **"Connect"** button par click karein.
5. Waha se apne credentials note karein:
   - **Host**: `gateway01.ap-south-1.prod.aws.tidbcloud.com` (example)
   - **Port**: `4000`
   - **User**: `xxxxxx.root`
   - **Password**: Aapka set kiya hua password
   - **Database**: `mtvs`

---

## Step 2: Database me Tables Initialize Karein (1-Click)

Aapne jo credentials mile hain, unhe apne local computer ke `backend/.env` me temporaily daalein aur ye command chalayein:

```bash
node backend/setup_db.js
```
Ye command cloud database me saare 5 tables (`admins`, `requests`, `regions`, `areas`, `advertisements`) aur initial areas/admin account auto-create kar degi!

---

## Step 3: Project ko GitHub par Push Karein

1. Git init aur commit karein:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for MTVS portal"
   ```
2. GitHub par naya repository banayein (e.g. `mtvs-portal`).
3. Push karein:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mtvs-portal.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 4: Free Web Hosting (Render.com par 100% Free Live)

1. [https://render.com](https://render.com) par jayein aur GitHub se login karein.
2. **New +** ➔ **Web Service** par click karein.
3. Apna GitHub repo `mtvs-portal` select karein.
4. Settings me ye daalein:
   - **Name**: `mtvs-portal`
   - **Region**: Singapore ya Frankfurt
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run postinstall && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** add karein:
   - `DB_HOST`: TiDB ka Host
   - `DB_PORT`: `4000`
   - `DB_USER`: TiDB ka User
   - `DB_PASSWORD`: TiDB ka Password
   - `DB_NAME`: `mtvs`
   - `DB_SSL`: `true`
   - `JWT_SECRET`: koi bhi 32 character ka secret string (e.g. `mtvs_jwt_secret_key_prod_2026_super_secure`)
   - `PORT`: `4000`
6. **"Deploy Web Service"** par click karein!

Kuch hi minute me aapka portal ek free live URL par chal padega:
`https://mtvs-portal.onrender.com`

---

## Step 5: Custom Domain Link Karein (Optional)

Agar aapke paas domain hai (jaise `mtvs.in` ya `mumbaividisangh.com`):
1. Render dashboard me **Settings** ➔ **Custom Domains** me jayein.
2. Apna domain add karein aur DNS records (CNAME) update karein.
3. Render automatic free **SSL (HTTPS)** certificate provide karta hai.

---

### Admin Login Credentials (Default):
- **Email**: `admin@mtvs.in`
- **Password**: `Admin@1234`
*(Production me login karne ke baad Settings tab se password zaroor change kar lein)*

