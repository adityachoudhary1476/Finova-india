import { useState } from 'react';

interface CalculatorActionsProps {
  onReset: () => void;
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
    </svg>
  );
}

export default function CalculatorActions({ onReset }: CalculatorActionsProps) {
  const [copyStatus, setCopyStatus] = useState('Copy link');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('Link copied');
      window.setTimeout(() => setCopyStatus('Copy link'), 1800);
    } catch {
      setCopyStatus('Copy unavailable');
      window.setTimeout(() => setCopyStatus('Copy link'), 1800);
    }
  };

  return (
    <div className="calculator-actions" aria-label="Calculator actions">
      <button type="button" onClick={onReset}><ResetIcon /> Reset</button>
      <button type="button" onClick={copyLink}><LinkIcon /> {copyStatus}</button>
    </div>
  );
}
