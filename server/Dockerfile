# Unhardened Dockerfile — for "before" Trivy scan comparison
# Uses full node image, runs as root, installs all dependencies
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/index.js"]
