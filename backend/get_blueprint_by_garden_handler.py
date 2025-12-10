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
    Get blueprint for a specific garden
    """
    try:
        # Get authenticated user ID from the decorator
        user_id = event['user_id']
        
        # Get garden ID from path parameters
        garden_id = event.get('pathParameters', {}).get('gardenId')
        
        if not garden_id:
            return respond(400, {"message": "Garden ID is required"})

        # Query DynamoDB using GSI on gardenId
        response = table.query(
            IndexName='GardenIdIndex',
            KeyConditionExpression='gardenId = :gardenId',
            FilterExpression='userId = :userId',
            ExpressionAttributeValues={
                ':gardenId': garden_id,
                ':userId': user_id
            }
        )

        blueprints = response.get('Items', [])
        
        # Return the first blueprint if exists
        if blueprints:
            # Parse blueprintData JSON string back to object
            if 'blueprintData' in blueprints[0] and isinstance(blueprints[0]['blueprintData'], str):
                try:
                    blueprints[0]['blueprintData'] = json.loads(blueprints[0]['blueprintData'])
                except json.JSONDecodeError:
                    print(f"Warning: Could not parse blueprintData")
            
            return respond(200, {"blueprint": blueprints[0]})
        else:
            return respond(404, {"message": "No blueprint found for this garden"})

    except ClientError as e:
        print(f"DynamoDB error: {e}")
        return respond(500, {"message": "Database error occurred"})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return respond(500, {"message": "Internal server error"})
