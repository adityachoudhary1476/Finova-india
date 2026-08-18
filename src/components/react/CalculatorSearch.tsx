import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { categories, liveCalculators } from '../../data/calculators';
import './CalculatorSearch.css';

const suggestions = ['EMI', 'SIP', 'Income Tax', 'Salary', 'FD'] as const;
const categoryLabels = new Map(categories.map((category) => [category.id, category.title]));

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export default function CalculatorSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('en-IN');
    if (!normalizedQuery) return [];

    return liveCalculators
      .filter((calculator) => {
        const searchableText = [
          calculator.name,
          calculator.shortName,
          calculator.description,
          ...calculator.aliases,
        ].join(' ').toLocaleLowerCase('en-IN');

        return searchableText.includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (first.status === second.status) return first.name.localeCompare(second.name);
        return first.status === 'popular' ? -1 : 1;
      })
      .slice(0, 7);
  }, [query]);

  const chooseSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasQuery = query.trim().length > 0;
  const showResults = isOpen && hasQuery;

  return (
    <div className="calculator-search" role="search" aria-label="Find a financial calculator">
      <label htmlFor="calculator-search-input">Find the right calculator</label>
      <div className={`calculator-search__field${showResults ? ' calculator-search__field--open' : ''}`}>
        <span className="calculator-search__icon"><SearchIcon /></span>
        <input
          ref={inputRef}
          id="calculator-search-input"
          type="search"
          name="calculator"
          value={query}
          placeholder="Search for a calculator..."
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => hasQuery && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {hasQuery && (
          <button
            className="calculator-search__clear"
            type="button"
            aria-label="Clear calculator search"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
          >
            <ClearIcon />
          </button>
        )}
        <kbd aria-hidden="true">/</kbd>
      </div>

      {showResults && (
        <div className="calculator-search__results" id="calculator-search-results" aria-live="polite">
          {matches.length > 0 ? (
            <>
              <p className="calculator-search__result-count">
                {matches.length} {matches.length === 1 ? 'match' : 'matches'} in the catalogue
              </p>
              <ul>
                {matches.map((calculator) => (
                  <li key={calculator.id}>
                    <a
                      href={calculator.route}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="calculator-search__result-mark" aria-hidden="true">₹</span>
                      <span className="calculator-search__result-copy">
                        <strong>{calculator.name}</strong>
                        <span>{calculator.description}</span>
                      </span>
                      <span className="calculator-search__category">
                        {categoryLabels.get(calculator.category)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="calculator-search__empty">
              <strong>No calculator found yet.</strong>
              <span>Try a broader term such as “loan”, “tax” or “investment”.</span>
            </div>
          )}
        </div>
      )}

      <div className="calculator-search__suggestions" aria-label="Popular search suggestions">
        <span>Try</span>
        <div>
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => chooseSuggestion(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
