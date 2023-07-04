#!/bin/sh
echo "Node Environment is: $NODE_ENV"
if [ "$NODE_ENV" = "development" ]; then 
  npm run start-dev
else 
  npm run start-production
fi
