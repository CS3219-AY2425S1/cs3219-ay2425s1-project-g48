# Use the official Golang image to create a build artifact.
# This is a multi-stage build. It uses the golang image for building the app.
FROM golang:1.23 as builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to download dependencies
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

RUN go build -o /question-service

EXPOSE 3002

CMD ["/question-service"]

