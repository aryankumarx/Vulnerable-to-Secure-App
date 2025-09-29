FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or package-lock.json/npm-shrinkwrap.json)
# This step allows Docker to use its cache for npm install if only source code changes.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# --- Security Best Practice: Use a Non-Root User ---
# 1. Create a non-root group and user.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 2. Change ownership of the /app directory to the new user.
RUN chown -R appuser:appgroup /app

# 3. Switch to the non-root user for subsequent commands and the application runtime.
USER appuser

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]