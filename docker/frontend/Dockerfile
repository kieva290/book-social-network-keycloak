# Step-1 Build
# Defining node image and giving alias as build-stage
FROM node:22 AS build-stage

#Accepting build-arg to create environment specific build
#default value is development
ARG build_env=development

# creating virtual directory inside docker imge
WORKDIR /app

COPY package*.json ./

#installing dependecies for project
RUN npm install

# Copying files local machine to virtual docker image directory
COPY . .

# creating angular build
RUN npm run build --configuration=$build_env

# Step-2 - Run
#Defining nginx image
FROM nginx:alpine

# copying nginx config from local to image
COPY nginx.conf /etc/nginx/nginx.conf

# copying compiled code from dist to nginx folder for serving
COPY --from=build-stage /app/dist/book-network-ui /usr/share/nginx/html/browser

EXPOSE 80