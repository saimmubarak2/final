// src/api/aiProcessing.js
/**
 * AI Processing API Module
 * Handles communication with the AI backend for blueprint processing
 */

// AI Processing backend URL - runs locally
const AI_API_BASE_URL = "http://localhost:5001";

/**
 * Process a blueprint through the full AI pipeline
 * Phase 2: Match to filled blueprint using embeddings
 * Phase 3: Detect symbols using YOLO
 * 
 * @param {string} nonSkinnedImage - Base64 encoded non-skinned PNG
 * @param {string} skinnedImage - Base64 encoded skinned PNG (optional)
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing results
 */
export const processFullPipeline = async (nonSkinnedImage, skinnedImage = null, options = {}) => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/api/process-full-pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        non_skinned_image: nonSkinnedImage,
        skinned_image: skinnedImage,
        min_similarity: options.minSimilarity || 0.7,
        conf_threshold: options.confThreshold || 0.25,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI processing failed');
    }

    return await response.json();
  } catch (error) {
    console.error('AI Pipeline Error:', error);
    throw error;
  }
};

/**
 * Process a blueprint to find matching filled blueprint (Phase 2 only)
 * 
 * @param {string} image - Base64 encoded PNG image
 * @param {number} minSimilarity - Minimum similarity threshold (0-1)
 * @returns {Promise<Object>} Matching result
 */
export const processBlueprint = async (image, minSimilarity = 0.7) => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/api/process-blueprint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        min_similarity: minSimilarity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Blueprint processing failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Blueprint Processing Error:', error);
    throw error;
  }
};

/**
 * Detect symbols in a processed blueprint image (Phase 3 only)
 * 
 * @param {string} image - Base64 encoded PNG image
 * @param {number} confThreshold - Confidence threshold (0-1)
 * @returns {Promise<Object>} Detection results
 */
export const detectSymbols = async (image, confThreshold = 0.25) => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/api/detect-symbols`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        conf_threshold: confThreshold,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Symbol detection failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Symbol Detection Error:', error);
    throw error;
  }
};

/**
 * Parse a YOLO class name to extract properties
 * 
 * @param {string} className - The class name from YOLO detection
 * @returns {Promise<Object>} Parsed properties
 */
export const parseClassName = async (className) => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/api/parse-class-name`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class_name: className,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Class name parsing failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Class Name Parsing Error:', error);
    throw error;
  }
};

/**
 * Client-side class name parser (for faster responses)
 * 
 * @param {string} className - The class name from YOLO detection
 * @returns {Object} Parsed properties
 */
export const parseClassNameLocal = (className) => {
  const result = {
    originalClass: className,
    category: 'Unknown',
    flowering: false,
    size: 'medium',
    isFruiting: false,
    leafType: null,
    growthType: null,
    displayName: className
  };

  const classLower = className.toLowerCase();
  const parts = className.split('_');

  // Determine category
  if (classLower.startsWith('tree')) {
    result.category = 'Tree';
  } else if (classLower.startsWith('shrub')) {
    result.category = 'Shrub';
  } else if (classLower.startsWith('perennial')) {
    result.category = 'Perennial';
  } else if (classLower.startsWith('annual')) {
    result.category = 'Annual';
  } else if (classLower.startsWith('climber')) {
    result.category = 'Climber';
  } else if (classLower.startsWith('rock')) {
    result.category = 'Rock';
  } else if (classLower.includes('pot') || classLower.includes('flowerpot')) {
    result.category = 'FlowerPot';
  } else if (classLower === 'objects') {
    result.category = 'Object';
  }

  // Check flowering
  if (classLower.includes('flowering') && !classLower.includes('nonflowering')) {
    result.flowering = true;
  }

  // Check fruiting
  if (classLower.includes('fruiting') && !classLower.includes('nonfruiting')) {
    result.isFruiting = true;
  }

  // Determine size
  const heightSizes = { 'height1': 'small', 'height2': 'medium', 'height3': 'large', 'height4': 'large' };
  const canopySizes = { 'canopysize1': 'small', 'canopysize2': 'medium', 'canopysize3': 'large', 'canopysize4': 'large' };
  
  for (const part of parts) {
    const partLower = part.toLowerCase();
    if (heightSizes[partLower]) {
      result.size = heightSizes[partLower];
      break;
    }
    if (canopySizes[partLower]) {
      result.size = canopySizes[partLower];
      break;
    }
    if (partLower.includes('small')) result.size = 'small';
    if (partLower.includes('medium')) result.size = 'medium';
    if (partLower.includes('large')) result.size = 'large';
  }

  // Leaf type
  if (classLower.includes('broadleaf')) result.leafType = 'Broad Leaf';
  else if (classLower.includes('thinleaf')) result.leafType = 'Thin Leaf';
  else if (classLower.includes('needleleaf')) result.leafType = 'Needle Leaf';
  else if (classLower.includes('palm')) result.leafType = 'Palm';

  // Growth type
  if (classLower.includes('evergreen') || classLower.includes('ecergreen')) {
    result.growthType = 'Evergreen';
  } else if (classLower.includes('deciduous')) {
    result.growthType = 'Deciduous';
  }

  // Create display name
  const displayParts = [result.category];
  if (result.size !== 'medium') {
    displayParts.push(`(${result.size})`);
  }
  if (result.flowering) displayParts.push('🌸');
  if (result.isFruiting) displayParts.push('🍎');
  if (result.leafType) displayParts.push(`[${result.leafType}]`);
  
  result.displayName = displayParts.join(' ');

  return result;
};

/**
 * Get sample blueprints for testing
 * 
 * @returns {Promise<Object>} Sample blueprints
 */
export const getSampleBlueprints = async () => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/api/sample-blueprints`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get sample blueprints');
    }

    return await response.json();
  } catch (error) {
    console.error('Sample Blueprints Error:', error);
    throw error;
  }
};

/**
 * Check AI service health
 * 
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health Check Error:', error);
    return { status: 'unhealthy', error: error.message };
  }
};

/**
 * Get category color for display
 * 
 * @param {string} category - Plant category
 * @returns {string} Hex color code
 */
export const getCategoryColor = (category) => {
  const colors = {
    'Tree': '#228B22',
    'Shrub': '#32CD32',
    'Perennial': '#9370DB',
    'Annual': '#FF69B4',
    'Climber': '#8B4513',
    'Rock': '#808080',
    'FlowerPot': '#FF6347',
    'Object': '#4169E1',
    'Other': '#FFD700',
    'Unknown': '#999999'
  };
  return colors[category] || colors['Unknown'];
};

export default {
  processFullPipeline,
  processBlueprint,
  detectSymbols,
  parseClassName,
  parseClassNameLocal,
  getSampleBlueprints,
  checkHealth,
  getCategoryColor,
};
