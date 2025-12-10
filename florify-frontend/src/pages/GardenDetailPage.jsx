import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGarden, updateGarden, deleteGarden } from '../api/gardens';
import { getBlueprintByGarden, updateBlueprint } from '../api/blueprints';
import { processFullPipeline, checkHealth, getCategoryColor } from '../api/aiProcessing';
import Button from '../components/Button';
import InputField from '../components/InputField';
import InteractiveOverlay from '../components/InteractiveOverlay';
import './GardenDetailPage.css';

const GardenDetailPage = () => {
  const { gardenId } = useParams();
  const navigate = useNavigate();
  const [garden, setGarden] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    location: '',
    description: ''
  });
  
  // AI Processing states
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState('skinned'); // 'skinned', 'processed', 'labeled', 'overlay'

  useEffect(() => {
    loadGarden();
    loadBlueprint();
    checkAiService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gardenId]);

  const checkAiService = async () => {
    try {
      const health = await checkHealth();
      setAiServiceAvailable(health.status === 'healthy');
    } catch {
      setAiServiceAvailable(false);
    }
  };

  const loadGarden = async () => {
    try {
      setLoading(true);
      const response = await getGarden(gardenId);
      setGarden(response.garden);
      setEditData({
        name: response.garden.name,
        location: response.garden.location,
        description: response.garden.description || ''
      });
      
      // Load AI results if they exist
      if (response.garden.aiResults) {
        setAiResults(response.garden.aiResults);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBlueprint = async () => {
    try {
      const response = await getBlueprintByGarden(gardenId);
      console.log('Blueprint loaded:', response.blueprint);
      setBlueprint(response.blueprint);
      
      // Load AI results from blueprint if they exist
      if (response.blueprint?.aiResults) {
        setAiResults(response.blueprint.aiResults);
      }
    } catch (err) {
      console.log('No blueprint found for this garden:', err.message);
      setBlueprint(null);
    }
  };

  const handleGenerateLayout = async () => {
    if (!blueprint) {
      setAiError('Please create a blueprint first');
      return;
    }

    // Get the non-skinned and skinned images from the blueprint
    const nonSkinnedImage = blueprint.nonSkinnedPng || blueprint.pngImage;
    const skinnedImage = blueprint.skinnedPng || blueprint.pngImage;

    if (!nonSkinnedImage || nonSkinnedImage === "data:image/png;base64,placeholder") {
      setAiError('No blueprint image available. Please export your blueprint first.');
      return;
    }

    setAiProcessing(true);
    setAiError(null);

    try {
      console.log('Starting AI pipeline processing...');
      const results = await processFullPipeline(nonSkinnedImage, skinnedImage);
      
      console.log('AI Pipeline results:', results);
      
      if (results.success) {
        setAiResults(results);
        
        // Save AI results to the blueprint
        try {
          await updateBlueprint(blueprint.blueprintId, {
            aiResults: results
          });
          console.log('AI results saved to blueprint');
        } catch (saveErr) {
          console.error('Failed to save AI results:', saveErr);
        }
        
        setActiveTab('processed');
      } else {
        setAiError(results.error || 'AI processing failed');
      }
    } catch (err) {
      console.error('AI Processing Error:', err);
      setAiError(err.message || 'Failed to process blueprint');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleViewBlueprint = () => {
    if (!blueprint) return;

    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        userId = decoded.sub;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }

    const blueprintUrl = `http://localhost:5174/?mode=edit&blueprint_id=${blueprint.blueprintId}&garden_id=${gardenId}&user_id=${userId}&auto_step=export`;
    window.open(blueprintUrl, '_blank', 'width=1200,height=800');
  };

  const handleCreateBlueprint = () => {
    const token = localStorage.getItem('token');
    let userId = '';
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        userId = decoded.sub;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }

    const blueprintUrl = `http://localhost:5174/?mode=create&garden_id=${gardenId}&user_id=${userId}`;
    window.open(blueprintUrl, '_blank', 'width=1200,height=800');

    const handleMessage = async (event) => {
      if (event.origin !== 'http://localhost:5174') return;

      if (event.data.type === 'BLUEPRINT_SAVED' && event.data.blueprintData) {
        try {
          const { createBlueprint } = await import('../api/blueprints');
          await createBlueprint({
            gardenId: gardenId,
            blueprintData: event.data.blueprintData,
            name: `${garden.name} Blueprint`
          });

          window.removeEventListener('message', handleMessage);
          loadBlueprint();
        } catch (error) {
          console.error('Failed to save blueprint:', error);
          setError('Failed to save blueprint data');
        }
      }
    };

    window.addEventListener('message', handleMessage);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: garden.name,
      location: garden.location,
      description: garden.description || ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await updateGarden(gardenId, editData);
      setGarden(response.garden);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this garden?')) {
      try {
        setLoading(true);
        await deleteGarden(gardenId);
        navigate('/');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadCSV = () => {
    if (!aiResults?.csv) return;
    
    const blob = new Blob([aiResults.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${garden.name}-symbols.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAiResults = () => {
    if (!aiResults) return null;

    const { phase2, phase3, overlay_data } = aiResults;

    return (
      <div className="ai-results-section">
        <h3>🌿 Garden Layout Analysis</h3>
        
        {/* Tabs */}
        <div className="ai-tabs">
          <button 
            className={`ai-tab ${activeTab === 'skinned' ? 'active' : ''}`}
            onClick={() => setActiveTab('skinned')}
          >
            Skinned View
          </button>
          <button 
            className={`ai-tab ${activeTab === 'processed' ? 'active' : ''}`}
            onClick={() => setActiveTab('processed')}
          >
            Processed Blueprint
          </button>
          <button 
            className={`ai-tab ${activeTab === 'labeled' ? 'active' : ''}`}
            onClick={() => setActiveTab('labeled')}
          >
            Symbol Detection
          </button>
          {overlay_data && overlay_data.length > 0 && (
            <button 
              className={`ai-tab ${activeTab === 'overlay' ? 'active' : ''}`}
              onClick={() => setActiveTab('overlay')}
            >
              Interactive View
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="ai-tab-content">
          {activeTab === 'skinned' && blueprint?.pngImage && (
            <div className="image-container">
              <img 
                src={blueprint.pngImage.startsWith('data:') ? blueprint.pngImage : `data:image/png;base64,${blueprint.pngImage}`}
                alt="Skinned Blueprint"
                className="blueprint-image"
              />
              <p className="image-caption">Your garden blueprint with visual styling</p>
            </div>
          )}

          {activeTab === 'processed' && phase2?.filled_image_base64 && (
            <div className="image-container">
              <img 
                src={`data:image/png;base64,${phase2.filled_image_base64}`}
                alt="Processed Blueprint"
                className="blueprint-image"
              />
              <p className="image-caption">
                Matched blueprint (Similarity: {(phase2.similarity * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          {activeTab === 'labeled' && phase3?.labeled_image_base64 && (
            <div className="image-container">
              <img 
                src={`data:image/png;base64,${phase3.labeled_image_base64}`}
                alt="Symbol Detection"
                className="blueprint-image"
              />
              <p className="image-caption">
                YOLO symbol detection ({phase3.total_detections} symbols found)
              </p>
            </div>
          )}

          {activeTab === 'overlay' && overlay_data && blueprint?.pngImage && (
            <div className="overlay-container">
              <InteractiveOverlay
                imageBase64={blueprint.pngImage}
                markers={overlay_data}
                imageWidth={512}
                imageHeight={512}
              />
              <p className="image-caption">
                Hover over markers to see symbol details
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {phase3?.summary && (
          <div className="ai-summary">
            <h4>Detection Summary</h4>
            
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-number">{phase3.total_detections}</span>
                <span className="summary-label">Total Symbols</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{phase3.summary.flowering_count}</span>
                <span className="summary-label">🌸 Flowering</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{phase3.summary.fruiting_count}</span>
                <span className="summary-label">🍎 Fruiting</span>
              </div>
            </div>

            <div className="category-breakdown">
              <h5>By Category</h5>
              <div className="category-bars">
                {Object.entries(phase3.summary.by_category).map(([cat, count]) => (
                  <div key={cat} className="category-bar">
                    <span 
                      className="category-color" 
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    />
                    <span className="category-name">{cat}</span>
                    <span className="category-count">{count}</span>
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${(count / phase3.total_detections) * 100}%`,
                        backgroundColor: getCategoryColor(cat)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="size-distribution">
              <h5>Size Distribution</h5>
              <div className="size-chips">
                <span className="size-chip small">
                  Small: {phase3.summary.size_distribution.small}
                </span>
                <span className="size-chip medium">
                  Medium: {phase3.summary.size_distribution.medium}
                </span>
                <span className="size-chip large">
                  Large: {phase3.summary.size_distribution.large}
                </span>
              </div>
            </div>

            {aiResults.csv && (
              <Button onClick={downloadCSV} className="download-csv-btn">
                📊 Download CSV Report
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="garden-detail-page">
        <div className="loading">Loading garden details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="garden-detail-page">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="garden-detail-page">
        <div className="error">
          <h2>Garden Not Found</h2>
          <p>The garden you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="garden-detail-page">
      <div className="garden-detail-container">
        <div className="garden-header">
          <h1>{garden.name}</h1>
          <div className="garden-actions">
            {!isEditing ? (
              <>
                {blueprint && (
                  <Button onClick={handleViewBlueprint} variant="primary">
                    📐 View Blueprint
                  </Button>
                )}
                <Button onClick={handleEdit} variant="secondary">
                  Edit Garden
                </Button>
                <Button onClick={handleDelete} variant="danger">
                  Delete Garden
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="secondary">
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="garden-content">
          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="name">Garden Name</label>
                <InputField
                  id="name"
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter garden name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <InputField
                  id="location"
                  type="text"
                  value={editData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter garden location"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter garden description"
                  rows="4"
                />
              </div>
            </div>
          ) : (
            <div className="garden-info">
              <div className="info-section">
                <h3>Location</h3>
                <p>{garden.location}</p>
              </div>
              
              {garden.description && (
                <div className="info-section">
                  <h3>Description</h3>
                  <p>{garden.description}</p>
                </div>
              )}
              
              <div className="info-section">
                <h3>Garden Blueprint</h3>
                {blueprint ? (
                  <div>
                    <p style={{ color: '#4caf50', marginBottom: '10px' }}>
                      ✓ Blueprint created on {new Date(blueprint.createdAt).toLocaleDateString()}
                    </p>
                    
                    {blueprint.pngImage && blueprint.pngImage !== "data:image/png;base64,placeholder" && (
                      <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <img 
                          src={blueprint.pngImage.startsWith('data:') ? blueprint.pngImage : `data:image/png;base64,${blueprint.pngImage}`}
                          alt="Garden Blueprint" 
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto', 
                            border: '2px solid #e0e0e0', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }} 
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <Button 
                        onClick={handleViewBlueprint} 
                        variant="primary"
                      >
                        📐 View & Edit Blueprint
                      </Button>
                      
                      <Button 
                        onClick={handleGenerateLayout}
                        disabled={aiProcessing || !aiServiceAvailable}
                        variant="primary"
                        style={{ backgroundColor: '#10b981' }}
                      >
                        {aiProcessing ? '🔄 Processing...' : '🌿 Generate Garden Layout'}
                      </Button>
                      
                      {blueprint.pdfImage && blueprint.pdfImage !== "data:application/pdf;base64,placeholder" && (
                        <a 
                          href={blueprint.pdfImage} 
                          download={`${garden.name}-blueprint.pdf`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Button variant="secondary">
                            📄 Download PDF
                          </Button>
                        </a>
                      )}
                    </div>
                    
                    {!aiServiceAvailable && (
                      <p style={{ color: '#f59e0b', marginTop: '10px', fontSize: '14px' }}>
                        ⚠️ AI service is not available. Start the AI backend to enable garden layout generation.
                      </p>
                    )}
                    
                    {aiError && (
                      <p style={{ color: '#ef4444', marginTop: '10px' }}>
                        ❌ {aiError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#999', marginBottom: '10px' }}>
                      No blueprint created yet
                    </p>
                    <Button 
                      onClick={handleCreateBlueprint} 
                      variant="primary"
                      style={{ marginTop: '10px' }}
                    >
                      🎨 Create Blueprint
                    </Button>
                  </div>
                )}
              </div>
              
              {/* AI Results Section */}
              {(aiResults || aiProcessing) && (
                <div className="info-section">
                  {aiProcessing ? (
                    <div className="ai-processing-indicator">
                      <div className="spinner"></div>
                      <p>Processing your garden layout with AI...</p>
                      <p className="processing-steps">
                        Phase 2: Matching blueprint with embeddings database<br/>
                        Phase 3: Detecting garden symbols with YOLO
                      </p>
                    </div>
                  ) : (
                    renderAiResults()
                  )}
                </div>
              )}
              
              <div className="info-section">
                <h3>Created</h3>
                <p>{new Date(garden.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="garden-footer">
          <Button onClick={() => navigate('/')} variant="secondary">
            Back to Gardens
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GardenDetailPage;
