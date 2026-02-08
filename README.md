<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1K8mE4cCRP1flxMJKT4N-V-bsMCZ4-BPf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Add owner password in `.env.local`: `VITE_OWNER_PASSWORD="your-password"` — use double quotes and escape `$` and `@` if needed.
3. Run the app:
   `npm run dev`

## Owner access

Owner mode is protected by a password. Only a **SHA-256 hash** of the password is stored in the code — the real password never appears in the bundle, so it cannot be read from the deployed app. To set your own password:

1. Choose a strong password (e.g. 20+ characters, mixed case, numbers, symbols).
2. Generate its hash (run in terminal):  
   `node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"`
3. In `constants.tsx`, set `OWNER_PASSWORD_HASH` to the printed value.  
   Never commit the plain password. Use owner mode by visiting `#/owner` (e.g. `yoursite.com/#/owner`).
