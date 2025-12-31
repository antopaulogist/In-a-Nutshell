'use client';

import { useState } from 'react';

/**
 * Home Component
 * 
 * The main interface for the "In a Nutshell" application.
 * 
 * Features:
 * - Single text input for topics.
 * - Calls /api/generate to fetch summaries.
 * - Displays results in a clean, readable format.
 * - Provides Copy and Clear functionality.
 */
export default function Home() {
  // State for user input
  const [topic, setTopic] = useState('');
  // State for the generated content
  const [result, setResult] = useState('');
  // Loading state during API fetch
  const [loading, setLoading] = useState(false);
  // Error state for UI feedback
  const [error, setError] = useState('');

  /**
   * handleGenerate
   * Triggers the API call to generate the summary.
   */
  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setResult(data.result);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleGenerate();
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      // Optional: Show copied feedback
    }
  };

  const clearAll = () => {
    setTopic('');
    setResult('');
    setError('');
  };

  return (
    <main>
      <header>
        <h1>In a Nutshell</h1>
        <div>
          <span className="subtitle">The short, useful version of anything</span>
        </div>
      </header>

      <section className="input-area">
        <input
          type="text"
          placeholder="ENTER TOPIC..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={200}
          autoFocus
        />
        <button
          className="primary"
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
        >
          {loading ? 'WAIT' : 'GENERATE'}
        </button>
      </section>

      {error && <div className="error-message">ERROR: {error}</div>}

      {result && (
        <div className="result-container">
          <div className="result-content result-text">
            {result}
          </div>

          <div className="actions">
            <button className="secondary" onClick={copyToClipboard}>
              COPY TEXT
            </button>
            <button className="secondary" onClick={clearAll}>
              CLEAR / NEW
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
