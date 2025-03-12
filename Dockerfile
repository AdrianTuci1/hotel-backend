# Folosim o imagine oficială Node.js
FROM node:18

# Setăm directorul de lucru în container
WORKDIR /app

# Copiem fișierele necesare
COPY package.json package-lock.json ./
RUN npm install

# Copiem restul codului sursă
COPY . .

# Expunem portul pe care rulează serverul
EXPOSE 5001

# 📌 Setăm comanda de start pentru container
CMD ["sh", "-c", "sleep 5 && node server/seeders/demoData.js && node server/index.js"]