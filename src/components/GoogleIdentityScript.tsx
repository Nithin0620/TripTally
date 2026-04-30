"use client";

import Script from 'next/script';

export default function GoogleIdentityScript() {
  return <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />;
}