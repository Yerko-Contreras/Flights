# Usar la imagen oficial de Node.js
FROM node:23-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de package
COPY package*.json ./

# Instalar todas las dependencias 
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Limpiar devDependencies para reducir tamaño de imagen
RUN npm prune 

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar y dar permisos al script de entrada
COPY scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar propiedad de archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Usar el script de entrada
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"] 