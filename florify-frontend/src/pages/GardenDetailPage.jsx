import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGarden, updateGarden, deleteGarden } from '../api/gardens';
import { getBlueprintByGarden } from '../api/blueprints';
import Button from '../components/Button';
import InputField from '../components/InputField';
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

  useEffect(() => {
    loadGarden();
    loadBlueprint();
  }, [gardenId]);

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
    } catch (err) {
      console.log('No blueprint found for this garden:', err.message);
      setBlueprint(null);
    }
  };

  const handleViewBlueprint = () => {
    if (!blueprint) return;

    // Get user ID from token
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

    // Open replit floorplan in new tab with edit mode and auto-navigate to export
    const blueprintUrl = `http://localhost:5174/?mode=edit&blueprint_id=${blueprint.blueprintId}&garden_id=${gardenId}&user_id=${userId}&auto_step=export`;
    window.open(blueprintUrl, '_blank', 'width=1200,height=800');
  };

  const handleCreateBlueprint = () => {
    // Get user ID from token
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

    // Open replit floorplan in new tab with create mode
    const blueprintUrl = `http://localhost:5174/?mode=create&garden_id=${gardenId}&user_id=${userId}`;
    const blueprintWindow = window.open(blueprintUrl, '_blank', 'width=1200,height=800');

    // Listen for blueprint data from child window
    const handleMessage = async (event) => {
      // Verify origin for security
      if (event.origin !== 'http://localhost:5174') return;

      if (event.data.type === 'BLUEPRINT_SAVED' && event.data.blueprintData) {
        try {
          // Save blueprint to backend
          const { createBlueprint } = await import('../api/blueprints');
          await createBlueprint({
            gardenId: gardenId,
            blueprintData: event.data.blueprintData,
            name: `${garden.name} Blueprint`
          });

          // Reload blueprint data
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
                    
                    {/* Display PNG image if available */}
                    {blueprint.pngImage && blueprint.pngImage !== "data:image/png;base64,placeholder" && (
                      <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                        <img 
                          src={blueprint.pngImage} 
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
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <Button 
                        onClick={handleViewBlueprint} 
                        variant="primary"
                      >
                        📐 View & Edit Blueprint
                      </Button>
                      
                      {/* Download PDF button if available */}
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