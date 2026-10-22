# AVUQO v0.5 CSS Modules config fix

## Root cause

The current `next.config.ts` applies `@tailwindcss/turbopack` to every `*.css`
file:

```ts
turbopack: {
  rules: {
    "*.css": {
      loaders: ["@tailwindcss/turbopack"],
      as: "*.css",
    },
  },
},
```

That catches both global CSS and `*.module.css`, bypassing/interfering with
Next.js' native CSS Module processing.

AVUQO already uses standard Next.js CSS Modules throughout the app, so the
custom rule is unnecessary and is removed by this patch.

## Install

1. Stop AVUQO.
2. Extract this ZIP directly over `C:\avuqo`.
3. Choose **Replace files in the destination**.
4. Clear the Next build cache:

```powershell
cd C:\avuqo
Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
```

5. Build:

```powershell
npm.cmd run build
```

6. Start:

```powershell
npm.cmd run dev
```

No SQL changes are required.

## Git

After confirming CSS Modules are working:

```powershell
git status
git add next.config.ts
git commit -m "Fix Next CSS Modules configuration"
git push origin main
```
