FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy the repository so we can build the React app when a frontend exists.
COPY . .

# Build the React frontend if frontend/package.json is present.
# This keeps the image compatible with the current backend-only workspace too.
RUN if [ -f frontend/package.json ]; then \
      cd frontend && \
      npm install && \
      npm run build && \
      mkdir -p /frontend-dist && \
      cp -r build/. /frontend-dist/; \
    else \
      mkdir -p /frontend-dist; \
    fi


FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=5000

# Install Python dependencies for the Flask backend.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files.
COPY app.py .
COPY backend ./backend

# Copy the built frontend assets from the previous stage.
COPY --from=frontend-builder /frontend-dist ./frontend-build

EXPOSE 5000

CMD ["python", "app.py"]
