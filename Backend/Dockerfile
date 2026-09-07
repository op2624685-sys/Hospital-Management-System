# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the JAR
RUN mvn clean package -DskipTests -B

# Stage 2: Run with JRE
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install necessary packages for PDF processing and image handling
RUN apk add --no-cache \
    fontconfig \
    ttf-dejavu \
    nss \
    openssl \
    ca-certificates \
    bash

# Create directories for temp files
RUN mkdir -p /tmp/fonts /var/cache/fontconfig

# Copy the JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -D appuser

# Set permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port (context path will be /api/v1)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:8080/api/v1/actuator/health || exit 1

# Run the application with the default Spring configuration
ENTRYPOINT ["java", "-jar", "app.jar"]