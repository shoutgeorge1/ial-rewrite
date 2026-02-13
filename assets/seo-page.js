const contentRoot = "https://www.insiderlawyers.com";

const getMetaTag = (name) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
};

const setCanonical = (href) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const sanitizeTitle = (h1) => {
  if (!h1) return "Los Angeles Personal Injury Lawyers";
  return h1.replace(/\s+Los Angeles\s*$/i, "").trim();
};

const truncate = (text, maxLen) => {
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen - 1).trim()}…` : text;
};

const parseContent = (raw) => {
  const lines = raw.split(/\r?\n/).map((line) => line.trim());
  const output = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      output.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith("H1:")) {
      closeList();
      output.push(`<h1>${line.replace("H1:", "").trim()}</h1>`);
      continue;
    }
    if (line.startsWith("H2:")) {
      closeList();
      output.push(`<h2>${line.replace("H2:", "").trim()}</h2>`);
      continue;
    }
    if (line.startsWith("H3:")) {
      closeList();
      output.push(`<h3>${line.replace("H3:", "").trim()}</h3>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${line.replace("- ", "").trim()}</li>`);
      continue;
    }
    if (line.startsWith("Intro:")) {
      closeList();
      output.push(`<p>${line.replace("Intro:", "").trim()}</p>`);
      continue;
    }
    if (line.startsWith("Short answer:")) {
      closeList();
      output.push(`<p><strong>${line}</strong></p>`);
      continue;
    }
    if (line.startsWith("Answer:")) {
      closeList();
      output.push(`<p>${line.replace("Answer:", "").trim()}</p>`);
      continue;
    }
    if (line.startsWith("Quote:")) {
      closeList();
      output.push(`<p><em>${line.replace("Quote:", "").trim()}</em></p>`);
      continue;
    }
    if (line.startsWith("Book Insight:")) {
      closeList();
      output.push(`<p>${line.replace("Book Insight:", "").trim()}</p>`);
      continue;
    }
    if (line.startsWith("Closing:")) {
      closeList();
      output.push(`<p>${line.replace("Closing:", "").trim()}</p>`);
      continue;
    }
    if (line.startsWith("Original Title:") || line.startsWith("Improved Meta Description:") || line.startsWith("Existing H1:") || line.startsWith("Content Tier:") || line.startsWith("ENHANCED BODY CONTENT:")) {
      continue;
    }
    closeList();
    output.push(`<p>${line}</p>`);
  }

  closeList();
  return output.join("\n");
};

const extractMeta = (raw) => {
  const titleMatch = raw.match(/^H1:\s*(.+)$/m);
  const metaMatch = raw.match(/^Improved Meta Description:\s*(.+)$/m);
  return {
    h1: titleMatch ? titleMatch[1].trim() : "",
    meta: metaMatch ? metaMatch[1].trim() : "",
  };
};

const buildBreadcrumbSchema = (path) => {
  const parts = path.split("/").filter(Boolean);
  const items = [{ name: "Home", url: `${contentRoot}/` }];
  let current = "";
  parts.forEach((part) => {
    current += `/${part}`;
    items.push({
      name: part.replace(/-/g, " "),
      url: `${contentRoot}${current}/`,
    });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
};

const buildLegalServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Countrywide Trial Lawyers, APLC",
  "url": contentRoot,
  "telephone": "+1-213-493-6003",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3435 Wilshire Blvd., Suite 1620",
    "addressLocality": "Los Angeles",
    "addressRegion": "CA",
    "postalCode": "90010",
    "addressCountry": "US"
  },
  "areaServed": {
    "@type": "City",
    "name": "Los Angeles",
    "addressRegion": "CA",
    "addressCountry": "US"
  }
});

const buildPersonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Shawn S. Rokni",
  "jobTitle": "President and Managing Attorney",
  "worksFor": {
    "@type": "Organization",
    "name": "Countrywide Trial Lawyers, APLC"
  }
});

const buildFaqSchema = (raw) => {
  const lines = raw.split(/\r?\n/);
  const faqStart = lines.findIndex((line) => line.trim().startsWith("H2: FAQs"));
  if (faqStart === -1) return null;
  const faqItems = [];
  for (let i = faqStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("H2:")) break;
    if (line.startsWith("- ")) {
      const question = line.replace("- ", "").trim();
      const answerLine = (lines[i + 1] || "").trim();
      if (answerLine.startsWith("Answer:")) {
        faqItems.push({
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answerLine.replace("Answer:", "").trim()
          }
        });
      }
    }
  }
  if (!faqItems.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };
};

const initPage = async () => {
  const container = document.querySelector(".content");
  if (!container) return;

  const contentPath = container.getAttribute("data-content-path");
  const parentLink = container.getAttribute("data-parent-link") || "/";
  const parentLabel = container.getAttribute("data-parent-label") || "Personal Injury";
  const isPlaybook = container.getAttribute("data-playbook") === "true";

  const response = await fetch(contentPath);
  const raw = await response.text();

  const meta = extractMeta(raw);
  const title = `${sanitizeTitle(meta.h1)} | Los Angeles Personal Injury Lawyers`;
  document.title = title;
  getMetaTag("description").setAttribute("content", truncate(meta.meta, 155));
  setCanonical(`${contentRoot}${window.location.pathname}`);

  const rendered = container.querySelector(".rendered-content");
  if (rendered) {
    rendered.innerHTML = parseContent(raw);
  }

  const cta = container.querySelector(".cta");
  if (cta) {
    cta.innerHTML = `Ready to talk? <a href="/#contact">Contact us via the homepage form</a>.`;
  }

  const related = document.createElement("p");
  related.innerHTML = `Related: <a href="${parentLink}">${parentLabel}</a>.`;
  rendered.appendChild(related);

  const breadcrumbSchema = buildBreadcrumbSchema(window.location.pathname);
  const breadcrumbNode = document.getElementById("breadcrumb-schema");
  if (breadcrumbNode) {
    breadcrumbNode.textContent = JSON.stringify(breadcrumbSchema);
  }

  const legalNode = document.getElementById("legalservice-schema");
  if (legalNode) {
    legalNode.textContent = JSON.stringify(buildLegalServiceSchema());
  }

  const personNode = document.getElementById("person-schema");
  if (personNode) {
    personNode.textContent = JSON.stringify(buildPersonSchema());
  }

  const faqNode = document.getElementById("faq-schema");
  if (faqNode && isPlaybook) {
    const faqSchema = buildFaqSchema(raw);
    if (faqSchema) {
      faqNode.textContent = JSON.stringify(faqSchema);
    } else {
      faqNode.remove();
    }
  } else if (faqNode) {
    faqNode.remove();
  }
};

document.addEventListener("DOMContentLoaded", initPage);
