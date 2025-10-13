# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]
