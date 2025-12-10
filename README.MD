# Filipino Emigrants Dashboard

A comprehensive data visualization dashboard for analyzing Filipino emigrant data across different dimensions including destinations, origins, demographics, and trends over time.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. **IMPORTANT: Update Firestore Rules**

The dashboard requires public read access to Firestore. Follow these steps:

#### Option A: Firebase Console (Fastest - 2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **filipinoemigrantsdb-21c54**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the rules from `firestore.rules` file in this project
5. Click **Publish**

#### Option B: Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

See `FIRESTORE_RULES_SETUP.md` for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## 📊 Features

- **Geographic Visualization**: Interactive choropleth maps showing emigrant distribution
- **Comparison Charts**: Compare emigrant data across different categories
- **Composition Analysis**: View data composition and proportions
- **Trend Analysis**: Analyze emigration trends over time
- **Distribution Charts**: Visualize data distribution patterns
- **Relationship Analysis**: Explore correlations and relationships
- **CSV Upload**: Upload new data to Firebase

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS 4
- **Charts**: Nivo Charts
- **Database**: Firebase Firestore
- **Icons**: React Icons

## 📁 Project Structure

```
src/
├── api/              # Firebase service layer
├── components/       # Reusable UI components
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── routes/           # Route components
└── utils/            # Utility functions
```

## 🔥 Firebase Configuration

The project uses Firebase for:

- **Firestore**: Data storage and retrieval
- No authentication required (public access)

## 📝 Data Upload

Navigate to `/upload` to upload CSV files. The system supports:

- Destination countries data
- Origin provinces data
- Age group data
- Gender distribution data
- Education level data
- Civil status data

## 🚨 Troubleshooting

### "Missing or insufficient permissions" Error

This means Firestore security rules haven't been updated. Follow the Firestore setup steps above.

### Charts Not Loading

1. Check browser console for errors
2. Verify Firebase configuration in `src/firebase.ts`
3. Ensure Firestore has data in the correct collections

## 📦 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests

## 🌐 Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure Firestore rules are published

## 📄 License

Private project
