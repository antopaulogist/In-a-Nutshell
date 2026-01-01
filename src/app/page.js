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
  // Copy feedback state
  const [copyFeedback, setCopyFeedback] = useState('');

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

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      if (!data.result) {
        throw new Error('No result returned');
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleGenerate();
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        setCopyFeedback('Copied to clipboard!');
        setTimeout(() => setCopyFeedback(''), 2000);
      } catch (err) {
        setCopyFeedback('Failed to copy');
        setTimeout(() => setCopyFeedback(''), 2000);
      }
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

    console.log('=== PARSING RESPONSE ===');

    // More robust section splitting with dynamic title capture
    // 1. [Dynamic Title]
    // 2. The Essentials
    // 3. Why it Matters

    // Capture the first section including its title
    const nutshellMatch = text.match(/1\.\s*In a Nutshell[:\s]*\n([\s\S]*?)(?=\n\s*2\.\s*The Essentials|$)/i);
    const essentialsMatch = text.match(/2\.\s*The Essentials[:\s]*\n([\s\S]*?)(?=\n\s*3\.\s*Why it Matters|$)/i);
    const contextMatch = text.match(/3\.\s*Why it Matters[:\s]*\n([\s\S]*?)$/i);

    if (nutshellMatch) sections.nutshell = nutshellMatch[1].trim();

    if (essentialsMatch) sections.essentials = essentialsMatch[1].trim();
    if (contextMatch) sections.context = contextMatch[1].trim();

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
    if (!text) {
      console.log('renderEssentials: No text provided');
      return null;
    }

    console.log('=== ESSENTIALS DEBUG ===');
    console.log('Raw essentials text:', text);
    console.log('Text length:', text.length);

    let rawItems = [];

    // More robust splitting: look for lines that start with a number followed by period and space
    // Split on newlines first, then group by numbered items
    const lines = text.split('\n');
    let currentBlock = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Check if this line starts with a number (1. 2. 3. etc)
      const isNumberedItem = /^\d+\.\s/.test(trimmedLine);

      if (isNumberedItem) {
        // If we have a current block, save it first
        if (currentBlock.length > 0) {
          rawItems.push(currentBlock.join('\n'));
        }
        // Start a new block with this line
        currentBlock = [trimmedLine];
      } else if (trimmedLine) {
        // Add non-empty lines to the current block
        currentBlock.push(trimmedLine);
      }
    });

    // Don't forget the last block
    if (currentBlock.length > 0) {
      rawItems.push(currentBlock.join('\n'));
    }

    console.log('Parsed items count:', rawItems.length);
    if (rawItems.length > 0) {
      console.log('First item preview:', rawItems[0].substring(0, 100));
    }

    if (rawItems.length === 0) {
      return (
        <div className="essentials-grid">
          <div className="essential-card">
            <div className="essential-header">
              <h3 className="essential-title">Parsing Error</h3>
            </div>
            <div className="essential-details">
              <div className="essential-row">
                <div className="essential-value">
                  Could not parse the essentials section. Check browser console for details.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="essentials-grid">
        {rawItems.map((itemBlock, index) => {
          // Clean up the block
          const lines = itemBlock.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length === 0) return null;

          // Line 0 is the Title. Remove any leading number if present for clean display.
          let titleLine = lines[0].replace(/^\d+\.\s*/, '');

          // Remaining lines are attributes.
          const attributes = lines.slice(1);

          return (
            <div key={index} className="essential-card">
              <div className="essential-header">
                <h3 className="essential-title">{titleLine}</h3>
              </div>

              <div className="essential-details">
                {attributes.map((line, i) => {
                  // Parse the attribute line
                  const parts = line.split(':');
                  if (parts.length > 1) {
                    const label = parts[0].trim();
                    const content = parts.slice(1).join(':').trim();

                    // Special rendering for Vibe - render as pill tags
                    if (/^Vibe$/i.test(label)) {
                      // Split the vibe content by commas or semicolons
                      const vibeTags = content.split(/[,;]/).map(v => v.trim()).filter(v => v);
                      return (
                        <div key={i} className="essential-row">
                          <div className="essential-label">{label}</div>
                          <div className="vibe-tags">
                            {vibeTags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="vibe-tag">{tag}</span>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Regular attribute rendering
                    return (
                      <div key={i} className="essential-row">
                        <div className="essential-label">{label}</div>
                        <div className="essential-value">{content}</div>
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
          <span className="subtitle">Appear knowledgeable at all times.</span>
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
      {copyFeedback && <div className="error-message" style={{ background: 'var(--accent-yellow)' }}>{copyFeedback}</div>}

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
