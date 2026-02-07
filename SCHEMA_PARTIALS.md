## LegalService Schema (Homepage + Personal Injury Hub)
```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Insider Accident Lawyers",
  "url": "https://www.insideraccidentlawyers.com/personal-injury",
  "areaServed": {
    "@type": "City",
    "name": "Los Angeles",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3435 Wilshire Blvd Suite 1620",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "postalCode": "90010",
    "addressCountry": "US"
  },
  "telephone": "+1-844-467-4335",
  "description": "Insider Accident Lawyers is a Los Angeles personal injury firm led by former insurance defense attorneys, providing trial-focused representation, Spanish-speaking intake, and referral-level credibility for complex injury cases."
}
```

## Attorney Person Schema (Template)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "ATTORNEY_NAME",
  "jobTitle": "Personal Injury Attorney",
  "worksFor": {
    "@type": "LegalService",
    "name": "Insider Accident Lawyers",
    "url": "https://www.insideraccidentlawyers.com"
  },
  "url": "ATTORNEY_PAGE_URL"
}
```

## FAQPage Schema (Template)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "QUESTION_TEXT",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ANSWER_TEXT"
      }
    }
  ]
}
```
