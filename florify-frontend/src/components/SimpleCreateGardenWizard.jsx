import React, { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import TypewriterText from './TypewriterText';
import { createGarden } from '../api/gardens';
import { createBlueprint } from '../api/blueprints';
import '../styles/garden-wizard.css';

const SimpleCreateGardenWizard = ({ onClose, onGardenCreated, userEmail }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGardenId, setCreatedGardenId] = useState(null);
  const [hasCalledCallback, setHasCalledCallback] = useState(false);
  const messageHandlerRef = React.useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Cleanup message listener on unmount
  React.useEffect(() => {
    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    // Clear error first
    setError('');
    
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Garden name is required');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.location.trim()) {
        setError('Location is required');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      setError('Garden name and location are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await createGarden(formData);
      const newGarden = response.garden;
      setCreatedGardenId(newGarden.gardenId);
      
      // Move to Step 4 (Blueprint)
      setCurrentStep(4);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle blueprint creation in new tab
  const handleCreateBlueprint = () => {
    if (!createdGardenId) {
      setError('Garden must be created first');
      return;
    }

    // Clear any previous errors
    setError('');

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
    const blueprintUrl = `http://localhost:5174/?mode=create&garden_id=${createdGardenId}&user_id=${userId}`;
    console.log('🌐 Opening blueprint editor:', blueprintUrl);
    const blueprintWindow = window.open(blueprintUrl, '_blank', 'width=1200,height=800');
    
    if (!blueprintWindow) {
      setError('Please allow pop-ups to use the blueprint editor');
      return;
    }

    // No need for postMessage listener - blueprint editor saves directly to API
    // User can close this wizard after opening the blueprint editor
  };

  // Skip blueprint and finish
  const handleSkipBlueprint = () => {
    // Clean up message listener if it exists
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    
    // Only call callback once
    if (!hasCalledCallback && onGardenCreated) {
      setHasCalledCallback(true);
      onGardenCreated({ gardenId: createdGardenId, ...formData });
    }
  };

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="form-group">
          <label htmlFor="garden-name">Garden Name *</label>
          <InputField
            id="garden-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter garden name"
            required
          />
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="form-group">
          <label htmlFor="garden-location">Location *</label>
          <InputField
            id="garden-location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter garden location"
            required
          />
        </div>
      );
    } else if (currentStep === 3) {
      return (
        <div className="form-group">
          <label htmlFor="garden-description">Description (Optional)</label>
          <textarea
            id="garden-description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter garden description (optional)"
            rows="4"
          />
        </div>
      );
    } else if (currentStep === 4) {
      return (
        <div className="blueprint-step">
          <div className="blueprint-icon">📐</div>
          <h3>Create Your Garden Blueprint</h3>
          <p className="blueprint-description">
            Design a detailed floor plan of your garden with our interactive blueprint editor. 
            This step is optional but helps visualize your garden layout.
          </p>
          <ul className="blueprint-features">
            <li>✓ Define plot boundaries and house shape</li>
            <li>✓ Add walls, doors, and pathways</li>
            <li>✓ Design driveways and patios</li>
            <li>✓ Export your design as PNG or PDF</li>
          </ul>
          <Button 
            onClick={handleCreateBlueprint} 
            className="primary-btn blueprint-btn"
            style={{ marginTop: '20px', width: '100%' }}
          >
            OPEN BLUEPRINT EDITOR 🎨
          </Button>
          <p className="blueprint-hint" style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
            Your garden has been saved. You can create a blueprint now or skip and add it later.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="garden-wizard">
      <div className="wizard-header">
        <h2>Create New Garden - Step {currentStep} of 4</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="wizard-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="wizard-form">
          {renderStepContent()}
          
          <div className="wizard-actions" style={{ marginTop: '30px' }}>
            {currentStep > 1 && currentStep !== 4 && (
              <Button 
                type="button" 
                onClick={handlePrevious}
                variant="secondary"
                className="back-btn"
              >
                ← PREVIOUS
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                className="next-btn"
              >
                NEXT →
              </Button>
            ) : currentStep === 3 ? (
              <Button 
                type="submit" 
                disabled={loading}
                className="submit-btn"
              >
                {loading ? 'CREATING GARDEN...' : 'CREATE GARDEN & CONTINUE →'}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSkipBlueprint}
                variant="secondary"
                className="skip-btn"
              >
                SKIP & FINISH
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleCreateGardenWizard;