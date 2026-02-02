declare global {
  interface GoogleScriptRun {
    withSuccessHandler: <T>(fn: (result: T) => void) => GoogleScriptRun;
    withFailureHandler: (fn: (error: any) => void) => GoogleScriptRun;

    // server-side functions available to the client:
    searchCities: (q: string) => void;
    generateWeatherReport: (opts: any) => void;

    // optional: a ping() for diagnostics
    ping: () => void;
  }

  interface Google {
    script: {
      run: GoogleScriptRun;
      host: { close: () => void };
    };
  }

  const google: Google | undefined;
}
export {};