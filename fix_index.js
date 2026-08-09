const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldScript = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Quantrih",
      "url": "https://quantrih.com",
      "logo": "https://quantrih.com/icon.svg"
    }
    </script>`;

const newScript = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://quantrih.com/#organization",
          "name": "Quantrih",
          "url": "https://quantrih.com/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://quantrih.com/icon.svg",
            "width": 512,
            "height": 512,
            "caption": "Quantrih Logo"
          },
          "image": "https://quantrih.com/icon.svg",
          "sameAs": [
            "https://twitter.com/quantrih",
            "https://linkedin.com/company/quantrih"
          ]
        },
        {
          "@type": "WebSite",
          "@id": "https://quantrih.com/#website",
          "url": "https://quantrih.com/",
          "name": "Quantrih",
          "description": "Quantrih provides advanced portfolio backtesting tools. Test your investment strategies against historical market data before committing capital.",
          "publisher": {
            "@id": "https://quantrih.com/#organization"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://quantrih.com/market?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }
      ]
    }
    </script>`;

if (html.includes(oldScript)) {
  html = html.replace(oldScript, newScript);
} else {
  // Try regex if spacing is different
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, newScript);
}

fs.writeFileSync('index.html', html);
