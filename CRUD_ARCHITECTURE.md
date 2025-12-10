# CRUD Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                     (React + TypeScript)                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN DASHBOARD                              │
│                    (src/routes/index.tsx)                        │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Geographic │  │ Comparison │  │   Trends   │  │   More   │ │
│  │   Charts   │  │   Charts   │  │   Charts   │  │  Charts  │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│                                                                   │
│  ┌────────────┐  ┌────────────────────────────────────────────┐│
│  │   Upload   │  │     DATA MANAGEMENT (CRUD) ⬅️ NEW         ││
│  │   CSV      │  │     Create, Read, Update, Delete           ││
│  └────────────┘  └────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CRUD PAGE COMPONENT                         │
│                    (src/routes/crud.tsx)                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Collection Selector                                       │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ ▼ Destination Countries | Age | Sex | Education ... │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Data Table (Read)                                         │ │
│  │  ┌──────┬────────┬────────┬────────┬─────────────────┐  │ │
│  │  │ Year │ Cat 1  │ Cat 2  │ Cat 3  │ Actions         │  │ │
│  │  ├──────┼────────┼────────┼────────┼─────────────────┤  │ │
│  │  │ 2024 │ 45000  │ 32000  │ 12000  │ [Edit] [Delete] │  │ │
│  │  │ 2023 │ 42000  │ 30000  │ 11500  │ [Edit] [Delete] │  │ │
│  │  └──────┴────────┴────────┴────────┴─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Modal Windows                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Create    │  │    Edit     │  │   Delete    │     │ │
│  │  │   Modal     │  │   Modal     │  │   Confirm   │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER                           │
│                    (src/api/baseService.ts)                      │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  getAllData │  │postDataTo   │  │updateDataBy │           │
│  │     ()      │  │ Firestore() │  │  Year()     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │deleteDataBy │  │getCategories│                             │
│  │  Year()     │  │    ()       │                             │
│  └─────────────┘  └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE FIRESTORE                          │
│                                                                   │
│  emigrantData_destination/          emigrantData_age/           │
│  ├── 2020/                          ├── 2020/                   │
│  ├── 2021/                          ├── 2021/                   │
│  └── 2022/                          └── 2022/                   │
│                                                                   │
│  emigrantData_sex/                  emigrantData_civilStatus/   │
│  ├── 2020/                          ├── 2020/                   │
│  └── 2021/                          └── 2021/                   │
│                                                                   │
│  emigrantData_education/            emigrantData_occupation/    │
│  emigrantData_province/                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. CREATE Operation

```
User Action                    Component State              Firebase
    │                               │                          │
    │ Click "Create"                │                          │
    ├──────────────────────────────>│                          │
    │                               │ Open Modal               │
    │                               │                          │
    │ Enter Year & Fields           │                          │
    ├──────────────────────────────>│ Update formData          │
    │                               │                          │
    │ Click "Create Record"         │                          │
    ├──────────────────────────────>│ Validate Data            │
    │                               │ Check Duplicates         │
    │                               │                          │
    │                               │ postDataToFirestore()    │
    │                               ├─────────────────────────>│
    │                               │                          │ Write Document
    │                               │<─────────────────────────┤
    │                               │ Success Response         │
    │<──────────────────────────────┤                          │
    │ Show Success Message          │ Close Modal              │
    │                               │ Reload Data              │
```

### 2. READ Operation

```
User Action                    Component State              Firebase
    │                               │                          │
    │ Select Collection             │                          │
    ├──────────────────────────────>│                          │
    │                               │ getAllData()             │
    │                               ├─────────────────────────>│
    │                               │                          │ Query Collection
    │                               │<─────────────────────────┤
    │                               │ Data Array               │
    │<──────────────────────────────┤                          │
    │ Display Table                 │ setData(result)          │
    │                               │ setLoading(false)        │
```

### 3. UPDATE Operation

```
User Action                    Component State              Firebase
    │                               │                          │
    │ Click "Edit" on Row           │                          │
    ├──────────────────────────────>│                          │
    │                               │ Open Modal               │
    │                               │ Pre-fill Form            │
    │                               │                          │
    │ Modify Values                 │                          │
    ├──────────────────────────────>│ Update formData          │
    │                               │                          │
    │ Click "Update Record"         │                          │
    ├──────────────────────────────>│ Validate Changes         │
    │                               │                          │
    │                               │ updateDataByYear()       │
    │                               ├─────────────────────────>│
    │                               │                          │ Merge Update
    │                               │<─────────────────────────┤
    │                               │ Success Response         │
    │<──────────────────────────────┤                          │
    │ Show Success Message          │ Close Modal              │
    │                               │ Reload Data              │
```

### 4. DELETE Operation

```
User Action                    Component State              Firebase
    │                               │                          │
    │ Click "Delete" on Row         │                          │
    ├──────────────────────────────>│                          │
    │                               │ Open Confirm Modal       │
    │                               │                          │
    │ Click "Delete Record"         │                          │
    ├──────────────────────────────>│ deleteDataByYear()       │
    │                               ├─────────────────────────>│
    │                               │                          │ Delete Document
    │                               │<─────────────────────────┤
    │                               │ Success Response         │
    │<──────────────────────────────┤                          │
    │ Show Success Message          │ Close Modal              │
    │                               │ Reload Data              │
```

---

## Component Structure

```
CRUDPage Component
│
├── State Management
│   ├── selectedCollection (DataCollection)
│   ├── data (DataRow[])
│   ├── categories (string[])
│   ├── loading (boolean)
│   ├── error (string)
│   ├── success (string)
│   ├── showCreateModal (boolean)
│   ├── showEditModal (boolean)
│   ├── showDeleteModal (boolean)
│   ├── selectedRow (DataRow | null)
│   ├── formYear (number)
│   └── formData (Record<string, number>)
│
├── Effects
│   └── useEffect → loadData() when collection changes
│
├── Event Handlers
│   ├── handleCreate()
│   ├── handleUpdate()
│   ├── handleDelete()
│   ├── openCreateModal()
│   ├── openEditModal(row)
│   ├── openDeleteModal(row)
│   ├── resetForm()
│   ├── addCategory()
│   ├── updateCategory(key, value)
│   └── removeCategory(key)
│
├── UI Components
│   ├── Header Section
│   ├── Status Messages (Error/Success)
│   ├── Controls Section
│   │   ├── Collection Selector
│   │   └── Create Button
│   ├── Data Table
│   │   ├── Table Header
│   │   ├── Table Body
│   │   └── Action Buttons
│   ├── Create Modal
│   │   ├── Year Input
│   │   ├── Dynamic Fields
│   │   └── Action Buttons
│   ├── Edit Modal
│   │   ├── Year Display
│   │   ├── Dynamic Fields
│   │   └── Action Buttons
│   └── Delete Confirmation Modal
│       ├── Warning Message
│       └── Action Buttons
│
└── Sub-Components
    └── Modal Component
        ├── Props: title, children, onClose
        ├── Overlay
        ├── Modal Container
        ├── Header with Close Button
        └── Content Area
```

---

## State Machine Diagram

```
┌─────────────┐
│   INITIAL   │
│   STATE     │
└──────┬──────┘
       │
       │ Select Collection
       ▼
┌─────────────┐
│   LOADING   │◄──────────────────────┐
│    DATA     │                       │
└──────┬──────┘                       │
       │                               │
       │ Data Loaded                   │
       ▼                               │
┌─────────────┐                       │
│   VIEWING   │                       │
│    TABLE    │                       │
└──────┬──────┘                       │
       │                               │
       ├── Click Create ──────────────┐│
       │                              ││
       ├── Click Edit ────────────────┤│
       │                              ││
       └── Click Delete ──────────────┤│
                                      ││
┌─────────────┐  ┌─────────────┐   ││
│   CREATE    │  │    EDIT     │   ││
│   MODAL     │  │   MODAL     │   ││
└──────┬──────┘  └──────┬──────┘   ││
       │                 │           ││
       │ Submit          │ Submit    ││
       ▼                 ▼           ││
┌─────────────┐  ┌─────────────┐   ││
│  CREATING   │  │  UPDATING   │   ││
└──────┬──────┘  └──────┬──────┘   ││
       │                 │           ││
       └─────────┬───────┘           ││
                 │                   ││
                 │ Success           ││
                 └───────────────────┘│
                                      │
       ┌──────────────────────────────┘
       │
┌──────┴──────┐
│   DELETE    │
│  CONFIRM    │
└──────┬──────┘
       │
       │ Confirm
       ▼
┌─────────────┐
│  DELETING   │
└──────┬──────┘
       │
       │ Success
       └────────────────────────────────┘
```

---

## Error Handling Flow

```
Operation Attempted
       │
       ▼
  Validation
       │
       ├─── Pass ────────> API Call
       │                       │
       │                       ├─── Success ──> Update UI
       │                       │                  Show Success
       │                       │                  Reload Data
       │                       │
       │                       └─── Firebase Error
       │                               │
       └─── Validation Failed          │
               │                       │
               ▼                       ▼
         Show Error               Show Error
         (Red Alert)              (Red Alert)
               │                       │
               └───────────┬───────────┘
                           │
                           ▼
                   User Can Retry
                   or Cancel
```

---

## Integration Points

### 1. With Upload Feature
```
CSV Upload ────────┐
                   │
CRUD Interface ────┼────> Firebase Collections ────> Charts
                   │
Manual Entry ──────┘
```

### 2. With Visualization
```
CRUD Page (Write)
       │
       ▼
Firebase Firestore
       │
       ▼
Chart Hooks (Read)
       │
       ▼
Chart Components (Display)
```

### 3. With API Service
```
CRUD Component
       │
       ├─> getAllData()
       ├─> postDataToFirestore()
       ├─> updateDataByYear()
       ├─> deleteDataByYear()
       └─> getCategories()
              │
              ▼
       baseService.ts
              │
              ▼
       Firebase SDK
              │
              ▼
       Firestore Database
```

---

## Security & Permissions

```
┌─────────────────────────────────────────┐
│         Firestore Rules                 │
│                                         │
│  rules_version = '2';                   │
│  service cloud.firestore {              │
│    match /databases/{database}/docs {   │
│      match /{document=**} {             │
│        allow read, write: true;         │
│      }                                  │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

**Note:** Currently open for public read/write. Consider adding authentication for production.

---

## Performance Considerations

### Optimization Strategies

1. **Data Loading**
   - Load only selected collection
   - Paginate large datasets (future)
   - Cache frequently accessed data

2. **State Updates**
   - Minimize re-renders
   - Use local state for forms
   - Only refresh on successful operations

3. **Firebase Queries**
   - Batch operations where possible
   - Use indexed fields
   - Implement pagination for large collections

4. **UI Responsiveness**
   - Show loading states
   - Optimistic updates (future)
   - Debounce search/filter (future)

---

## Scalability

### Current Limitations
- Single collection view
- One record at a time editing
- No pagination
- Full table reload on changes

### Future Improvements
- Virtual scrolling for large tables
- Batch operations
- Real-time updates
- Optimistic UI updates
- Incremental loading

---

**Document Version:** 1.0  
**Last Updated:** November 13, 2024

