FROM nginx:1.27-alpine

# Custom nginx config (proxies /api/ to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static site
COPY . /usr/share/nginx/html

# Remove build-only files so they don't ship with the image
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/nginx.conf \
 && rm -f /usr/share/nginx/html/.dockerignore

EXPOSE 80
