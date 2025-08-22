# Render.com Deployment Configuration

## Environment Variables to Set in Render:

```bash
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string_from_render
PORT=3000
```

## Build Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x (or latest LTS)

## Database Setup:
1. Create PostgreSQL database in Render
2. Copy the connection string
3. Set it as DATABASE_URL environment variable

## Health Check Endpoint:
- URL: `/`
- Expected Response: `{"message": "Bitespeed Identity Reconciliation Service"}`

## API Endpoint:
- URL: `/identify`
- Method: POST
- Content-Type: application/json
