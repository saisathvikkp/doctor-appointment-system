# Docker Run Guide

From `c:\Users\knpar\doctor-appointment-system\backend`, run:

```powershell
docker compose up --build
```

The backend will be available at:

```text
http://localhost:5000
```

Useful commands:

```powershell
docker compose up -d --build
docker compose logs -f backend
docker compose down
```

The SQLite database file is mounted from your project folder:

```text
./doctor_appointment.db -> /app/doctor_appointment.db
```
