# 1. Base Image: Use an official Node.js image
FROM node:18-alpine
# 2. Set the working directory inside the container
WORKDIR /app
# 3. Copy package.json and package-lock.json
COPY package*.json ./
# 4. Install dependencies
RUN npm install --legacy-peer-deps
# 5. Copy the rest of your application code
COPY . .
# 6. Build your Next.js app for production
RUN npm run build
# 7. Expose the port the app will run on
EXPOSE 3000
# 8. Command to run the application
CMD ["npm", "start"]
