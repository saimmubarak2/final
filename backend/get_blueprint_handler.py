import json
import boto3
import os
from botocore.exceptions import ClientError
from simple_auth import require_auth, respond

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['BLUEPRINTS_TABLE'])

@require_auth
def handler(event, context):
    """
    Get a specific blueprint by ID
    """
    try:
        # Get authenticated user ID from the decorator
        user_id = event['user_id']
        
        # Get blueprint ID from path parameters
        blueprint_id = event.get('pathParameters', {}).get('blueprintId')
        
        print(f"Getting blueprint - User ID: {user_id}, Blueprint ID: {blueprint_id}")
        
        if not blueprint_id:
            return respond(400, {"message": "Blueprint ID is required"})

        # Query DynamoDB
        response = table.get_item(
            Key={
                'userId': user_id,
                'blueprintId': blueprint_id
            }
        )

        print(f"DynamoDB response: {response}")

        blueprint = response.get('Item')
        if not blueprint:
            print(f"Blueprint not found for user {user_id}, blueprint {blueprint_id}")
            return respond(404, {"message": "Blueprint not found"})

        print(f"Blueprint found, parsing blueprintData...")

        # Parse blueprintData JSON string back to object
        if 'blueprintData' in blueprint and isinstance(blueprint['blueprintData'], str):
            try:
                blueprint['blueprintData'] = json.loads(blueprint['blueprintData'])
                print(f"Successfully parsed blueprintData")
            except json.JSONDecodeError as e:
                print(f"Warning: Could not parse blueprintData for blueprint {blueprint_id}: {e}")

        return respond(200, {"blueprint": blueprint})

    except ClientError as e:
        print(f"DynamoDB error: {e}")
        return respond(500, {"message": "Database error occurred"})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return respond(500, {"message": "Internal server error"})
