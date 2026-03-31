#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${DOCKER_USERNAME}/online-doctor-appointment-system:latest"
CONTAINER_NAME="online-doctor-appointment-system"

echo "Pulling latest image: ${IMAGE_NAME}"
docker pull "${IMAGE_NAME}"

if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
  echo "Stopping existing container: ${CONTAINER_NAME}"
  docker stop "${CONTAINER_NAME}" || true

  echo "Removing existing container: ${CONTAINER_NAME}"
  docker rm "${CONTAINER_NAME}" || true
fi

echo "Starting new container on port 80"
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p 80:5000 \
  --restart unless-stopped \
  "${IMAGE_NAME}"
