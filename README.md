
# Weather Forecast – Google Sheets Add‑on

## Overview
A Google Sheets Add‑on built with **Google Apps Script (TypeScript)** and a **React sidebar UI**.  
The add‑on fetches a **1–3 day weather forecast** using the WeatherAPI.com service and writes a clear, structured weather report into the active spreadsheet.

---

## Example Output
./docs/sidebar.png

---

## Installation & Build (Required)

Follow these steps to build and deploy the add‑on locally using clasp:

### 1. Clone the project
```bash
git clone https://github.com/sumitramagdalin/sheets-weather-addon.git
cd sheets-weather-addon
```

### 2. Insert your `scriptId` into `.clasp.json`
This project uses **clasp** for deployment.  
Before building or pushing the add‑on, create your own Apps Script project:

```bash
npx clasp login
npx clasp create --type sheets --title "Weather Forecast Add-on"
```

Copy the generated `scriptId` and update `.clasp.json`:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "dist"
}
```

### 3. Add your Weather API key (Required)
The project uses **Script Properties** to store the key securely.

1. Open the Apps Script project (Extensions → Apps Script)  
2. Go to **Project Settings**  
3. Scroll to **Script Properties**  
4. Add a new property:

```
Key: WEATHER_API_KEY
Value: <your-weatherapi-key>
```

The key is read inside Apps Script via:

```ts
PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
```

### 4. Install dependencies
```bash
npm install
```

### 5. Build UI + backend
```bash
npm run build
```

### 6. Push the add-on to your Apps Script project
```bash
npm run push
```

### 7. Open the project in your browser
```bash
npm run open
```

## Usage

1. Open Google Sheets
2. Go to Extensions → Weather Forecast Add‑on → Open Sidebar
3. Enter city, date, and number of days
4. Optional: enable/disable filters
5. Click Generate report
6. The report is written into the active sheet

---


