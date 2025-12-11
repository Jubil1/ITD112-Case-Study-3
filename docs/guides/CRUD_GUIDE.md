# CRUD Functionality Guide

## Overview

The CRUD (Create, Read, Update, Delete) page provides a complete interface for managing emigrant data directly through the web interface without needing to upload CSV files.

## Accessing CRUD

Navigate to the CRUD page from the main dashboard by clicking on the **"Data Management (CRUD)"** card, or go directly to `/crud`.

---

## Features

### 1. **Read Data** 📖

- Select a data collection from the dropdown menu
- View all records in a table format
- See year-wise data with key categories displayed
- Browse multiple records with an intuitive table interface

**Available Collections:**
- Destination Countries
- Age Groups
- Gender/Sex
- Civil Status
- Education Level
- Occupation
- Province/Origin

### 2. **Create New Records** ➕

**Steps:**
1. Click the **"Create New Record"** button
2. Enter the year (e.g., 2024)
3. Click **"Add Field"** to add data categories
4. Enter category name (e.g., "UNITED STATES OF AMERICA", "MALE", "20-24")
5. Enter the value (number of emigrants)
6. Add as many fields as needed
7. Click **"Create Record"**

**Example - Creating Destination Data for 2024:**
```
Year: 2024

Fields:
- UNITED STATES OF AMERICA: 45000
- CANADA: 32000
- JAPAN: 12000
- AUSTRALIA: 8500
- UNITED KINGDOM: 6200
```

**Important Notes:**
- Year must be between 1900 and 2100
- Category names should match existing conventions (all caps)
- Values must be numeric
- Cannot create duplicate years (use Update instead)

### 3. **Update Records** ✏️

**Steps:**
1. Find the record you want to update in the table
2. Click the blue **Edit** button (pencil icon)
3. Modify existing field values
4. Add new fields using **"Add Field"**
5. Remove fields using the red X button
6. Click **"Update Record"**

**Use Cases:**
- Correct data entry errors
- Add newly available categories
- Update preliminary data with final figures
- Merge additional data sources

### 4. **Delete Records** 🗑️

**Steps:**
1. Find the record you want to delete
2. Click the red **Delete** button (trash icon)
3. Confirm deletion in the popup dialog
4. Record is permanently removed

**⚠️ Warning:** Deletion is permanent and cannot be undone!

---

## Data Structure

All data is stored in Firebase Firestore with the following structure:

```
emigrantData_destination/
  2020/
    Year: 2020
    UNITED STATES OF AMERICA: 6539
    CANADA: 4579
    JAPAN: 1100
    ...
  2021/
    Year: 2021
    UNITED STATES OF AMERICA: 35839
    ...
```

---

## Best Practices

### Naming Conventions

1. **Country Names:** Use official full names in ALL CAPS
   - ✅ `UNITED STATES OF AMERICA`
   - ❌ `USA`, `United States`

2. **Age Groups:** Use consistent format with spaces
   - ✅ `14 - Below`, `15 - 19`, `20 - 24`
   - ❌ `14-Below`, `15-19`

3. **Gender/Sex:** Use standard categories
   - ✅ `MALE`, `FEMALE`
   - ❌ `M`, `F`, `Male`, `Female`

4. **Civil Status:** All caps, consistent spelling
   - ✅ `SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`
   - ❌ `Single`, `Widower`

5. **Education Levels:** Consistent naming
   - ✅ `Elementary Level`, `High School Level`, `College Graduate`
   - ❌ `Elementary`, `HS`, `College Grad`

### Data Integrity

1. **Validate Before Creating:**
   - Double-check year is correct
   - Verify all values are accurate
   - Ensure category names match existing conventions

2. **Use Update Instead of Delete + Create:**
   - Preserves data history
   - Safer than deletion
   - Can be undone more easily

3. **Regular Backups:**
   - Export data periodically
   - Keep copies of important datasets
   - Document major changes

4. **Consistent Data Entry:**
   - Follow the same format across years
   - Keep category names identical
   - Use same units (raw numbers, not percentages)

---

## Common Tasks

### Task 1: Add New Year Data

When new annual data becomes available:

1. Select appropriate collection (e.g., Destination Countries)
2. Click "Create New Record"
3. Enter the new year (e.g., 2025)
4. Add all categories with values
5. Save and verify in the table

### Task 2: Correct a Data Entry Error

If you notice incorrect data:

1. Locate the record in the table
2. Click the Edit button
3. Find the incorrect field
4. Update the value
5. Save changes

### Task 3: Add Missing Categories

To add categories to existing records:

1. Click Edit on the record
2. Click "Add Field"
3. Enter the category name
4. Enter the value
5. Update record

### Task 4: Remove Outdated Data

To clean up incorrect or outdated records:

1. Find the record in the table
2. Click Delete button
3. Confirm in the dialog
4. Data is removed from Firebase

---

## Troubleshooting

### Error: "Year already exists"

**Problem:** Trying to create a record for a year that already has data.

**Solution:** Use the Edit function instead to update the existing record.

### Error: "Please add at least one category"

**Problem:** Trying to create a record without any data fields.

**Solution:** Click "Add Field" and enter at least one category with a value.

### Error: "Please enter a valid year"

**Problem:** Year is outside the acceptable range.

**Solution:** Enter a year between 1900 and 2100.

### Data Not Appearing in Charts

**Problem:** Created data but charts don't show it.

**Solution:** 
- Refresh the page
- Check if you selected the correct collection
- Verify the category names match what charts expect
- Check browser console for errors

### Categories Not Matching

**Problem:** Field names don't align with other years.

**Solution:**
- Review existing data structure
- Use exact same spelling and capitalization
- Refer to naming conventions above

---

## Integration with Other Features

### Upload Page Integration

The CRUD page works alongside the CSV Upload feature:

- **CSV Upload:** Best for bulk data import (multiple years at once)
- **CRUD Page:** Best for individual record management and corrections

Both methods store data in the same Firebase collections, so they work seamlessly together.

### Chart Visualization

All changes made through CRUD are immediately available to:
- Geographic Visualization
- Comparison Charts
- Composition Charts
- Trend Analysis
- Distribution Charts
- Relationship Analysis
- Radar Charts
- Parallel Sets

Simply refresh the chart page to see updated data.

---

## Advanced Usage

### Bulk Updates

For multiple records:
1. Edit each record individually
2. Or export to CSV, modify, and re-upload

### Data Validation

Before saving important data:
1. Compare with source documents
2. Check totals add up correctly
3. Verify category names are consistent
4. Test in charts to ensure proper display

### API Integration

The CRUD page uses these API functions from `baseService.ts`:
- `getAllData()` - Fetch all records
- `postDataToFirestore()` - Create new records
- `updateDataByYear()` - Update existing records
- `deleteDataByYear()` - Delete records

You can use these same functions in custom scripts if needed.

---

## Tips & Tricks

1. **Quick Navigation:** Use browser back button to return to dashboard
2. **Keyboard Shortcuts:** Tab through form fields quickly
3. **Copy-Paste:** Can paste values from Excel/Google Sheets
4. **Multiple Windows:** Open CRUD and a chart in separate tabs for real-time verification
5. **Mobile Friendly:** Works on tablets and phones (with scrolling)

---

## FAQs

**Q: Can I undo a deletion?**  
A: No, deletions are permanent. Always double-check before confirming.

**Q: How many fields can I add?**  
A: No hard limit, but for performance, keep under 100 fields per record.

**Q: Can I rename a category?**  
A: No direct rename. You must delete the old field and add a new one.

**Q: Do changes sync in real-time?**  
A: Changes save to Firebase immediately, but charts need a page refresh to show updates.

**Q: Can multiple users edit simultaneously?**  
A: Yes, but last save wins. Coordinate with team members to avoid conflicts.

**Q: Is there an edit history?**  
A: Not currently. Consider keeping external documentation of major changes.

---

## Related Documentation

- [CSV Format Guide](./CSV_FORMAT_GUIDE.md) - For understanding CSV upload formats
- [Choropleth Integration Guide](./CHOROPLETH_INTEGRATION_GUIDE.md) - For geographic visualizations
- [Project Structure](./PROJECT_STRUCTURE.md) - Overall application architecture

---

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase connection is active
3. Ensure you have proper permissions
4. Review this guide for proper procedures
5. Check network connection

---

**Last Updated:** November 2024  
**Version:** 1.0

