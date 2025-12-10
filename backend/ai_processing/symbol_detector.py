"""
Symbol Detector Module
Uses YOLO model to detect garden symbols in processed blueprints.
"""

import os
import io
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Try importing ultralytics, provide fallback if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: ultralytics not available. Using mock mode.")


class ClassNameParser:
    """Parse class names to extract symbol properties."""
    
    # Size mappings based on Height and CanopySize
    HEIGHT_SIZES = {
        'Height1': 'small',
        'Height2': 'medium', 
        'Height3': 'large',
        'Height4': 'large'
    }
    
    CANOPY_SIZES = {
        'CanopySize1': 'small',
        'CanopySize2': 'medium',
        'CanopySize3': 'large',
        'CanopySize4': 'large'
    }
    
    SIZE_KEYWORDS = {
        'small': 'small',
        'medium': 'medium',
        'large': 'large',
        'extrasmall': 'small',
        'Size1': 'small',
        'Size2': 'medium'
    }
    
    @classmethod
    def parse(cls, class_name):
        """
        Parse a class name to extract properties.
        
        Args:
            class_name: The YOLO detected class name
            
        Returns:
            dict with parsed properties
        """
        result = {
            'original_class': class_name,
            'category': 'unknown',
            'flowering': False,
            'size': 'medium',
            'is_fruiting': False,
            'leaf_type': None,
            'growth_type': None,  # Evergreen, Deciduous
            'display_name': class_name
        }
        
        class_lower = class_name.lower()
        parts = class_name.split('_')
        
        # Determine category
        if class_lower.startswith('tree'):
            result['category'] = 'Tree'
        elif class_lower.startswith('shrub'):
            result['category'] = 'Shrub'
        elif class_lower.startswith('perennial'):
            result['category'] = 'Perennial'
        elif class_lower.startswith('annual'):
            result['category'] = 'Annual'
        elif class_lower.startswith('climber'):
            result['category'] = 'Climber'
        elif class_lower.startswith('rock'):
            result['category'] = 'Rock'
        elif class_lower.startswith('flowerpot') or class_lower.startswith('pot'):
            result['category'] = 'FlowerPot'
        elif class_lower == 'objects':
            result['category'] = 'Object'
        else:
            result['category'] = 'Other'
        
        # Check flowering
        if 'flowering' in class_lower and 'nonflowering' not in class_lower:
            result['flowering'] = True
        elif '_flowering' in class_lower:
            # More precise check
            result['flowering'] = 'NONFlowering' not in class_name
        
        # Check fruiting
        if 'fruiting' in class_lower and 'nonfruiting' not in class_lower:
            result['is_fruiting'] = True
        elif '_fruiting' in class_lower:
            result['is_fruiting'] = 'NONFruiting' not in class_name
        
        # Determine size from Height and CanopySize
        for part in parts:
            if part in cls.HEIGHT_SIZES:
                result['size'] = cls.HEIGHT_SIZES[part]
                break
            if part in cls.CANOPY_SIZES:
                result['size'] = cls.CANOPY_SIZES[part]
                break
            part_lower = part.lower()
            for keyword, size in cls.SIZE_KEYWORDS.items():
                if keyword.lower() in part_lower:
                    result['size'] = size
                    break
        
        # Determine leaf type
        if 'broadleafed' in class_lower or 'broadleaf' in class_lower:
            result['leaf_type'] = 'Broad Leaf'
        elif 'thinleafed' in class_lower or 'thinleaf' in class_lower:
            result['leaf_type'] = 'Thin Leaf'
        elif 'needleleaf' in class_lower:
            result['leaf_type'] = 'Needle Leaf'
        elif 'palm' in class_lower:
            result['leaf_type'] = 'Palm'
        
        # Determine growth type
        if 'evergreen' in class_lower or 'ecergreen' in class_lower:  # Note typo in original data
            result['growth_type'] = 'Evergreen'
        elif 'deciduous' in class_lower:
            result['growth_type'] = 'Deciduous'
        
        # Create display name
        display_parts = [result['category']]
        if result['size'] != 'medium':
            display_parts.append(f"({result['size'].title()})")
        if result['flowering']:
            display_parts.append('🌸')
        if result['is_fruiting']:
            display_parts.append('🍎')
        if result['leaf_type']:
            display_parts.append(f"[{result['leaf_type']}]")
        
        result['display_name'] = ' '.join(display_parts)
        
        return result


class SymbolDetector:
    """Detect garden symbols using YOLO model."""
    
    def __init__(self, model_path):
        """
        Initialize the detector with YOLO model.
        
        Args:
            model_path: Path to the YOLO .pt model file
        """
        self.model_path = model_path
        self.model = None
        self.class_names = []
        
        if YOLO_AVAILABLE and os.path.exists(model_path):
            try:
                self.model = YOLO(model_path)
                self.class_names = self.model.names if hasattr(self.model, 'names') else []
                print(f"Loaded YOLO model from {model_path}")
            except Exception as e:
                print(f"Error loading YOLO model: {e}")
    
    def detect(self, image, conf_threshold=0.25):
        """
        Detect symbols in an image.
        
        Args:
            image: PIL Image, file path, or base64 encoded image
            conf_threshold: Confidence threshold for detections
            
        Returns:
            dict with detections and labeled image
        """
        # Load image
        if isinstance(image, str):
            if image.startswith('data:image'):
                image_data = image.split(',')[1]
                image = Image.open(io.BytesIO(base64.b64decode(image_data)))
            elif os.path.exists(image):
                image = Image.open(image)
            else:
                image = Image.open(io.BytesIO(base64.b64decode(image)))
        elif isinstance(image, bytes):
            image = Image.open(io.BytesIO(image))
        
        image = image.convert('RGB')
        
        # Run detection
        if self.model is None:
            return self._mock_detect(image)
        
        results = self.model(image, conf=conf_threshold)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = self.model.names[cls_id] if cls_id < len(self.model.names) else f'class_{cls_id}'
                
                # Parse class name for properties
                parsed = ClassNameParser.parse(cls_name)
                
                detection = {
                    'id': i,
                    'bbox': {
                        'x1': x1,
                        'y1': y1,
                        'x2': x2,
                        'y2': y2,
                        'center_x': (x1 + x2) / 2,
                        'center_y': (y1 + y2) / 2,
                        'width': x2 - x1,
                        'height': y2 - y1
                    },
                    'confidence': conf,
                    'class_name': cls_name,
                    'properties': parsed
                }
                detections.append(detection)
        
        # Create labeled image
        labeled_image = self._draw_detections(image, detections)
        
        # Convert labeled image to base64
        buffered = io.BytesIO()
        labeled_image.save(buffered, format='PNG')
        labeled_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return {
            'success': True,
            'detections': detections,
            'labeled_image_base64': labeled_base64,
            'total_detections': len(detections),
            'summary': self._create_summary(detections)
        }
    
    def _draw_detections(self, image, detections):
        """Draw detection boxes and labels on image."""
        image = image.copy()
        draw = ImageDraw.Draw(image)
        
        # Try to load a font, fallback to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
        except:
            font = ImageFont.load_default()
        
        # Color coding by category
        category_colors = {
            'Tree': '#228B22',      # Forest Green
            'Shrub': '#32CD32',     # Lime Green
            'Perennial': '#9370DB', # Medium Purple
            'Annual': '#FF69B4',    # Hot Pink
            'Climber': '#8B4513',   # Saddle Brown
            'Rock': '#808080',      # Gray
            'FlowerPot': '#FF6347', # Tomato
            'Object': '#4169E1',    # Royal Blue
            'Other': '#FFD700'      # Gold
        }
        
        for det in detections:
            bbox = det['bbox']
            props = det['properties']
            
            x1, y1, x2, y2 = bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']
            
            # Get color based on category
            color = category_colors.get(props['category'], '#FFD700')
            
            # Draw bounding box
            draw.rectangle([x1, y1, x2, y2], outline=color, width=2)
            
            # Draw label background
            label = f"{props['display_name']} ({det['confidence']:.0%})"
            text_bbox = draw.textbbox((x1, y1 - 15), label, font=font)
            draw.rectangle([text_bbox[0]-2, text_bbox[1]-2, text_bbox[2]+2, text_bbox[3]+2], fill=color)
            
            # Draw label text
            draw.text((x1, y1 - 15), label, fill='white', font=font)
            
            # Add flowering indicator
            if props['flowering']:
                draw.ellipse([x2-10, y1-10, x2, y1], fill='#FF69B4')
        
        return image
    
    def _create_summary(self, detections):
        """Create a summary of all detections."""
        summary = {
            'by_category': {},
            'flowering_count': 0,
            'fruiting_count': 0,
            'size_distribution': {'small': 0, 'medium': 0, 'large': 0}
        }
        
        for det in detections:
            props = det['properties']
            
            # Count by category
            cat = props['category']
            if cat not in summary['by_category']:
                summary['by_category'][cat] = 0
            summary['by_category'][cat] += 1
            
            # Count flowering
            if props['flowering']:
                summary['flowering_count'] += 1
            
            # Count fruiting
            if props['is_fruiting']:
                summary['fruiting_count'] += 1
            
            # Size distribution
            size = props['size']
            if size in summary['size_distribution']:
                summary['size_distribution'][size] += 1
        
        return summary
    
    def _mock_detect(self, image):
        """Return mock detections for development without YOLO."""
        img_width, img_height = image.size
        
        # Generate some mock detections
        mock_classes = [
            'Tree_Height2_CanopySize2_Evergreen_Flowering_NONFruiting',
            'Shrub_Height1_CanopySize1_Deciduous_NONFlowering_Fruiting',
            'perennials_Height1_CanopySize2_Evergreen_BroadLeafed_Flowering',
            'Rock_DecendingSize1',
            'FlowerPot'
        ]
        
        detections = []
        np.random.seed(42)  # For reproducibility
        
        for i, cls_name in enumerate(mock_classes):
            # Random position within image
            cx = np.random.randint(50, img_width - 50)
            cy = np.random.randint(50, img_height - 50)
            w = np.random.randint(30, 80)
            h = np.random.randint(30, 80)
            
            parsed = ClassNameParser.parse(cls_name)
            
            detection = {
                'id': i,
                'bbox': {
                    'x1': cx - w/2,
                    'y1': cy - h/2,
                    'x2': cx + w/2,
                    'y2': cy + h/2,
                    'center_x': cx,
                    'center_y': cy,
                    'width': w,
                    'height': h
                },
                'confidence': np.random.uniform(0.7, 0.95),
                'class_name': cls_name,
                'properties': parsed
            }
            detections.append(detection)
        
        # Create labeled image
        labeled_image = self._draw_detections(image, detections)
        
        # Convert to base64
        buffered = io.BytesIO()
        labeled_image.save(buffered, format='PNG')
        labeled_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return {
            'success': True,
            'detections': detections,
            'labeled_image_base64': labeled_base64,
            'total_detections': len(detections),
            'summary': self._create_summary(detections),
            'mock': True
        }


def detect_symbols(image_data, model_path, conf_threshold=0.25):
    """
    Detect symbols in a processed blueprint image.
    
    Args:
        image_data: Base64 encoded PNG image
        model_path: Path to YOLO model
        conf_threshold: Detection confidence threshold
        
    Returns:
        dict with detection results
    """
    detector = SymbolDetector(model_path)
    return detector.detect(image_data, conf_threshold)


def generate_csv_from_detections(detections):
    """
    Generate CSV data from detections.
    
    Args:
        detections: List of detection dictionaries
        
    Returns:
        CSV string
    """
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        'id', 'class_name', 'category', 'flowering', 'fruiting', 'size',
        'leaf_type', 'growth_type', 'confidence',
        'center_x', 'center_y', 'width', 'height'
    ])
    
    # Data rows
    for det in detections:
        props = det['properties']
        bbox = det['bbox']
        writer.writerow([
            det['id'],
            det['class_name'],
            props['category'],
            props['flowering'],
            props['is_fruiting'],
            props['size'],
            props['leaf_type'] or '',
            props['growth_type'] or '',
            f"{det['confidence']:.4f}",
            f"{bbox['center_x']:.1f}",
            f"{bbox['center_y']:.1f}",
            f"{bbox['width']:.1f}",
            f"{bbox['height']:.1f}"
        ])
    
    return output.getvalue()
