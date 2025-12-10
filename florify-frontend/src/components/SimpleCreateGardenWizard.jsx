// src/components/SimpleCreateGardenWizard.jsx
/**
 * Simple 4-Step Garden Creation Wizard
 * Step 1: Garden Name
 * Step 2: Location (City in Pakistan dropdown)
 * Step 3: Description
 * Step 4: Create Empty Garden (Opens Floorplan Builder)
 */

import React, { useState, useCallback } from 'react';
import Button from './Button';
import InputField from './InputField';
import TypewriterText from './TypewriterText';
import { createGarden } from '../api/gardens';
import { createBlueprint } from '../api/blueprints';
import '../styles/garden-wizard.css';

// Pakistan cities list
const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Dera Ghazi Khan',
  'Sahiwal',
  'Nawabshah',
  'Okara',
  'Mirpur Khas',
  'Chiniot',
  'Kamoke',
  'Sadiqabad',
  'Burewala',
  'Jacobabad',
  'Muzaffargarh',
  'Muridke',
  'Jhelum',
  'Shikarpur',
  'Hafizabad',
  'Kohat',
  'Khanewal',
  'Daska',
  'Gojra',
  'Mandi Bahauddin',
  'Abbottabad',
  'Tando Adam',
  'Jaranwala',
  'Khairpur',
  'Chishtian',
  'Attock',
  'Vehari',
  'Kot Addu',
  'Chakwal'
].sort();

const SimpleCreateGardenWizard = ({ onClose, onGardenCreated, userEmail }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGarden, setCreatedGarden] = useState(null);
  const [waitingForBlueprint, setWaitingForBlueprint] = useState(false);

  const steps = [
    { number: 1, title: 'Garden Name', description: 'Name your garden' },
    { number: 2, title: 'Location', description: 'Select city in Pakistan' },
    { number: 3, title: 'Description', description: 'Describe your garden' },
    { number: 4, title: 'Create Floorplan', description: 'Design your garden layout' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return formData.city !== '';
      case 3:
        return true; // Description is optional
      case 4:
        return createdGarden !== null;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Create garden and move to step 4
  const handleCreateGarden = async () => {
    if (!formData.name.trim() || !formData.city) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gardenData = {
        name: formData.name,
        description: formData.description,
        location: formData.city + ', Pakistan',
        userEmail: userEmail
      };

      const response = await createGarden(gardenData);
      const newGarden = response.garden;
      setCreatedGarden(newGarden);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message || 'Failed to create garden');
    } finally {
      setLoading(false);
    }
  };

  // Open floorplan builder
  const handleOpenFloorplanBuilder = useCallback(() => {
    if (!createdGarden) {
      setError('Garden must be created first');
      return;
    }

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
    const blueprintUrl = `http://localhost:5174/?mode=create&garden_id=${createdGarden.gardenId}&user_id=${userId}`;
    window.open(blueprintUrl, '_blank', 'width=1200,height=900');
    setWaitingForBlueprint(true);

    // Listen for blueprint data from child window
    const handleMessage = async (event) => {
      // Verify origin for security
      if (event.origin !== 'http://localhost:5174') return;

      if (event.data.type === 'BLUEPRINT_SAVED' && event.data.blueprintData) {
        try {
          console.log('Received blueprint data:', event.data);
          
          // Save blueprint to backend
          await createBlueprint({
            gardenId: createdGarden.gardenId,
            blueprintData: event.data.blueprintData,
            pngImage: event.data.pngImage || 'data:image/png;base64,placeholder',
            pdfImage: event.data.pdfImage || 'data:application/pdf;base64,placeholder',
            skinnedPng: event.data.skinnedPng,
            nonSkinnedPng: event.data.nonSkinnedPng,
            name: `${formData.name} Blueprint`
          });

          // Close wizard and refresh
          window.removeEventListener('message', handleMessage);
          setWaitingForBlueprint(false);
          onGardenCreated(createdGarden);
        } catch (error) {
          console.error('Failed to save blueprint:', error);
          setError('Failed to save blueprint data');
          setWaitingForBlueprint(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [createdGarden, formData.name, onGardenCreated]);

  // Skip blueprint and finish
  const handleSkipBlueprint = () => {
    if (createdGarden) {
      onGardenCreated(createdGarden);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <TypewriterText delay={100}>
              <h3 className="step-title">What would you like to call your garden?</h3>
            </TypewriterText>
            <TypewriterText delay={200}>
              <p className="step-description">
                Choose a name that reflects your garden's personality and purpose.
              </p>
            </TypewriterText>
            <TypewriterText delay={300}>
              <div className="input-group">
                <label className="input-label">Garden Name*</label>
                <InputField
                  type="text"
                  name="name"
                  placeholder="e.g., My Backyard Paradise, Rose Garden"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </TypewriterText>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <TypewriterText delay={100}>
              <h3 className="step-title">Where is your garden located?</h3>
            </TypewriterText>
            <TypewriterText delay={200}>
              <p className="step-description">
                Select the city in Pakistan where your garden is located.
              </p>
            </TypewriterText>
            <TypewriterText delay={300}>
              <div className="input-group">
                <label className="input-label">City in Pakistan*</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="city-select"
                >
                  <option value="">-- Select a city --</option>
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </TypewriterText>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <TypewriterText delay={100}>
              <h3 className="step-title">Tell us about your garden</h3>
            </TypewriterText>
            <TypewriterText delay={200}>
              <p className="step-description">
                Add a description to help you remember what makes this garden special.
              </p>
            </TypewriterText>
            <TypewriterText delay={300}>
              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <textarea
                  name="description"
                  placeholder="Describe your garden layout, plants you want to grow, special features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="description-textarea"
                  rows="5"
                />
              </div>
            </TypewriterText>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <TypewriterText delay={100}>
              <h3 className="step-title">🎨 Create Your Garden Floorplan</h3>
            </TypewriterText>
            <TypewriterText delay={200}>
              <p className="step-description">
                Design your garden layout using our interactive floorplan builder.
                You can create plot boundaries, house shapes, add pathways, driveways, and more!
              </p>
            </TypewriterText>
            <TypewriterText delay={300}>
              <div className="blueprint-section">
                <div className="blueprint-icon">📐</div>
                <p className="blueprint-info">
                  Your garden "<strong>{formData.name}</strong>" has been created in <strong>{formData.city}</strong>!
                </p>
                <ul className="blueprint-features">
                  <li>✓ Define plot boundaries and house shape</li>
                  <li>✓ Add doors, walls, driveways, and pathways</li>
                  <li>✓ Design patios and garden areas</li>
                  <li>✓ Export with or without visual skins</li>
                </ul>
                
                {waitingForBlueprint ? (
                  <div className="waiting-indicator">
                    <div className="spinner"></div>
                    <p>Waiting for blueprint to be saved...</p>
                    <p className="hint">Complete your design in the floorplan builder and click "Save to Garden"</p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleOpenFloorplanBuilder} 
                    className="primary-btn blueprint-btn"
                  >
                    🎨 OPEN FLOORPLAN BUILDER
                  </Button>
                )}
                
                <p className="blueprint-hint">
                  You can also skip this step and add a blueprint later from the garden detail page.
                </p>
              </div>
            </TypewriterText>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <TypewriterText delay={100}>
          <h2 className="wizard-title">CREATE YOUR GARDEN</h2>
        </TypewriterText>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="wizard-progress">
        {steps.map((step) => (
          <div key={step.number} className={`progress-step ${currentStep >= step.number ? 'active' : ''}`}>
            <div className="step-number">{step.number}</div>
            <div className="step-info">
              <div className="step-title-small">{step.title}</div>
              <div className="step-desc-small">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {renderStepContent()}
        
        {error && <div className="error-message">{error}</div>}

        <div className="wizard-actions">
          {currentStep > 1 && currentStep < 4 && (
            <Button onClick={prevStep} className="secondary-btn">
              ← PREVIOUS
            </Button>
          )}
          
          {currentStep < 3 && (
            <Button 
              onClick={nextStep} 
              disabled={!validateStep(currentStep)}
              className="primary-btn"
            >
              NEXT →
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              onClick={handleCreateGarden} 
              disabled={loading || !formData.name.trim() || !formData.city}
              className="primary-btn"
            >
              {loading ? 'CREATING GARDEN...' : 'CREATE GARDEN & CONTINUE →'}
            </Button>
          )}
          
          {currentStep === 4 && (
            <Button 
              onClick={handleSkipBlueprint} 
              className="secondary-btn"
              disabled={waitingForBlueprint}
            >
              SKIP & FINISH
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleCreateGardenWizard;
