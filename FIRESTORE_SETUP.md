# Firestore Setup

The app runs locally with SQLite by default. Firestore sync is optional for future production login/data storage.

## Environment Variables

Create `backend/.env` or set these variables in your hosting dashboard:

```text
FIRESTORE_ENABLED=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_API_SECRET=choose-a-secret-for-admin-sync
```

The backend mirrors products, users, orders, payments, reviews, and CRM notes to Firestore when credentials are present.

## Admin Sync Endpoint

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/firestore/sync -Headers @{ "x-admin-secret" = "your-secret" }
```

## Rules

Upload `firestore.rules` in Firebase Console or with Firebase CLI. Admin/owner users can manage product, order, payment, review, and CRM data. Normal users can only access their own user/order/review documents.
