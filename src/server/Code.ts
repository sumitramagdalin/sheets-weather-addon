
function onOpen(): void {
    SpreadsheetApp.getUi()
        .createMenu('Weather Add-on')
        .addItem('Open Sidebar', 'openSidebar')
        .addToUi();
}

function openSidebar(): void {
    const html = HtmlService.createHtmlOutputFromFile('ui').setTitle('Weather Forecast');
    SpreadsheetApp.getUi().showSidebar(html);
}

function setWeatherApiKey(key: string): void {
    PropertiesService.getScriptProperties().setProperty('WEATHER_API_KEY', key);
}

function getWeatherApiKey(): string {
    const key = PropertiesService.getScriptProperties().getProperty('WEATHER_API_KEY');
    if (!key) throw new Error('Missing WEATHER_API_KEY. Call setWeatherApiKey(key) once.');
    return key;
}

function searchCities(query: string): { label: string; value: string }[] {
    if (!query || query.trim().length < 2) return [];
    const key = getWeatherApiKey();
    const url = `https://api.weatherapi.com/v1/search.json?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
        throw new Error('Weather search failed: ' + res.getContentText());
    }
    const data = JSON.parse(res.getContentText());
    return (data || []).map((item: any) => ({
        label: `${item.name}, ${item.region || item.country}`,
        value: `${item.lat},${item.lon}`
    }));
}

type WeatherFilters = {
    temp?: boolean;
    wind?: boolean;
    condition?: boolean;
};

type ReportOptions = {
    cityCoord: string;
    startDate: string;
    days: number;
    filters?: WeatherFilters;
};

function formatYMD(d: Date): string {
    const yyyy: number = d.getFullYear();
    const mm: string = ('0' + (d.getMonth() + 1)).slice(-2);
    const dd: string = ('0' + d.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
}

function buildWantedDates(startISO: string, days: number): string[] {
    const out: string[] = [];
    const start: Date = new Date(startISO + 'T00:00:00');
    for (let day: number = 0; day < days; day++) {
        const date: Date = new Date(start.getTime());
        date.setDate(start.getDate() + day);
        out.push(Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    }
    return out;
}

function generateWeatherReport(opts: ReportOptions): void {
    const { cityCoord, startDate, days } = opts;
    const filters: WeatherFilters = opts.filters || {};

    if (!cityCoord) throw new Error('City is required');
    if (!startDate) throw new Error('No start date.');
    if (!days || days < 1) throw new Error('Days must be >= 1');

    var tz: string = Session.getScriptTimeZone();
    var todayISO: string = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');

    var startISO: string = startDate;
    var startTime: number = Date.parse(startISO + 'T00:00:00');
    var todayTime: number = Date.parse(todayISO + 'T00:00:00');
    if (isNaN(startTime)) throw new Error('Invalid start date format (expected yyyy-mm-dd)');

    if (startTime < todayTime) {
        startISO = todayISO;
        startTime = todayTime;
    }

    var offsetDays: number = Math.floor((startTime - todayTime) / 86400000);
    if (offsetDays < 0) offsetDays = 0;

    var MAX_FORECAST_DAYS: number = 3;
    var fetchDays: number = offsetDays + days;
    if (fetchDays < 1) fetchDays = 1;
    if (fetchDays > MAX_FORECAST_DAYS) fetchDays = MAX_FORECAST_DAYS;

    if (offsetDays >= MAX_FORECAST_DAYS) {
        var activeSheet1:  GoogleAppsScript.Spreadsheet.Sheet = SpreadsheetApp.getActiveSheet();
        var anchorRow0: number = activeSheet1.getActiveCell() ? activeSheet1.getActiveCell().getRow() : 1;
        var anchorCol0: number = activeSheet1.getActiveCell() ? activeSheet1.getActiveCell().getColumn() : 1;
        activeSheet1.getRange(anchorRow0, anchorCol0).setValue('Selected start date is beyond available forecast range (max ' + MAX_FORECAST_DAYS + ' days from today).');
        return;
    }

    var key: string = getWeatherApiKey();
    var url: string = 'https://api.weatherapi.com/v1/forecast.json?key='
        + encodeURIComponent(key)
        + '&q=' + encodeURIComponent(cityCoord)
        + '&days=' + fetchDays
        + '&aqi=no&alerts=no';

    var httpResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (httpResponse.getResponseCode() !== 200) {
        throw new Error('Forecast request failed: ' + httpResponse.getContentText());
    }
    var json = JSON.parse(httpResponse.getContentText());

    var showCond: boolean = filters.condition !== false;
    var showTemp: boolean = filters.temp !== false;
    var showWind: boolean = filters.wind !== false;

    var header: string[] = ['Date'];
    if (showCond) header.push('Condition');
    if (showTemp) header.push('Min °C', 'Max °C', 'Avg °C');
    if (showWind) header.push('Max Wind (kph)');
    header.push('Total Precip (mm)');

    var wantedDates: string[] = buildWantedDates(startISO, days);
    var daysData = (json.forecast && json.forecast.forecastday) ? json.forecast.forecastday : [];

    var rows: any[] = [];
    for (var length: number = 0; length < daysData.length; length++) {
        var daysDatum = daysData[length];
        if (wantedDates.indexOf(daysDatum.date) === -1) continue;

        var cond = (daysDatum.day && daysDatum.day.condition && daysDatum.day.condition.text) ? daysDatum.day.condition.text : '';
        var minC = (daysDatum.day && daysDatum.day.mintemp_c != null) ? daysDatum.day.mintemp_c : '';
        var maxC = (daysDatum.day && daysDatum.day.maxtemp_c != null) ? daysDatum.day.maxtemp_c : '';
        var avgC = (daysDatum.day && daysDatum.day.avgtemp_c != null) ? daysDatum.day.avgtemp_c : '';
        var wind = (daysDatum.day && daysDatum.day.maxwind_kph != null) ? daysDatum.day.maxwind_kph : '';
        var precip = (daysDatum.day && daysDatum.day.totalprecip_mm != null) ? daysDatum.day.totalprecip_mm : '';

        var row: any[] = [daysDatum.date];
        if (showCond) row.push(cond);
        if (showTemp) row.push(minC, maxC, avgC);
        if (showWind) row.push(wind);
        row.push(precip);

        rows.push(row);
    }

    var spreadsheet:  GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActive();
    var activeSheet:  GoogleAppsScript.Spreadsheet.Sheet = spreadsheet.getActiveSheet();

    var anchorRow: number = activeSheet.getActiveCell() ? activeSheet.getActiveCell().getRow() : 1;
    var anchorCol: number = activeSheet.getActiveCell() ? activeSheet.getActiveCell().getColumn() : 1;

    var MAX_ROWS_TO_CLEAR: number = 2 + 3;
    var MAX_COLS_TO_CLEAR: number = 7;
    activeSheet.getRange(anchorRow, anchorCol, MAX_ROWS_TO_CLEAR, MAX_COLS_TO_CLEAR).clearContent().clearFormat();

    var cityName: string = '';
    if (json.location) {
        var namePart = json.location.name ? json.location.name : '';
        var regPart = json.location.region ? json.location.region : (json.location.country ? json.location.country : '');
        cityName = namePart + (regPart ? ', ' + regPart : '');
    }

    var title: string = 'Weather Forecast: ' + cityName
        + ' (start ' + startISO + ', ' + days + ' day' + (days > 1 ? 's' : '') + ')';

    var titleRange: GoogleAppsScript.Spreadsheet.Range = activeSheet.getRange(anchorRow, anchorCol, 1, header.length);
    var titleRow: string[] = [title];
    for (var number: number = 1; number < header.length; number++) titleRow.push('');
    titleRange.setValues([titleRow]);
    titleRange.merge();
    titleRange.setFontWeight('bold');

    var headerRange: GoogleAppsScript.Spreadsheet.Range = activeSheet.getRange(anchorRow + 1, anchorCol, 1, header.length);
    headerRange.setValues([header]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8eef7');

    if (rows.length > 0) {
        var dataRange: GoogleAppsScript.Spreadsheet.Range = activeSheet.getRange(anchorRow + 2, anchorCol, rows.length, header.length);
        dataRange.setValues(rows);
        activeSheet.autoResizeColumns(anchorCol, header.length);
    } else {
        activeSheet.getRange(anchorRow + 2, anchorCol).setValue('No data for selected range.');
    }
}