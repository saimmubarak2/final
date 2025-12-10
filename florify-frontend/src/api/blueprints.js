// src/api/blueprints.js
import axios from "axios";

// Replace with your API Gateway Invoke URL after deployment
const API_BASE_URL = "https://jiazehdrvf.execute-api.eu-north-1.amazonaws.com/dev";

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Server error occurred';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your internet connection and try again.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
);

// ----------------- BLUEPRINT CRUD OPERATIONS -----------------

// Create a new blueprint
export const createBlueprint = async (blueprintData) => {
  try {
    console.log('📤 Creating blueprint with data:', {
      gardenId: blueprintData.gardenId,
      name: blueprintData.name,
      hasBlueprintData: !!blueprintData.blueprintData,
      blueprintDataSize: JSON.stringify(blueprintData.blueprintData).length
    });
    const response = await api.post('/blueprints', blueprintData);
    console.log('✅ Blueprint created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Blueprint creation failed:', error);
    throw error;
  }
};

// Get a specific blueprint by ID
export const getBlueprint = async (blueprintId) => {
  try {
    console.log('📥 Fetching blueprint by ID:', blueprintId);
    const response = await api.get(`/blueprints/${blueprintId}`);
    console.log('✅ Blueprint retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Blueprint retrieval failed:', error);
    throw error;
  }
};

// Get blueprint by garden ID
export const getBlueprintByGarden = async (gardenId) => {
  try {
    console.log('📥 Fetching blueprint by garden ID:', gardenId);
    const response = await api.get(`/gardens/${gardenId}/blueprint`);
    console.log('✅ Blueprint retrieved by garden:', response.data);
    return response.data;
  } catch (error) {
    // If blueprint doesn't exist, return null instead of throwing
    if (error.message === 'No blueprint found for this garden') {
      return { blueprint: null };
    }
    throw error;
  }
};

// Update an existing blueprint
export const updateBlueprint = async (blueprintId, blueprintData) => {
  try {
    const response = await api.put(`/blueprints/${blueprintId}`, blueprintData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  createBlueprint,
  getBlueprint,
  getBlueprintByGarden,
  updateBlueprint,
};
