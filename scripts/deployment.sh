#!/bin/bash

ENV_FILE=".env"

# Download the latest release as a ZIP file
wget "https://github.com/Andrew-R-Lawler/go-react-server/releases/latest/download/gin-server.zip"
echo "Latest go-react-server release downloaded as gin-server.zip"

# unzip the downloaded zip file
unzip gin-server.zip

# remove the unneeded archive
rm gin-server.zip

echo "Please enter the port number to run your gin server on:"
read PORT

echo "Please enter your DB_NAME:"
read DB_NAME

echo "Please enter the DB_HOST address:"
read DB_HOST

echo "Please enter your DB_USER username:"
read DB_USER

echo "Please enter your DB_PASSWORD:"
read DB_PASSWORD

echo "Please enter your JWT_SECRET_KEY:"
read JWT_SECRET_KEY

echo "PORT=$PORT" > $ENV_FILE
echo "DB_NAME=$DB_NAME" >> $ENV_FILE
echo "DB_HOST=$DB_HOST" >> $ENV_FILE
echo "DB_USER=$DB_USER" >> $ENV_FILE
echo "DB_PASSWORD=$DB_PASSWORD" >> $ENV_FILE
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY" >> $ENV_FILE

clear
./gin-server

