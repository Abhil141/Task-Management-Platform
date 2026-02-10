FROM node:20

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

