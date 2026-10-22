# AVUQO v0.5 Control Centre prerender fix

This patch fixes the Next.js 16 Cache Components build error on private
Control Centre routes.

## Why

The Control Centre authorization gate reads the Supabase session from request
cookies. With Cache Components enabled, request-time data must sit beneath a
React Suspense boundary so Next.js can prerender a safe fallback shell and
stream the private content only after the request arrives.

## Install

1. Stop the AVUQO server.
2. Extract this ZIP directly over `C:\avuqo`.
3. Choose **Replace files in the destination**.
4. Run:

```powershell
cd C:\avuqo
npm.cmd run build
```

No SQL changes are required.
