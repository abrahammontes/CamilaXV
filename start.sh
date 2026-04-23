#!/bin/bash

cd "$(dirname "$0")/server"

if pgrep -f "node server.js" > /dev/null; then
    echo "El servidor ya está corriendo en http://localhost:3001"
    exit 0
fi

echo "Iniciando servidor API..."
node server.js &

sleep 2

if curl -s http://localhost:3001/api/rsvps > /dev/null 2>&1; then
    echo "✓ Servidor corriendo en http://localhost:3001"
    echo "✓ Dashboard: http://localhost:3001/dashboard"
else
    echo "✗ Error al iniciar el servidor"
    exit 1
fi