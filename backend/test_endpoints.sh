#!/bin/bash

# Base URL of the API
BASE_URL="http://localhost:5000/api/tasks"

# Create a new task
echo "Creating a new task..."
CREATE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"title": "Test Task", "description": "This is a test task"}' $BASE_URL)
echo "Response: $CREATE_RESPONSE"

# Extract Task ID using jq
TASK_ID=$(echo $CREATE_RESPONSE | jq -r '._id')
if [ "$TASK_ID" == "null" ]; then
  echo "Failed to create task"
  exit 1
fi
echo "Created Task ID: $TASK_ID"

# Read all tasks
echo "Reading all tasks..."
ALL_TASKS=$(curl -s -X GET $BASE_URL)
echo "All Tasks: $ALL_TASKS"

# Read a single task by ID
echo "Reading task with ID $TASK_ID..."
SINGLE_TASK=$(curl -s -X GET $BASE_URL/$TASK_ID)
echo "Single Task: $SINGLE_TASK"

# Update a task by ID
echo "Updating task with ID $TASK_ID..."
UPDATE_RESPONSE=$(curl -s -X PATCH -H "Content-Type: application/json" -d '{"title": "Updated Test Task", "description": "This task has been updated", "completed": true}' $BASE_URL/$TASK_ID)
echo "Update Response: $UPDATE_RESPONSE"

# Read the updated task
echo "Reading updated task with ID $TASK_ID..."
UPDATED_TASK=$(curl -s -X GET $BASE_URL/$TASK_ID)
echo "Updated Task: $UPDATED_TASK"

# Delete a task by ID
echo "Deleting task with ID $TASK_ID..."
DELETE_RESPONSE=$(curl -s -X DELETE $BASE_URL/$TASK_ID)
echo "Delete Response: $DELETE_RESPONSE"

# Confirm deletion
echo "Confirming deletion of task with ID $TASK_ID..."
CONFIRM_DELETE=$(curl -s -X GET $BASE_URL/$TASK_ID)
echo "Confirm Delete Response: $CONFIRM_DELETE"
