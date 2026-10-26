export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProduction) {
    const value = vercelProduction.startsWith("http")
      ? vercelProduction
      : `https://${vercelProduction}`;

    return value.replace(/\/+$/, "");
  }

  const vercelDeployment = process.env.VERCEL_URL?.trim();

  if (vercelDeployment) {
    const value = vercelDeployment.startsWith("http")
      ? vercelDeployment
      : `https://${vercelDeployment}`;

    return value.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export function getContactEmail() {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "Contact email not configured"
  );
}
