# Laundry IoT System

This is a starter full-stack IoT dashboard for washing machines.

## Parts
- Firmware: ESP32 + RFID
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Frontend: React + Vite

## What you change most
- `backend/.env`
- `frontend/.env`
- `firmware/wifi_secrets.h`
- `firmware/config.h`

## Deploy flow
1. Push code to GitHub
2. Deploy backend on Render
3. Deploy frontend on Render or Vercel
4. Put backend URL in `frontend/.env` and `firmware/config.h`
5. Flash ESP32 firmware

## Notes
- Do not commit real secrets.
- Each washing machine should use a unique `MACHINE_ID`.
