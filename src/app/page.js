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
        <p className="subtitle">The short, useful version of anything</p>
      </header>

      <section className="input-area">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter a topic (e.g. Existentialism, Bauhaus, Bitcoin)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={200}
            autoFocus
          />
        </div>

        {(!result || loading) && (
          <button
            className="primary"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
          >
            {loading ? 'Thinking...' : 'Get the nutshell'}
          </button>
        )}
      </section>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="result-container">
          {/* We format the raw text by splitting sections manually for better styling if possible? 
              The prompt guarantees sections: "In a Nutshell", "The Essentials", "Why It Matters".
              Let's try to wrap them in divs for the CSS to target headers if we can, or just display raw.
              Requirement said: "Render formatted text exactly as returned".
              So I will just use white-space: pre-wrap. But to differentiate sections, simple highlighting would be nice.
              However, to stay safe with "exactly as returned", I'll dump it in a pre-wrap div. 
              But I can make it look nicer if I bold the headers. 
              The text contains "1. In a Nutshell", etc. 
              I'll just render it as text. Simplicity is a goal.
          */}
          <div className="result-content result-text">
            {result}
          </div>

          <div className="actions">
            <button className="secondary" onClick={copyToClipboard}>
              Copy to clipboard
            </button>
            <button className="secondary" onClick={clearAll}>
              Clear / New topic
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
