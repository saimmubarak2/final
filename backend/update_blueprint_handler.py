import json
import boto3
import os
from datetime import datetime
from botocore.exceptions import ClientError
from simple_auth import require_auth, respond

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['BLUEPRINTS_TABLE'])

@require_auth
def handler(event, context):
    """
    Update an existing blueprint
    """
    try:
        # Get authenticated user ID from the decorator
        user_id = event['user_id']
        
        # Get blueprint ID from path parameters
        blueprint_id = event.get('pathParameters', {}).get('blueprintId')
        
        if not blueprint_id:
            return respond(400, {"message": "Blueprint ID is required"})

        body = json.loads(event.get("body", "{}"))
        
        # Build update expression
        update_expression = "SET updatedAt = :updatedAt"
        expression_values = {
            ':updatedAt': datetime.utcnow().isoformat()
        }
        expression_names = {}

        if 'name' in body:
            update_expression += ", #name = :name"
            expression_values[':name'] = body['name']
            expression_names['#name'] = 'name'

        if 'blueprintData' in body:
            update_expression += ", blueprintData = :blueprintData"
            # Store as JSON string
            expression_values[':blueprintData'] = json.dumps(body['blueprintData'])

        if 'pngImage' in body:
            update_expression += ", pngImage = :pngImage"
            expression_values[':pngImage'] = body['pngImage']

        if 'pdfImage' in body:
            update_expression += ", pdfImage = :pdfImage"
            expression_values[':pdfImage'] = body['pdfImage']

        # Update item in DynamoDB
        response = table.update_item(
            Key={
                'userId': user_id,
                'blueprintId': blueprint_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames=expression_names if expression_names else None,
            ConditionExpression='attribute_exists(blueprintId)',
            ReturnValues='ALL_NEW'
        )

        # Parse blueprintData JSON string back to object for response
        updated_item = response['Attributes']
        if 'blueprintData' in updated_item and isinstance(updated_item['blueprintData'], str):
            try:
                updated_item['blueprintData'] = json.loads(updated_item['blueprintData'])
            except json.JSONDecodeError:
                print(f"Warning: Could not parse blueprintData")

        return respond(200, {
            "message": "Blueprint updated successfully",
            "blueprint": updated_item
        })

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return respond(404, {"message": "Blueprint not found"})
        print(f"DynamoDB error: {e}")
        return respond(500, {"message": "Database error occurred"})
    except json.JSONDecodeError:
        return respond(400, {"message": "Invalid JSON body"})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return respond(500, {"message": "Internal server error"})
