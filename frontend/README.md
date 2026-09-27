# TrustLink React frontend

React + Vite frontend for the TrustLink Spring Boot API.

## Run locally

1. Start the Spring Boot backend on `http://localhost:8080`.
2. From this directory:

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend.

For a separately hosted backend, copy `.env.example` to `.env` and set `VITE_API_URL`.

## API integration

The frontend now uses the backend for:

- account signup/login
- JWT access tokens and refresh-token rotation
- logout
- current user/vendor profiles
- vendor discovery by name or area
- vendor products (create/update/delete for vendors)
- customer reviews
- verification-document upload/listing

The checkout screen remains a UI flow because the supplied backend has no order/payment endpoint.
