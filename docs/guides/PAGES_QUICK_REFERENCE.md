# Pages Quick Reference Card

**Print this page for desk reference!**

---

## 🗺️ Quick Navigation

| Page | Route | Icon | Key |
|------|-------|------|-----|
| Dashboard | `/` | 🏠 | Home/Overview |
| Geographic | `/geographic` | 🌍 | Maps |
| Comparison | `/comparison` | 📊 | Bar charts |
| Composition | `/composition` | 🥧 | Pie charts |
| Trends | `/trends` | 📈 | Line charts |
| Distribution | `/distribution` | 📉 | Area charts |
| Relationships | `/relationships` | 🔗 | Scatter plots |
| Ranking | `/radar` | 🕸️ | Radar charts |
| Flow/Process | `/parallel` | 🌊 | Sankey/Flow |
| Upload | `/upload` | ⬆️ | CSV upload |
| CRUD | `/crud` | 💾 | Data management |

---

## 📊 Chart Types at a Glance

### Geographic (Choropleth Maps)
- **Shows:** Where emigrants go/come from
- **X-Axis:** Longitude
- **Y-Axis:** Latitude
- **Visual:** Color intensity = volume

### Comparison (Bar Charts)
- **Shows:** Rankings of categories
- **X-Axis:** Count
- **Y-Axis:** Categories
- **Visual:** Bar length = value

### Composition (Pie Charts)
- **Shows:** Proportions/percentages
- **Dimension:** Category
- **Measure:** Percentage of total
- **Visual:** Slice size = proportion

### Trends (Line Charts)
- **Shows:** Change over time
- **X-Axis:** Year
- **Y-Axis:** Count
- **Visual:** Line slope = trend

### Distribution (Area Charts)
- **Shows:** Volume over time
- **X-Axis:** Year
- **Y-Axis:** Count (stacked)
- **Visual:** Layer thickness = volume

### Relationships (Scatter Plots)
- **Shows:** Correlations
- **X-Axis:** Variable 1
- **Y-Axis:** Variable 2
- **Visual:** Point position = values

### Ranking (Radar Charts)
- **Shows:** Multi-dimensional profile
- **Axes:** Multiple radial
- **Visual:** Shape = overall profile

### Flow/Process (Sankey)
- **Shows:** Data pathways
- **Nodes:** Category stages
- **Links:** Flow volume
- **Visual:** Ribbon width = volume

---

## 🎯 When to Use Each Page

| Your Question | Use This Page |
|---------------|---------------|
| "Where do they go?" | Geographic |
| "Which has most?" | Comparison |
| "What percentage?" | Composition |
| "How has it changed?" | Trends |
| "What's the total trend?" | Distribution |
| "Are X and Y related?" | Relationships |
| "How do they compare overall?" | Ranking |
| "What's the pathway?" | Flow/Process |
| "I need to add data" | Upload or CRUD |
| "I need to fix data" | CRUD |

---

## 📂 Data Collections

| Collection | Contains | Example |
|------------|----------|---------|
| `emigrantData_destination` | Countries | USA, Canada, Japan |
| `emigrantData_age` | Age groups | 20-24, 25-29 |
| `emigrantData_sex` | Gender | Male, Female |
| `emigrantData_civilStatus` | Marital | Single, Married |
| `emigrantData_education` | Education | College Graduate |
| `emigrantData_occupation` | Jobs | Professional |
| `emigrantData_province` | Origins | NCR, CALABARZON |

---

## 🔗 Page Relationships

```
        Dashboard (Hub)
             │
    ┌────────┼────────┐
    │        │        │
Geographic Comparison Composition
    │        │        │
    └────────┼────────┘
             │
          Trends
             │
       Distribution
             │
      Relationships
             │
    ┌────────┴────────┐
  Ranking         Flow/Process
    │                 │
    └────────┬────────┘
             │
      Upload & CRUD
      (Data Source)
```

---

## ⚡ Keyboard Shortcuts

- **Home** → Go to Dashboard
- **Refresh (F5)** → Reload data
- **Ctrl/Cmd + Click** → Open in new tab

---

## 🎨 Visual Elements Guide

| Element | Meaning |
|---------|---------|
| 🟢 Green alert | Success message |
| 🔴 Red alert | Error message |
| 🟡 Yellow warning | Important notice |
| 🔵 Blue button | Edit/Update action |
| 🔴 Red button | Delete action |
| 🟢 Green button | Create action |

---

## 📈 Understanding Axes

### For Bar Charts (Comparison)
```
Category A  ■■■■■■■■■■ (10,000)
Category B  ■■■■■ (5,000)
Category C  ■■■ (3,000)
            └─ X-Axis: Count
            │
            Y-Axis: Categories
```

### For Line Charts (Trends)
```
Count
  │        /\
  │       /  \
  │  ____/    \___
  │
  └──────────────── Year
```

### For Scatter Plots (Relationships)
```
Y-Axis
  │      ●
  │   ●     ●
  │ ●   ●
  │___________
      X-Axis
```

---

## 🔢 Data Filters

| Filter Type | Available On | Options |
|-------------|--------------|---------|
| **Year** | Most pages | 1981-2020+ |
| **Collection** | Comparison, CRUD | 7 types |
| **Top N** | Comparison | 5, 10, 15, 20 |
| **Relationship** | Relationships | Age, Education, Distance |
| **Style** | Distribution | Stacked, Stream, Percent |

---

## 💡 Pro Tips

1. **Start broad** → Dashboard for overview
2. **Go specific** → Comparison for rankings
3. **Check trends** → See historical changes
4. **Verify correlations** → Use Relationships
5. **Refresh after edits** → Charts don't auto-update

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| No data showing | Check year filter / Upload data |
| Wrong year displayed | Change year selector |
| CRUD changes not showing | Refresh the chart page |
| Can't find CRUD | Check top navigation bar |
| Upload failed | Check CSV format |

---

## 📱 Mobile Tips

- Rotate to landscape for better view
- Use pinch-to-zoom on maps
- Swipe to scroll long tables
- Tap for tooltips
- Top nav scrolls horizontally

---

## 🔧 Quick Actions

| Task | Steps |
|------|-------|
| **View 2020 destinations** | Geographic → Select 2020 |
| **See top 10 countries** | Comparison → Destination → Top 10 |
| **Check age breakdown** | Composition → Age Groups chart |
| **View US trend 1981-2020** | Trends → Destination → Find USA line |
| **Add new year data** | CRUD → Create New Record |
| **Fix typo in data** | CRUD → Edit → Update |
| **Upload bulk data** | Upload → Drop CSV → Confirm |

---

## 📊 Chart Comparison

| Need | Best Chart | Why |
|------|------------|-----|
| Location patterns | Map | Geographic context |
| Rankings | Bar | Easy comparison |
| Proportions | Pie | Clear percentages |
| Time changes | Line | Show trends |
| Total volumes | Area | Cumulative view |
| Correlations | Scatter | Show relationships |
| Multi-metric | Radar | Holistic view |
| Pathways | Sankey | Show connections |

---

## 🎯 User Roles Guide

### For Analysts 📊
1. Dashboard → Overview
2. Trends → Historical patterns
3. Relationships → Correlations
4. Comparison → Current state

### For Administrators 👨‍💼
1. CRUD → Daily management
2. Upload → Bulk updates
3. Comparison → Data verification
4. Trends → Quality checks

### For Presenters 🎤
1. Geographic → Visual impact
2. Composition → Clear proportions
3. Trends → Storytelling
4. Radar → Comparisons

---

## 📞 Getting Help

| Need Help With | See Document |
|----------------|--------------|
| Page explanations | PAGES_GUIDE.md |
| CRUD operations | CRUD_GUIDE.md |
| CSV uploads | CSV_FORMAT_GUIDE.md |
| Quick CRUD tips | CRUD_QUICK_REFERENCE.md |
| Project overview | README.MD |

---

## 🎨 Color Legend

| Color Scheme | Page | Meaning |
|--------------|------|---------|
| Heat map (Yellow→Red) | Geographic | Low → High |
| Rainbow | Composition | Category distinction |
| Sequential | Comparison | Single dimension |
| Multi-hue | Trends | Multiple series |
| Gradient | Distribution | Layer identification |
| Categorical | Relationships | Group separation |

---

## ⏱️ Typical Workflows

### Daily Data Check (2 min)
1. Dashboard → Check totals
2. Comparison → View rankings
3. Done ✅

### Monthly Analysis (10 min)
1. Dashboard → Overview
2. Trends → Month-over-month
3. Composition → Breakdown changes
4. Geographic → Regional patterns
5. Export findings

### Annual Update (15 min)
1. Prepare CSV or use CRUD
2. Upload → Add new year
3. Verify in Comparison
4. Check Trends for continuity
5. Review all pages

---

**Last Updated:** November 13, 2024  
**Version:** 1.0  

**Full Guide:** See PAGES_GUIDE.md for detailed explanations

---

**Print this page and keep it handy! 📄**

