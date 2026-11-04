# Awin read-only connection diagnostic

This proposed diagnostic must run only on the server, behind the existing owner/admin Control Centre authentication. It should call the Awin publisher programmes GET endpoint with a token stored in Vercel environment variables, never expose credentials to the browser, and present only programme IDs, names and statuses.

It must not import products, change programme membership, activate feeds or publish offers. Verification in preview is required before any production deployment.
