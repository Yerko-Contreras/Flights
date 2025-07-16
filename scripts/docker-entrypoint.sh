#!/bin/sh

# Script de entrada para Docker
set -e

# Función para mostrar logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para configurar variables de entorno por defecto
setup_env() {
    export NODE_ENV=${NODE_ENV:-production}
    export PORT=${PORT:-3000}
    export ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost:3000}
    
    log "Configuración del entorno:"
    log "  NODE_ENV: $NODE_ENV"
    log "  PORT: $PORT"
    log "  ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
}

# Función para iniciar la aplicación
start_app() {
    log "Iniciando aplicación..."
    exec npm start
}

# Función principal
main() {
    log "=== Iniciando Flights API ==="
    setup_env
    start_app
}

# Ejecutar función principal
main "$@" 