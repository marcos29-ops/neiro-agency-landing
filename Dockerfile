FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# La config del servidor no debe quedar publicada en la web
RUN rm -f /usr/share/nginx/html/nginx.conf
EXPOSE 80
