#!/bin/bash

echo "Deteniendo servidor API..."

if pkill -f "node server.js" > /dev/null 2>&1; then
    echo "✓ Servidor detenido"
else
    echo "El servidor no estaba corriendo"
fi