# Weather Forecast – Google Sheets Add‑on

## Overview
A Google Sheets Add‑on built with **Google Apps Script (TypeScript)** and a **React sidebar UI**.  
The add‑on fetches a **1–3 day weather forecast** using the WeatherAPI.com service and writes a clear, structured weather report into the active spreadsheet.

---

## Example Output
./docs/sidebar.png

---

## Installation & Build (Required)

Follow these steps to build and deploy the add-on locally.  

---

### 1. Install Node.js (Required)
If you do not have Node.js installed, download it here:

https://nodejs.org/

---

### 2. Install clasp (if not installed)
`clasp` is the official tool for deploying Apps Script projects.

```bash
npm install -g @google/clasp
```

If you prefer *not* to install it globally, you can always use:

```bash
npx clasp
```

---

### 3. Login to clasp
This connects clasp to your Google account.

```bash
npx clasp login
```

A browser window will open → choose the Google account where you want to deploy the add-on.

---

### 4. Clone this project
```bash
git clone https://github.com/sumitramagdalin/sheets-weather-addon.git
cd sheets-weather-addon
```

---

### 5. Create your Apps Script project manually
you can create your own project directly in Google Sheets.

1. Open Google Sheets in your browser:
   https://docs.google.com/spreadsheets

2. Create a **new empty spreadsheet**.

3. In the spreadsheet, click:
   **Extensions → Apps Script**

   This will open the Apps Script editor for the spreadsheet.

4. In the Apps Script editor, go to:
   **Project Settings**

5. Scroll to the **"Script ID"** section and **copy** the Script ID.

---

### 6. Insert your `scriptId` into `.clasp.json`

Now open the `.clasp.json` file in your cloned project and update it:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "dist"
}
```

The repository includes `.clasp.json` with only:

```json
{ "rootDir": "dist" }
```

You MUST insert **your own Script ID** before running `npm run push` or `npx clasp push`.

### 8. Add your Weather API key (Required)
Inside the Apps Script editor that you created before:

1. Click **Project Settings**
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Add:

```
Key: WEATHER_API_KEY
Value: <your-weatherapi-key>
```

Your server code reads the value like this:

```ts
PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY");
```

---

### 9. Install project dependencies
Inside the project root:

```bash
npm install
```

---

### 10. Build UI + backend
```bash
npm run build
```

This generates:

- `dist/Code.js`
- `dist/ui.html`
- `dist/appsscript.json`

---

### 11. Push the built add-on to your Apps Script project
```bash
npm run push
```

(`npm run push` simply runs: `npx clasp push`)

---

### 12. Open the project again (optional)
```bash
npm run open
```

---

### 13. Test the add-on inside Google Sheets
1. Open Google Sheets  
2. Go to **Extensions → Apps Script** (or use “Test deployment”)  
3. Deploy as **Editor Add-on**  
4. Reload the spreadsheet  
5. Open the add-on via:

```
Extensions → Weather Forecast Add-on → Open Sidebar
```

---

## Usage

1. Open Google Sheets
2. Go to Extensions → Weather Forecast Add‑on → Open Sidebar
3. Enter city, date, and number of days
4. Optional: enable/disable filters
5. Click Generate report
6. The report is written into the active sheet

---


