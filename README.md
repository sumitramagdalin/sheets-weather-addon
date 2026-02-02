
## Overview
A Google Sheets Add‑on built with Google Apps Script (TypeScript) and a React sidebar UI, providing a clean, readable 1–3 day weather forecast directly inside Google Sheets.
The add‑on uses the WeatherAPI.com service and displays the results in a structured table.

## Example output
<img width="1907" height="674" alt="image" src="https://github.com/user-attachments/assets/7ae2c893-1d6c-4a79-9ec6-5cc07a8dacbc" />

## Insert the correct scriptId into the .clasp.json file (Required)

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

