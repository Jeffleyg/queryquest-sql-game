import React, { useState, useEffect } from 'react';
import '../styles/HelpModal.css';

interface SQLExample {
  title: string;
  description: string;
  query: string;
  category: string;
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
  const [activeTab, setActiveTab] = useState<'examples' | 'template'>('examples');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      fetchExamples();
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
        </div>
      </div>
    </div>
  );
}
