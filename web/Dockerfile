# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Quasar CLI globally
RUN yarn global add @quasar/cli

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all project files
COPY . .

# Expose the port that the app runs on (adjust according to your app)
EXPOSE 3210

# Command to start the frontend
CMD ["quasar", "dev"]
