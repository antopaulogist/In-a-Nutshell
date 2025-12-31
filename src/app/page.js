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

  /**
   * parseResponse
   * Splits the raw API text into structured sections.
   * Expected format:
   * 1. In a Nutshell
   * ...
   * 2. The Essentials
   * ...
   * 3. Why it Matters
   * ...
   */
  const parseResponse = (text) => {
    // We use a regex to split but keep the headers or just strict splitting.
    // The prompt guarantees strict headers: "1. In a Nutshell", "2. The Essentials", "3. Why it Matters".
    
    // Strategy: Split by the numeric headers.
    const parts = text.split(/(?:^|\n)(?=\d\.\s)/);
    
    const sections = {
      nutshell: '',
      essentials: '',
      context: ''
    };

    parts.forEach(part => {
      part = part.trim();
      if (part.startsWith('1. In a Nutshell')) {
        sections.nutshell = part.replace(/^1\.\s+In a Nutshell\s*/i, '').trim();
      } else if (part.startsWith('2. The Essentials')) {
        sections.essentials = part.replace(/^2\.\s+The Essentials\s*/i, '').trim();
      } else if (part.startsWith('3. Why it Matters')) {
        // Handle potential variations like "Why It Matters" if model drifts, but strict prompt usually works.
        sections.context = part.replace(/^3\.\s+Why it Matters\s*/i, '').replace(/^3\.\s+Why It Matters\s*/i, '').trim();
      }
    });

    return sections;
  };

  const structuredResult = result ? parseResponse(result) : null;

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

      {structuredResult && (
        <div className="result-container">
          
          {/* Section 1: In a Nutshell (The Summary) - Styled Distinctly */}
          <div className="section-block nutshell-block">
            <h2 className="section-title">In a Nutshell</h2>
            <div className="section-content">
              {structuredResult.nutshell || "Analysing..."}
            </div>
          </div>

          {/* Section 2: The Essentials (The Details) */}
          <div className="section-block essentials-block">
            <h2 className="section-title">The Essentials</h2>
            <div className="section-content">
              {structuredResult.essentials}
            </div>
          </div>

          {/* Section 3: Why it Matters (The Context) */}
          <div className="section-block context-block">
            <h2 className="section-title">Why it Matters</h2>
            <div className="section-content">
              {structuredResult.context}
            </div>
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
