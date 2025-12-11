# CRUD Quick Reference Card

## 🚀 Quick Start

1. Go to Dashboard → Click **"Data Management (CRUD)"**
2. Select a collection from dropdown
3. View, create, edit, or delete records

---

## 📋 Main Actions

| Action | Button | Location |
|--------|--------|----------|
| **Create** | ➕ Create New Record | Top right of page |
| **Read** | 👁️ Automatic | Table displays all records |
| **Update** | ✏️ Edit (blue) | Right side of each row |
| **Delete** | 🗑️ Delete (red) | Right side of each row |

---

## 🎯 Collections Reference

| Collection | Contains | Example Categories |
|------------|----------|-------------------|
| **Destination Countries** | Where emigrants go | USA, CANADA, JAPAN, AUSTRALIA |
| **Age Groups** | Age demographics | 14 - Below, 15 - 19, 20 - 24 |
| **Gender/Sex** | Gender distribution | MALE, FEMALE |
| **Civil Status** | Marital status | SINGLE, MARRIED, DIVORCED, WIDOWED |
| **Education Level** | Education data | Elementary Level, College Graduate |
| **Occupation** | Job categories | Professional, Technical, Service |
| **Province/Origin** | Philippine origins | NCR, CALABARZON, CENTRAL LUZON |

---

## ✅ Data Entry Checklist

### Creating New Record:
- [ ] Year is 4 digits (e.g., 2024)
- [ ] Year doesn't already exist
- [ ] At least one category added
- [ ] All values are numbers
- [ ] Category names are ALL CAPS
- [ ] Spelling matches existing records

### Updating Record:
- [ ] Found correct year
- [ ] Values are accurate
- [ ] No accidental deletions
- [ ] Changes reviewed before saving

### Deleting Record:
- [ ] Absolutely sure it's the right record
- [ ] Have backup if needed
- [ ] Confirmed year is correct
- [ ] Understand deletion is permanent

---

## ⚡ Keyboard Workflow

1. Click **Create New Record** or **Edit**
2. Tab through fields
3. Enter/modify values
4. Click **Add Field** for new categories
5. Click **Create/Update Record**

---

## 🔥 Common Patterns

### Pattern 1: Add Current Year Data
```
1. Create New Record
2. Year: 2024
3. Add Field → "UNITED STATES OF AMERICA" → 45000
4. Add Field → "CANADA" → 32000
5. Add more countries...
6. Create Record
```

### Pattern 2: Fix Single Value
```
1. Find record in table
2. Click Edit (blue button)
3. Change the incorrect value
4. Update Record
```

### Pattern 3: Add New Category
```
1. Click Edit on record
2. Click "Add Field"
3. Enter category name
4. Enter value
5. Update Record
```

---

## ⚠️ Warning Signs

| Warning | Meaning | Action |
|---------|---------|--------|
| "Year already exists" | Duplicate year | Use Edit instead |
| "Add at least one category" | Empty form | Add fields first |
| "Valid year required" | Invalid year | Enter 1900-2100 |
| Red delete button | Danger zone! | Double-check before clicking |

---

## 💡 Pro Tips

1. **Save Often:** Click Update/Create immediately after changes
2. **Verify in Charts:** Open chart pages to confirm data displays correctly
3. **Consistent Names:** Copy-paste category names from existing records
4. **Use Edit, Not Delete:** Safer to modify than delete and recreate
5. **Check Twice, Click Once:** Review data before saving
6. **Mobile Works:** Can manage data from phone/tablet in a pinch

---

## 🔗 Related Pages

- **Upload Page:** `/upload` - For CSV bulk imports
- **Dashboard:** `/` - Return to main menu
- **Charts:** Various visualization pages

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not saving | Check internet connection |
| Can't see new data | Refresh the page |
| Wrong collection | Select correct one from dropdown |
| Duplicate year error | Use Edit button on existing record |
| Missing fields | Click "Add Field" in modal |
| Changes not in charts | Refresh chart page |

---

## 📊 Example Workflows

### Workflow A: New Fiscal Year Setup
```
January 1st → Add last year's final data
1. CRUD page → Destination Countries
2. Create New Record → Year: 2023
3. Add all countries with final counts
4. Repeat for Age Groups, Education, etc.
```

### Workflow B: Monthly Update
```
Mid-month → Update current year estimates
1. CRUD page → Select collection
2. Edit current year record
3. Update values with new data
4. Save and verify in charts
```

### Workflow C: Data Audit
```
Quarterly review → Check and correct errors
1. Browse each collection
2. Compare with source documents
3. Edit any discrepancies
4. Document changes made
```

---

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🔵 Blue | Edit/Update action (safe) |
| 🔴 Red | Delete action (dangerous) |
| 🟢 Green | Success message |
| 🔴 Red | Error message |
| 🟡 Yellow | Warning message |
| 🔵 Highlights | Primary actions |

---

**Print this page for desk reference!**

Created: November 2024 | [Full Guide](./CRUD_GUIDE.md)

