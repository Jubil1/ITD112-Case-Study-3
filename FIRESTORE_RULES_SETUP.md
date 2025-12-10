# Firestore Security Rules Setup

After removing authentication, you need to update Firestore security rules to allow public read access.

## ⚡ Quick Fix (Recommended - Takes 2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **filipinoemigrantsdb-21c54**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the rules from `firestore.rules` file in this project
5. Click **Publish**
6. Refresh your dashboard - the error should be gone!

## 🔒 What Changed in Security Rules

**Before (Required Authentication):**

```javascript
allow read, write: if request.auth != null;
```

**After (Public Read Access):**

```javascript
// Allow public read access to emigrant data
match /emigrantData/{document=**} {
  allow read: if true;
  allow write: if false; // Protect data integrity
}
```

## 🛠️ Alternative: Deploy Using Firebase CLI

If you want to manage rules through code:

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not done)

```bash
firebase init firestore
```

- Select your project: **filipinoemigrantsdb-21c54**
- Accept default `firestore.rules` file (already created)
- Accept default `firestore.indexes.json` file

### 4. Deploy Rules

```bash
firebase deploy --only firestore:rules
```

## 📝 Security Notes

The new rules allow:

- ✅ **Public read** access to emigrant data (for dashboard charts)
- ✅ **Public write** access to uploadedCSVFiles (for CSV upload feature)
- ❌ **No access** to old users collection (no longer needed)
- ❌ **No direct writes** to emigrantData (data integrity protection)

## ⚠️ Important

Make sure to update the rules **immediately** to fix the "Missing or insufficient permissions" error on your dashboard.
