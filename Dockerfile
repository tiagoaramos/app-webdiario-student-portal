# Production stage with Nginx for WebDiário Student Portal
FROM webdiario/alpine/local/nginx:latest

# Set environment variables for WebDiário Student Portal
ENV APP_NAME="WebDiário Student Portal"
ENV APP_PORT="3005"
ENV API_HOST="api-webdiario-student-portal"
ENV API_PORT="8080"
ENV API_PATH="/api/student-portal/"

# Copy built application from pipeline build
COPY build /app

RUN chown -R nginx:nginx /app
