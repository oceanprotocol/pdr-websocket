# Specify the base image
FROM node:16 as base

# Specify the work directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the work directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy all the files from your local project into the work directory
COPY . .

# This will be our argument that we will pass during the Docker build
ARG NODE_ENV

# Use the argument in the build script
RUN if [ "$NODE_ENV" = "production" ]; then npm run build-production; else npm run build-dev; fi

# Expose the port the app runs in
EXPOSE 8888

# If we're in development mode, start the server with nodemon, otherwise use node
CMD if [ "$NODE_ENV" = "development" ]; then npm run start-dev; else npm start-production; fi
