#!/bin/sh
echo "Node Environment is: $NODE_ENV"
if [ "$NODE_ENV" = "development" ]; then 
  npm run start-dev
else
if [ "$NODE_ENV" = "staging" ]; then 
  npm run staging
else 
  npm run start-production
fi
