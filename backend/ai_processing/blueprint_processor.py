"""
Blueprint Processor Module
Handles embedding extraction and FAISS similarity search for blueprints.
"""

import os
import pickle
import numpy as np
from PIL import Image
import io
import base64

# Try importing torch and faiss, provide fallback if not available
try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
    import faiss
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: torch or faiss not available. Using mock mode.")


class BlueprintFeatureExtractor:
    """Extract features from blueprint images using MobileNetV2."""
    
    def __init__(self, model_path=None):
        if not TORCH_AVAILABLE:
            self.mock_mode = True
            return
            
        self.mock_mode = False
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load pretrained MobileNetV2
        self.model = models.mobilenet_v2(pretrained=True)
        # Remove classification head, keep only feature extraction
        self.model.classifier = nn.Identity()
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Load custom weights if provided
        if model_path and os.path.exists(model_path):
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict, strict=False)
            except Exception as e:
                print(f"Warning: Could not load custom weights: {e}")
        
        # Image preprocessing pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def extract_single(self, image):
        """Extract embedding from a single image."""
        if self.mock_mode:
            return np.random.randn(1280).astype(np.float32)
        
        if isinstance(image, str):
            # Load from file path
            image = Image.open(image).convert('RGB')
        elif isinstance(image, bytes):
            # Load from bytes
            image = Image.open(io.BytesIO(image)).convert('RGB')
        elif isinstance(image, np.ndarray):
            image = Image.fromarray(image).convert('RGB')
        
        # Preprocess
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Extract features
        with torch.no_grad():
            features = self.model(tensor)
        
        return features.cpu().numpy().flatten()
    
    def extract_batch(self, images):
        """Extract embeddings from multiple images."""
        return np.array([self.extract_single(img) for img in images])


class BlueprintMatcher:
    """Match input blueprints to filled blueprints using FAISS."""
    
    def __init__(self, db_path):
        """
        Initialize the matcher with the database path.
        
        Args:
            db_path: Path to the blueprint_embeddings_db folder
        """
        self.db_path = db_path
        self.feature_extractor = BlueprintFeatureExtractor(
            model_path=os.path.join(db_path, 'feature_extractor.pth')
        )
        
        # Load FAISS index
        self.index = None
        self.database = None
        self._load_database()
    
    def _load_database(self):
        """Load the FAISS index and database metadata."""
        if not TORCH_AVAILABLE:
            print("Running in mock mode - FAISS not available")
            return
            
        index_path = os.path.join(self.db_path, 'faiss_index.bin')
        db_path = os.path.join(self.db_path, 'database.pkl')
        
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            print(f"Loaded FAISS index with {self.index.ntotal} vectors")
        
        if os.path.exists(db_path):
            with open(db_path, 'rb') as f:
                self.database = pickle.load(f)
            print(f"Loaded database with {len(self.database.get('pairs', []))} pairs")
    
    def find_matching_blueprint(self, input_image, k=1, min_similarity=0.7):
        """
        Find the best matching filled blueprint for an input image.
        
        Args:
            input_image: Input blueprint image (PIL Image, path, or bytes)
            k: Number of top matches to consider
            min_similarity: Minimum similarity threshold
            
        Returns:
            dict with 'filled_path', 'similarity', 'filled_image_base64'
        """
        # Mock mode for development
        if not TORCH_AVAILABLE or self.index is None:
            return self._mock_match(input_image)
        
        # Extract embedding from input image
        embedding = self.feature_extractor.extract_single(input_image)
        
        # Normalize for cosine similarity
        embedding = embedding / np.linalg.norm(embedding)
        embedding = embedding.reshape(1, -1).astype(np.float32)
        
        # Search FAISS index
        scores, indices = self.index.search(embedding, k)
        
        best_score = scores[0][0]
        best_idx = indices[0][0]
        
        if best_score < min_similarity:
            return {
                'success': False,
                'message': f'No match found above threshold {min_similarity}',
                'best_similarity': float(best_score)
            }
        
        # Get the corresponding filled blueprint path
        pairs = self.database.get('pairs', [])
        if best_idx < len(pairs):
            empty_path, filled_path = pairs[best_idx]
            
            # Convert to local path
            filled_local_path = os.path.join(
                self.db_path, 'png_cache', 'filled', 
                os.path.basename(filled_path)
            )
            
            # Load and encode the filled image
            filled_image_base64 = None
            if os.path.exists(filled_local_path):
                with open(filled_local_path, 'rb') as f:
                    filled_image_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            return {
                'success': True,
                'filled_path': filled_local_path,
                'similarity': float(best_score),
                'filled_image_base64': filled_image_base64,
                'match_index': int(best_idx)
            }
        
        return {
            'success': False,
            'message': 'Index out of range',
            'best_idx': int(best_idx)
        }
    
    def _mock_match(self, input_image):
        """Return a mock match for development without full dependencies."""
        # Use a sample filled blueprint
        sample_filled_path = os.path.join(
            self.db_path, 'png_cache', 'filled', '0000.png'
        )
        
        filled_image_base64 = None
        if os.path.exists(sample_filled_path):
            with open(sample_filled_path, 'rb') as f:
                filled_image_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        return {
            'success': True,
            'filled_path': sample_filled_path,
            'similarity': 0.85,
            'filled_image_base64': filled_image_base64,
            'match_index': 0,
            'mock': True
        }


def process_blueprint_to_embedding(image_data, db_path):
    """
    Process an input blueprint and find matching filled blueprint.
    
    Args:
        image_data: Base64 encoded PNG image
        db_path: Path to blueprint embeddings database
        
    Returns:
        dict with processed blueprint info
    """
    matcher = BlueprintMatcher(db_path)
    
    # Decode base64 image
    if image_data.startswith('data:image'):
        # Remove data URL prefix
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    
    # Find matching filled blueprint
    result = matcher.find_matching_blueprint(image_bytes)
    
    return result
