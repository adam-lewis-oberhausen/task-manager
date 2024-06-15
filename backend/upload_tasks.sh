#!/bin/bash

BASE_URL="http://localhost:5000/api/tasks"

declare -a tasks=(
  '{"title": "Write a Blog Post", "description": "Write an article about the benefits of React and Node.js"}'
  '{"title": "Grocery Shopping", "description": "Buy milk, bread, and eggs"}'
  '{"title": "Workout", "description": "Do a 30-minute HIIT workout"}'
  '{"title": "Read a Book", "description": "Finish reading the last chapter of the current book"}'
  '{"title": "Plan Vacation", "description": "Plan the itinerary for the upcoming trip to Hawaii"}'
  '{"title": "Clean the House", "description": "Vacuum and dust all rooms"}'
  '{"title": "Cook Dinner", "description": "Prepare a healthy meal with vegetables and protein"}'
  '{"title": "Watch a Movie", "description": "Watch the new release on Netflix"}'
  '{"title": "Call Parents", "description": "Have a catch-up call with mom and dad"}'
  '{"title": "Learn a New Skill", "description": "Start learning how to play the guitar"}'
)

for task in "${tasks[@]}"
do
  echo "Uploading task: $task"
  curl -s -X POST -H "Content-Type: application/json" -d "$task" $BASE_URL
  echo
done

echo "All tasks uploaded successfully!"
