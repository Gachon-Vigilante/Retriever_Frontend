# base image
FROM node:24-alpine AS build

# 작업 디렉토리 생성
WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 실제 실행용 이미지
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]