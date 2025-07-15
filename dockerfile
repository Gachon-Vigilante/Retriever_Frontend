# base image
FROM node:24-alpine AS build

# 시간대 설정
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# 작업 디렉토리 생성
WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .

# react 실행
EXPOSE 3000

CMD [ "npm", "start" ]
