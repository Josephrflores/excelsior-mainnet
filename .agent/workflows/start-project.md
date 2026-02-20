---
description: Enciende los servidores de admin-dashboard (puerto 3000) y landing-page (puerto 3001) con host 127.0.0.1 para acceso vía túnel SSH.
---

Este workflow asegura que los servidores se inicien correctamente para ser accedidos desde Windows.

1. Limpiar puertos previos 3000 y 3001
// turbo
```bash
fuser -k 3000/tcp 3001/tcp || true
```

2. Iniciar Admin Dashboard (Puerto 3000)
// turbo
```bash
cd /home/itsroosevelt_/excelsior-project/admin-dashboard && yarn next dev -H 127.0.0.1 -p 3000
```

3. Iniciar Landing Page (Puerto 3001)
// turbo
```bash
cd /home/itsroosevelt_/excelsior-project/landing-page && yarn next dev -H 127.0.0.1 -p 3001
```
