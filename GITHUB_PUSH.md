# Push this project to GitHub

Your repo is initialized with one commit. Follow these steps to put it on GitHub.

## 1. Create a new repository on GitHub

1. Open **https://github.com/new**
2. **Repository name:** e.g. `learntube-curated` (or any name you like)
3. Leave it **empty** — do **not** add a README, .gitignore, or license
4. Click **Create repository**

## 2. Add the remote and push

Copy the **HTTPS** URL of your new repo (e.g. `https://github.com/YOUR_USERNAME/learntube-curated.git`), then run in this folder:

```bash
git remote add origin https://github.com/YOUR_USERNAME/learntube-curated.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `learntube-curated` with your GitHub username and repo name.

---

**Note:** `.env.local` is gitignored, so your owner password is not pushed. For Vercel, add `VITE_OWNER_PASSWORD` in Project → Settings → Environment Variables.
