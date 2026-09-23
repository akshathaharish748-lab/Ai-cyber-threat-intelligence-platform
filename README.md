# AI Cyber Threat Intelligence Platform

## Deployment and monitoring

### Required environment variables

Set the following values in the backend environment before enabling live threat intelligence lookups:

- `ABUSEIPDB_KEY` — your AbuseIPDB API key
- `VIRUSTOTAL_API_KEY` — your VirusTotal API key

The project already includes the env entries in [backend/.env](backend/.env).

### Health and readiness endpoints

The backend exposes:

- `GET /api/health` — service uptime and memory stats
- `GET /api/health/ready` — service readiness signal for deployment probes

These endpoints are implemented in [backend/server.js](backend/server.js).

### Recommended deployment

- Frontend: Vercel or Netlify
- Backend: Render, Railway, Fly.io, or a secure Node host
- Database: MongoDB Atlas
- Monitoring: UptimeRobot, Sentry, or platform-native log/metrics alerts

### Production checklist

1. Add production values for `MONGO_URI`, `JWT_SECRET`, `ABUSEIPDB_KEY`, `VIRUSTOTAL_API_KEY`, and `FRONTEND_URL`.
2. Deploy the backend with HTTPS enabled.
3. Deploy the frontend with the production API base URL.
4. Point the monitoring service at `/api/health` and configure alerts for failed checks.
5. Review logs and API errors regularly for provider failures or auth issues.

### Report exports

The reports page includes both plain-text downloads and PDF export generation via the PDF button in [frontend/src/pages/Reports/Reports.jsx](frontend/src/pages/Reports/Reports.jsx).
