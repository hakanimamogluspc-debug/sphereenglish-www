FROM nginx:alpine

  # Tüm statik dosyaları kopyala
  COPY . /usr/share/nginx/html/

  # Netlify toml ve git dosyalarını temizle
  RUN rm -f /usr/share/nginx/html/netlify.toml            /usr/share/nginx/html/_redirects

  # Nginx konfigürasyonu
  COPY nginx.conf /etc/nginx/conf.d/default.conf

  EXPOSE 80

  CMD ["nginx", "-g", "daemon off;"]
  