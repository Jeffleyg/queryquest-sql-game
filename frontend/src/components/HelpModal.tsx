import React, { useState, useEffect } from 'react';
import '../styles/HelpModal.css';

interface SQLExample {
  title: string;
  description: string;
  query: string;
  category: string;
}

interface SQLManualSection {
  title: string;
  scenario: string;
  schema: string;
  exampleQuery: string;
  explanation: string;
  realWorld: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMissionId?: string;
  onUseTemplate?: (query: string) => void;
}

export function HelpModal({ isOpen, onClose, currentMissionId, onUseTemplate }: HelpModalProps) {
  const [examples, setExamples] = useState<SQLExample[]>([]);
  const [template, setTemplate] = useState<string>('');
  const [manualSections, setManualSections] = useState<SQLManualSection[]>([]);
  const [activeTab, setActiveTab] = useState<'examples' | 'template' | 'manual'>('examples');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      fetchExamples();
      fetchManual();
      if (currentMissionId) {
        fetchTemplate();
      }
    }
  }, [isOpen, currentMissionId]);

  const fetchExamples = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/help/examples');
      const data = await response.json();
      setExamples(data.examples);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/help/template/${currentMissionId}`);
      const data = await response.json();
      setTemplate(data.template);
    } catch (error) {
      console.error('Failed to fetch template:', error);
    }
  };

  const fetchManual = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/help/manual');
      const data = await response.json();
      setManualSections(data.sections);
    } catch (error) {
      console.error('Failed to fetch manual:', error);
    }
  };

  const handleUseExample = (query: string) => {
    if (onUseTemplate) {
      onUseTemplate(query);
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(examples.map(e => e.category)))];
  const filteredExamples = selectedCategory === 'All' 
    ? examples 
    : examples.filter(e => e.category === selectedCategory);

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>📚 SQL Help</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="help-tabs">
          <button 
            className={activeTab === 'examples' ? 'active' : ''}
            onClick={() => setActiveTab('examples')}
          >
            Examples
          </button>
          <button 
            className={activeTab === 'manual' ? 'active' : ''}
            onClick={() => setActiveTab('manual')}
          >
            Manual
          </button>
          {currentMissionId && (
            <button 
              className={activeTab === 'template' ? 'active' : ''}
              onClick={() => setActiveTab('template')}
            >
              Mission Template
            </button>
          )}
        </div>

        <div className="help-modal-content">
          {activeTab === 'examples' && (
            <>
              <div className="category-filters">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="examples-grid">
                {filteredExamples.map((example, index) => (
                  <div key={index} className="example-card">
                    <div className="example-header">
                      <h3>{example.title}</h3>
                      <span className="example-category">{example.category}</span>
                    </div>
                    <p className="example-description">{example.description}</p>
                    <pre className="example-query">{example.query}</pre>
                    <button 
                      className="use-button"
                      onClick={() => handleUseExample(example.query)}
                    >
                      Use this query
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'template' && template && (
            <div className="template-section">
              <p className="template-description">
                Here's a starting template based on this mission's requirements:
              </p>
              <pre className="template-code">{template}</pre>
              <button 
                className="use-template-button"
                onClick={() => handleUseExample(template)}
              >
                Use Template
              </button>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="manual-section">
              {manualSections.map((section, index) => (
                <div key={index} className="manual-card">
                  <div className="manual-header">
                    <h3>{section.title}</h3>
                    <span className="manual-badge">Vida real</span>
                  </div>
                  <p className="manual-scenario">{section.scenario}</p>
                  <div className="manual-grid">
                    <div className="manual-block">
                      <div className="manual-label">Schema</div>
                      <pre className="manual-code">{section.schema}</pre>
                    </div>
                    <div className="manual-block">
                      <div className="manual-label">SQL</div>
                      <pre className="manual-code">{section.exampleQuery}</pre>
                      <button
                        className="use-button"
                        onClick={() => handleUseExample(section.exampleQuery)}
                      >
                        Use this query
                      </button>
                    </div>
                  </div>
                  <p className="manual-explanation">{section.explanation}</p>
                  <div className="manual-real-world">{section.realWorld}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
