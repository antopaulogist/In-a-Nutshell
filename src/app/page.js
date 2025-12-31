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
   * Tolerates case variations and slight formatting differences.
   */
  const parseResponse = (text) => {
    const sections = {
      nutshell: '',
      essentials: '',
      context: ''
    };

    // Split by the numeric headers "1.", "2.", "3."
    // We use a lookahead to keep the delimiter or just split strictly
    const parts = text.split(/(?:^|\n)(?=[123]\.\s)/);

    parts.forEach(part => {
      const cleanPart = part.trim();
      if (/^1\.\s+In a Nutshell/i.test(cleanPart)) {
        sections.nutshell = cleanPart.replace(/^1\.\s+In a Nutshell[:\s]*/i, '').trim();
      } else if (/^2\.\s+The Essentials/i.test(cleanPart)) {
        sections.essentials = cleanPart.replace(/^2\.\s+The Essentials[:\s]*/i, '').trim();
      } else if (/^3\.\s+Why it Matters/i.test(cleanPart)) {
        sections.context = cleanPart.replace(/^3\.\s+Why it Matters[:\s]*/i, '').trim();
      }
    });

    return sections;
  };

  /**
   * renderEssentials
   * Formats the essentials list for the "Mega Obvious" hierarchy.
   * Expects blocks like:
   * 1. Title
   * What is it?: ...
   * Important because: ...
   * Vibe: ...
   */
  const renderEssentials = (text) => {
    if (!text) return null;

    // Split by numbered items (e.g., "\n1. ", "\n2. ")
    // We use a positive lookahead to find the start of a new item without consuming it,
    // getting an array of item strings.
    const rawItems = text.split(/(?:\n|^)(?=\d+\.\s)/).filter(item => item.trim());

    return (
      <div className="essentials-grid">
        {rawItems.map((itemBlock, index) => {
          // Clean up the block
          const lines = itemBlock.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length === 0) return null;

          // Line 0 is usually "1. Title - Author"
          // We remove the number for the display title
          let titleLine = lines[0].replace(/^\d+\.\s*/, '');

          // Remaining lines are attributes. We map them to specific fields if possible, or just render them.
          // The prompt enforces: "What is it?:", "Important because?:", "Vibe:"
          const attributes = lines.slice(1);

          return (
            <div key={index} className="essential-card">
              <div className="essential-header">
                <h3 className="essential-title">{titleLine}</h3>
              </div>

              <div className="essential-details">
                {attributes.map((line, i) => {
                  // highlight the prefix if present
                  const parts = line.split(':');
                  if (parts.length > 1) {
                    const label = parts[0];
                    const content = parts.slice(1).join(':');
                    return (
                      <div key={i} className="essential-row">
                        <span className="essential-label">{label}:</span>
                        <span className="essential-value">{content}</span>
                      </div>
                    );
                  }
                  return <div key={i} className="essential-row">{line}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
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

          {/* Section 1: In a Nutshell (The Summary) */}
          <div className="section-block nutshell-block">
            <h2 className="section-title">In a Nutshell</h2>
            <div className="section-content nutshell-content">
              {structuredResult.nutshell || "Analysing..."}
            </div>
          </div>

          {/* Section 2: The Essentials (The Details) */}
          <div className="section-block essentials-block">
            <h2 className="section-title">The Essentials</h2>
            <div className="section-content">
              {renderEssentials(structuredResult.essentials)}
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
