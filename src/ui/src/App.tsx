import {useRef, useEffect, useMemo, useState } from 'react';
import './index.css';

type CityOption = { label: string; value: string };

type Filters = {
  temp?: boolean;
  wind?: boolean;
  condition?: boolean;
};

export default function App() {
  const suppressNextSearch = useRef(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CityOption[]>([]);
  const [selected, setSelected] = useState<CityOption | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [days, setDays] = useState<number>(1);
  const [filters, setFilters] = useState<Filters>({ temp: true, wind: true, condition: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const nextReqId = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedQuery: string = useDebounce(query, 300);

  useEffect(() => {

      if (suppressNextSearch.current) {
          suppressNextSearch.current = false;
          return;
      }

      const suggestion: string = (debouncedQuery || '').trim();
      if (!suggestion || suggestion.length < 2) {
      setOptions([]);
        setError(null);
        setLoadingSuggestions(false);
        setIsOpen(false);
        setActiveIndex(-1);
        return;
    }
      setError(null);
      setLoadingSuggestions(true);
      setIsOpen(true);

      const reqId: number = ++nextReqId.current;
      const canRun: boolean =
        typeof google !== 'undefined' &&
        !!google &&
        !!google.script &&
        !!google.script.run;

    if (!canRun) {
        setLoadingSuggestions(false);
      setError('Apps Script bridge not ready (google.script.run unavailable).');
      return;
    }

      google!.script.run
          .withSuccessHandler((list: CityOption[]) => {
              if (reqId !== nextReqId.current) return;
              setOptions(Array.isArray(list) ? list : []);
              setLoadingSuggestions(false);
              setIsOpen(true);
              setActiveIndex(list && list.length ? 0 : -1);

          })
          .withFailureHandler((e: any) => {
              if (reqId !== nextReqId.current) return;
              setError(String(e));
              setOptions([]);
              setLoadingSuggestions(false);
              setIsOpen(true);
              setActiveIndex(-1);
          })
          .searchCities(suggestion);
  }, [debouncedQuery]);

    useEffect(() => {
        if (!startDate) {
            const date: Date = new Date();
            const yyyy: number = date.getFullYear();
            const mm: string = String(date.getMonth() + 1).padStart(2, '0');
            const dd: string = String(date.getDate()).padStart(2, '0');
            setStartDate(`${yyyy}-${mm}-${dd}`);
        }
    }, [startDate]);

    const onSelect = (opt: CityOption) => {
        suppressNextSearch.current = true;
        nextReqId.current += 1;
        setSelected(opt);
        setQuery(opt.label);
        setError(null);
        setLoadingSuggestions(false);
        setIsOpen(false);
        setActiveIndex(-1);
        setOptions([]);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value: string = event.target.value;
        setQuery(value);
        if (value.length >= 2) setLoadingSuggestions(true);
        else {
            setLoadingSuggestions(false);
            setIsOpen(false);
            setActiveIndex(-1);
            setOptions([]);
        }
    };

    const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
                setIsOpen(true);
                setActiveIndex(0);
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!options.length) return;
            setActiveIndex((index: number) => (index + 1) % options.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!options.length) return;
            setActiveIndex((index: number) => (index - 1 + options.length) % options.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (activeIndex >= 0 && activeIndex < options.length) {
                onSelect(options[activeIndex]);
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsOpen(false);
        }
    };

    const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            const active = document.activeElement as HTMLElement | null;
            if (listRef.current && listRef.current.contains(active)) return;
            setIsOpen(false);
        }, 0);
    };

        const todayISO: string = useMemo(() => new Date().toISOString().slice(0,10), []);
  const maxStart: string = useMemo(() => {
    const date: Date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().slice(0,10);
  }, []);

  const onGenerate = () => {
    setLoading(true); setError(null);
    if (!selected) { setError('Please select a city'); setLoading(false); return; }
    if (!startDate) { setError('Please select a start date'); setLoading(false); return; }

    const canRun: boolean =
        typeof google !== 'undefined' &&
        !!google &&
        !!google.script &&
        !!google.script.run;

    if (!canRun) {
      setLoading(false);
      setError('Apps Script bridge not ready (google.script.run unavailable).');
      return;
    }

    const options = {
      cityCoord: selected.value,
      startDate,
      days,
      filters
    };
    google?.script.run
      .withSuccessHandler(() => { setLoading(false); })
      .withFailureHandler((e: any) => { setLoading(false); setError(String(e)); })
      .generateWeatherReport(options);
  };

  return (
        <div className="page">
            {/* CITY */}
            <section className="form-section">
                <label htmlFor="city-input" className="form-label">City*</label>

                <div
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-owns="city-listbox"
                    aria-haspopup="listbox"
                    className="combobox"
                >
                    <div className="input-with-spinner">
                        <input
                            id="city-input"
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={onChange}
                            onKeyDown={onInputKeyDown}
                            onBlur={onInputBlur}
                            placeholder="Type a city…"
                            aria-autocomplete="list"
                            aria-controls="city-listbox"
                            aria-activedescendant={
                                isOpen && activeIndex >= 0 ? `city-opt-${activeIndex}` : undefined
                            }
                            aria-busy={loadingSuggestions}
                            className="text-input"
                        />
                        {loadingSuggestions && (
                            <div className="spinner-slot">
                                <div className="input-spinner" aria-hidden="true" />
                            </div>
                        )}
                    </div>

                    {isOpen && (
                        <ul
                            id="city-listbox"
                            role="listbox"
                            className="suggestions"
                            ref={listRef}
                        >
                            {loadingSuggestions && (
                                <li className="suggestion loading" aria-live="polite">
                                    Loading suggestions…
                                </li>
                            )}

                            {!loadingSuggestions &&
                                !error &&
                                options.length === 0 &&
                                debouncedQuery.length >= 2 && (
                                    <li className="suggestion empty">No matches</li>
                                )}

                            {!loadingSuggestions &&
                                !error &&
                                options.map((option, number) => (
                                    <li
                                        id={`city-opt-${number}`}
                                        key={option.value}
                                        role="option"
                                        aria-selected={number === activeIndex}
                                        className={'suggestion' + (number === activeIndex ? ' active' : '')}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => onSelect(option)}
                                    >
                                        {option.label}
                                    </li>
                                ))}

                            {error && (
                                <li className="suggestion error" role="alert">
                                    {error}
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </section>

            {/* START DATE */}
            <section className="form-section">
                <label htmlFor="start-date" className="form-label">Start date*</label>
                <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    min={todayISO}
                    max={maxStart}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value)}
                    className="text-input"
                />
            </section>

            {/* DAYS */}
            <section className="form-section">
                <label htmlFor="days" className="form-label">Days*</label>
                <input
                    id="days"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={3}
                    value={days}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const raw: string = event.target.value;
                        if (raw === '') { setDays(1); return; }
                        const num: number = Number(raw);
                        if (Number.isNaN(num)) return;
                        if (num < 1) setDays(1);
                        else if (num > 3) setDays(3);
                        else setDays(num);
                    }}
                    onBlur={() => {
                        if (!days) setDays(1);
                    }}
                    className="text-input narrow"
                    aria-describedby="days-help"
                    onBeforeInput={(event: React.InputEvent<HTMLInputElement>) => event.preventDefault()}
                    onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => event.preventDefault()}
                    onDrop={(event: React.DragEvent<HTMLInputElement>) => event.preventDefault()}

                />
                <small id="days-help" className="help-text">Allowed values: 1, 2, or 3</small>
            </section>

            {/* FILTERS */}
            <fieldset className="form-section">
                <legend className="form-label">Filters</legend>
                <label className="check-row">
                    <input
                        type="checkbox"
                        checked={!!filters.temp}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilters((filters) => ({ ...filters, temp: event.target.checked }))}
                    />
                    <span>Temperature</span>
                </label>
                <label className="check-row">
                    <input
                        type="checkbox"
                        checked={!!filters.wind}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilters((filters) => ({ ...filters, wind: event.target.checked }))}
                    />
                    <span>Wind</span>
                </label>
                <label className="check-row">
                    <input
                        type="checkbox"
                        checked={!!filters.condition}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFilters((filters) => ({ ...filters, condition: event.target.checked }))}
                    />
                    <span>Condition</span>
                </label>
            </fieldset>

            {/* ACTION */}
            <section className="form-section">
                <button className="primary-btn" onClick={onGenerate} disabled={loading}>
                    Generate report
                </button>
            </section>

            {loading && <p className="status">Generating…</p>}
            {error && <p className="status error">{error}</p>}
        </div>

  );
}

function useDebounce<T>(value: T, delay: number = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const h = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(h);
    }, [value, delay]);
    return debounced;
}
