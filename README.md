# PDR-Websocket Project

This is the PDR-Websocket project, a websockets server that checks for specified Predictoor contracts, buys them based on the provided Private Key and sends the data to the clients.

## Prerequisites
If you are running against Barge!

Before setting up the PDR-Websocket project, make sure you have the following components running:

- Ganache: This is your local Ethereum blockchain, available when you need it.
- Barge: Barge is a collection of Ocean components packed into one Docker Compose file for easy local development.

## Setup

### Update env variables

Check environment variables from .env.dev file and update them accordangly to your setup.

### Update configs

- opfProvidedPredictions: List of Predictoor contracts that the app it's going to purchase subscriptions for, get the predictions and serve it to the client using socket connection.


## Run the app

### Standalone

#### Install dependencies

```bash
npm i
```

#### Start the app

```bash
npm start
# or
yarn start
# or
pnpm start
```

### As docket container

#### Building the Docker image

In the project directory, build the Docker image with the following command:

```bash
docker build --build-arg NODE_ENV=development -t pdr-websocket .
```

This command builds a Docker image for the PDR-Websocket project in development mode. The `-t` option tags our image with the name `pdr-websocket`.

#### Running the Docker container

After building the Docker image, run a container with this image using the following command:

```bash
docker run -e NODE_ENV=development -p 8888:8888 --network ocean_backend -d pdr-websocket
```

This command runs the `pdr-websocket` image in a new container, mapping the container's port 8888 to port 8888 on your host machine. The `-e NODE_ENV=development` option sets an environment variable inside the container to indicate we're running in development mode. The `--network ocean_backend` option connects our container to the `ocean_backend` network so it can communicate with other Ocean services.
