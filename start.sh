#!/bin/bash

cd "$(dirname "$0")/server"

if pgrep -f "node server.js" > /dev/null; then
    echo "El servidor ya está corriendo en https://xvdecamila.mipagina.pro"
    exit 0
fi

echo "Iniciando servidor API..."
node server.js &

sleep 2

if curl -s https://xvdecamila.mipagina.pro/api/rsvps > /dev/null 2>&1; then
    echo "✓ Servidor corriendo en https://xvdecamila.mipagina.pro"
    echo "✓ Dashboard: https://xvdecamila.mipagina.pro/dashboard"
else
    echo "✗ Error al iniciar el servidor"
    exit 1
fi