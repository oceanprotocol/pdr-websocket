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

# Copy the shell script from your project directory to the docker image
COPY ./start.sh ./start.sh

# Make your script executable
RUN chmod +x ./start.sh

# Expose the port the app runs in
EXPOSE 8888

# Run your script
CMD ["./start.sh"]
