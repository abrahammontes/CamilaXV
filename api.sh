#!/bin/bash

case "$1" in
    start)
        systemctl start camilaxv-api
        echo "API iniciado"
        ;;
    stop)
        systemctl stop camilaxv-api
        echo "API detenido"
        ;;
    restart)
        systemctl restart camilaxv-api
        echo "API reiniciado"
        ;;
    status)
        systemctl status camilaxv-api --no-pager
        ;;
    logs)
        journalctl -u camilaxv-api -n 50 --no-pager
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac