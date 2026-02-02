
# Weather Forecast – Google Sheets Add‑on

## Overview
A Google Sheets Add‑on built with **Google Apps Script (TypeScript)** and a **React sidebar UI**.  
The add‑on fetches a **1–3 day weather forecast** using the WeatherAPI.com service and writes a clear, structured weather report into the active spreadsheet.

---

## Example Output
./docs/sidebar.png

---

## Insert the correct `scriptId` into `.clasp.json` (Required)

This project uses **clasp** for deployment.  
Before deploying or testing the add‑on, you must add **your own Apps Script project ID**.

---

## Weather API key setup (Required)

This project uses Script Properties to keep API keys secure.

After pushing the project with `clasp`, follow these steps:

1. Open the Apps Script project
2. Go to **Project Settings**
3. Scroll to **Script Properties**
4. Add a new property:

   Key: WEATHER_API_KEY  
   Value: <your-weatherapi-key>

This key is read inside the Apps Script code using:
PropertiesService.getScriptProperties().getProperty("WEATHER_API_KEY")

---

## Usage

1. Open Google Sheets
2. Go to Extensions → Weather Forecast Add‑on → Open Sidebar
3. Enter city, date, and number of days
4. Optional: enable/disable filters
5. Click Generate report
6. The report is written into the active sheet

---


