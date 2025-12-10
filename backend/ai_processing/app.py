"""
Flask API Server for Blueprint AI Processing
Handles Phase 2 (blueprint matching) and Phase 3 (YOLO symbol detection)
"""

import os
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import local modules
from blueprint_processor import BlueprintMatcher, process_blueprint_to_embedding
from symbol_detector import SymbolDetector, detect_symbols, generate_csv_from_detections, ClassNameParser

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EMBEDDINGS_DB_PATH = os.path.join(BASE_DIR, '..', 'blueprint_embeddings_db')
YOLO_MODEL_PATH = os.path.join(BASE_DIR, '..', '..', 'best (2).pt')

# Initialize components (lazy loading)
_blueprint_matcher = None
_symbol_detector = None


def get_blueprint_matcher():
    """Get or create blueprint matcher instance."""
    global _blueprint_matcher
    if _blueprint_matcher is None:
        _blueprint_matcher = BlueprintMatcher(EMBEDDINGS_DB_PATH)
    return _blueprint_matcher


def get_symbol_detector():
    """Get or create symbol detector instance."""
    global _symbol_detector
    if _symbol_detector is None:
        _symbol_detector = SymbolDetector(YOLO_MODEL_PATH)
    return _symbol_detector


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'florify-ai-processing',
        'embeddings_db_exists': os.path.exists(EMBEDDINGS_DB_PATH),
        'yolo_model_exists': os.path.exists(YOLO_MODEL_PATH)
    })


@app.route('/api/process-blueprint', methods=['POST'])
def process_blueprint():
    """
    Process a blueprint image through Phase 2 (embedding matching).
    
    Request body:
    {
        "image": "base64_encoded_png_image",
        "min_similarity": 0.7 (optional)
    }
    
    Returns:
    {
        "success": true,
        "filled_image_base64": "...",
        "similarity": 0.85,
        "match_index": 42
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: image'
            }), 400
        
        image_data = data['image']
        min_similarity = data.get('min_similarity', 0.7)
        
        # Process blueprint
        matcher = get_blueprint_matcher()
        
        # Decode image if needed
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        result = matcher.find_matching_blueprint(
            image_bytes, 
            min_similarity=min_similarity
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/detect-symbols', methods=['POST'])
def detect_symbols_endpoint():
    """
    Detect garden symbols in a processed blueprint image (Phase 3).
    
    Request body:
    {
        "image": "base64_encoded_png_image",
        "conf_threshold": 0.25 (optional)
    }
    
    Returns:
    {
        "success": true,
        "detections": [...],
        "labeled_image_base64": "...",
        "summary": {...},
        "csv": "..."
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: image'
            }), 400
        
        image_data = data['image']
        conf_threshold = data.get('conf_threshold', 0.25)
        
        # Detect symbols
        detector = get_symbol_detector()
        result = detector.detect(image_data, conf_threshold)
        
        # Add CSV output
        if result.get('success') and result.get('detections'):
            result['csv'] = generate_csv_from_detections(result['detections'])
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/process-full-pipeline', methods=['POST'])
def process_full_pipeline():
    """
    Process a blueprint through the complete pipeline:
    1. Match to filled blueprint (Phase 2)
    2. Detect symbols using YOLO (Phase 3)
    
    Request body:
    {
        "non_skinned_image": "base64_encoded_png",
        "skinned_image": "base64_encoded_png" (optional),
        "min_similarity": 0.7 (optional),
        "conf_threshold": 0.25 (optional)
    }
    
    Returns comprehensive result with all processed data.
    """
    try:
        data = request.get_json()
        
        if not data or 'non_skinned_image' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: non_skinned_image'
            }), 400
        
        non_skinned_image = data['non_skinned_image']
        skinned_image = data.get('skinned_image')
        min_similarity = data.get('min_similarity', 0.7)
        conf_threshold = data.get('conf_threshold', 0.25)
        
        result = {
            'success': True,
            'phase2': None,
            'phase3': None,
            'overlay_data': None
        }
        
        # Phase 2: Blueprint matching
        matcher = get_blueprint_matcher()
        
        if non_skinned_image.startswith('data:image'):
            image_data = non_skinned_image.split(',')[1]
        else:
            image_data = non_skinned_image
        
        phase2_result = matcher.find_matching_blueprint(
            base64.b64decode(image_data),
            min_similarity=min_similarity
        )
        result['phase2'] = phase2_result
        
        # Phase 3: Symbol detection on the filled blueprint
        if phase2_result.get('success') and phase2_result.get('filled_image_base64'):
            detector = get_symbol_detector()
            phase3_result = detector.detect(
                phase2_result['filled_image_base64'],
                conf_threshold
            )
            result['phase3'] = phase3_result
            
            # Add CSV
            if phase3_result.get('success') and phase3_result.get('detections'):
                result['csv'] = generate_csv_from_detections(phase3_result['detections'])
            
            # Generate overlay data for the skinned image
            if phase3_result.get('success') and phase3_result.get('detections'):
                result['overlay_data'] = generate_overlay_data(
                    phase3_result['detections'],
                    skinned_image
                )
        
        return jsonify(result)
        
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


def generate_overlay_data(detections, skinned_image_base64):
    """
    Generate overlay data for displaying interactive markers on skinned image.
    
    Returns a list of markers with positions and properties for frontend display.
    """
    if not detections:
        return []
    
    markers = []
    for det in detections:
        bbox = det['bbox']
        props = det['properties']
        
        marker = {
            'id': det['id'],
            'x': bbox['center_x'],
            'y': bbox['center_y'],
            'width': bbox['width'],
            'height': bbox['height'],
            'class_name': det['class_name'],
            'confidence': det['confidence'],
            'category': props['category'],
            'flowering': props['flowering'],
            'size': props['size'],
            'is_fruiting': props['is_fruiting'],
            'leaf_type': props['leaf_type'],
            'growth_type': props['growth_type'],
            'display_name': props['display_name'],
            'color': get_category_color(props['category'])
        }
        markers.append(marker)
    
    return markers


def get_category_color(category):
    """Get color for a category."""
    colors = {
        'Tree': '#228B22',
        'Shrub': '#32CD32',
        'Perennial': '#9370DB',
        'Annual': '#FF69B4',
        'Climber': '#8B4513',
        'Rock': '#808080',
        'FlowerPot': '#FF6347',
        'Object': '#4169E1',
        'Other': '#FFD700'
    }
    return colors.get(category, '#FFD700')


@app.route('/api/parse-class-name', methods=['POST'])
def parse_class_name():
    """
    Parse a YOLO class name to extract properties.
    
    Request body:
    {
        "class_name": "Tree_Height2_CanopySize2_Evergreen_Flowering_NONFruiting"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'class_name' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: class_name'
            }), 400
        
        result = ClassNameParser.parse(data['class_name'])
        return jsonify({
            'success': True,
            'properties': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/sample-blueprints', methods=['GET'])
def get_sample_blueprints():
    """Get sample empty and filled blueprint pairs for testing."""
    try:
        empty_dir = os.path.join(EMBEDDINGS_DB_PATH, 'png_cache', 'empty')
        filled_dir = os.path.join(EMBEDDINGS_DB_PATH, 'png_cache', 'filled')
        
        samples = []
        for i in range(5):  # Get 5 samples
            empty_path = os.path.join(empty_dir, f'{i:04d}.png')
            filled_path = os.path.join(filled_dir, f'{i:04d}.png')
            
            sample = {'index': i}
            
            if os.path.exists(empty_path):
                with open(empty_path, 'rb') as f:
                    sample['empty_base64'] = base64.b64encode(f.read()).decode('utf-8')
            
            if os.path.exists(filled_path):
                with open(filled_path, 'rb') as f:
                    sample['filled_base64'] = base64.b64encode(f.read()).decode('utf-8')
            
            samples.append(sample)
        
        return jsonify({
            'success': True,
            'samples': samples
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    print(f"Starting AI Processing Server on port {port}")
    print(f"Embeddings DB path: {EMBEDDINGS_DB_PATH}")
    print(f"YOLO model path: {YOLO_MODEL_PATH}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
