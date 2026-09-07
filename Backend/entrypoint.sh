#!/bin/bash

# Create temporary certificate files from environment variables if they are provided
if [ ! -z "$KAFKA_CA_CERT_TEXT" ]; then
    echo "$KAFKA_CA_CERT_TEXT" > /tmp/caCertificate.pem
    echo "CA Certificate created at /tmp/caCertificate.pem"
fi

if [ ! -z "$KAFKA_ACCESS_KEY_TEXT" ]; then
    echo "$KAFKA_ACCESS_KEY_TEXT" > /tmp/accessKey.key
    echo "Access Key created at /tmp/accessKey.key"
fi

if [ ! -z "$KAFKA_ACCESS_CERT_TEXT" ]; then
    echo "$KAFKA_ACCESS_CERT_TEXT" > /tmp/accessCertificate.cert
    echo "Access Certificate created at /tmp/accessCertificate.cert"
fi

# Execute the Java application
exec java -jar app.jar
