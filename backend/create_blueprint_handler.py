import json
import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
from simple_auth import require_auth, respond

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['BLUEPRINTS_TABLE'])

@require_auth
def handler(event, context):
    """
    Create a new blueprint for a garden
    Request body should contain:
    {
        "gardenId": "uuid",
        "blueprintData": { ... },  # JSON data from replit_floorplan
        "name": "Optional blueprint name"
    }
    """
    try:
        # Get authenticated user ID from the decorator
        user_id = event['user_id']
        
        print(f"Creating blueprint for user: {user_id}")
        
        body = json.loads(event.get("body", "{}"))
        garden_id = body.get("gardenId")
        blueprint_data = body.get("blueprintData", {})
        name = body.get("name", "Garden Blueprint")
        png_image = body.get("pngImage", "")  # Base64 PNG with skins
        pdf_image = body.get("pdfImage", "")  # Base64 PDF without skins

        print(f"Garden ID: {garden_id}")
        print(f"Blueprint data size: {len(json.dumps(blueprint_data))} bytes")
        print(f"Blueprint name: {name}")
        print(f"PNG image size: {len(png_image)} bytes")
        print(f"PDF image size: {len(pdf_image)} bytes")

        if not garden_id:
            return respond(400, {"message": "Garden ID is required"})

        # Generate unique blueprint ID
        blueprint_id = str(uuid.uuid4())

        # Create blueprint item
        current_time = datetime.utcnow().isoformat()
        
        # Convert blueprintData to JSON string to ensure it's stored properly
        blueprint_item = {
            "userId": user_id,
            "blueprintId": blueprint_id,
            "gardenId": garden_id,
            "name": name,
            "blueprintData": json.dumps(blueprint_data),  # Store as JSON string
            "pngImage": png_image,  # Store PNG as base64 string
            "pdfImage": pdf_image,  # Store PDF as base64 string
            "createdAt": current_time,
            "updatedAt": current_time
        }

        print(f"Attempting to save blueprint: {blueprint_id}")
        
        # Save to DynamoDB
        table.put_item(Item=blueprint_item)
        
        print(f"Successfully saved blueprint: {blueprint_id}")

        # Convert back for response
        response_item = {
            **blueprint_item,
            "blueprintData": blueprint_data  # Return as object
        }

        return respond(201, {
            "message": "Blueprint created successfully",
            "blueprint": response_item
        })

    except json.JSONDecodeError:
        return respond(400, {"message": "Invalid JSON body"})
    except ClientError as e:
        print(f"DynamoDB error: {e}")
        return respond(500, {"message": "Database error occurred"})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return respond(500, {"message": "Internal server error"})
