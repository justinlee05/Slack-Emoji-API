FROM node:20-slim

# Puppeteer 실행에 필요한 패키지들 설치
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-color-emoji \
    ca-certificates \
    libglib2.0-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Puppeteer가 사용할 브라우저 경로 지정
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
