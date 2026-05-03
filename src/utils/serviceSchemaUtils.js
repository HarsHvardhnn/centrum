import { generateServiceSlug } from "./slugUtils";
import { cm7PostalAddressLd } from "../data/cm7PostalAddressLd";

export const CM7_SITE_URL = "https://centrummedyczne7.pl";

/**
 * Numeric price for schema.org Offer (handles "od 200", "300 zł", plain numbers).
 */
export function parseServicePriceForSchema(price) {
  if (price === null || price === undefined) return null;
  if (typeof price === "number" && Number.isFinite(price)) {
    return Math.trunc(price);
  }
  const s = String(price).trim().toLowerCase();
  if (!s || s === "n/d" || s === "nd" || s === "-") return null;
  const odMatch = s.match(/od\s*(\d+)/);
  if (odMatch) return parseInt(odMatch[1], 10);
  const numMatch = s.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

/**
 * Catalog JSON-LD for /uslugi — same pattern as USG Skarzysko (MedicalClinic + OfferCatalog + Offer + name/price).
 */
export function buildServicesOfferCatalogSchema(services) {
  if (!Array.isArray(services) || services.length === 0) return null;

  const itemListElement = services
    .filter((s) => s && s.title)
    .map((service) => {
      const slug = generateServiceSlug(service.title);
      const path = `/uslugi/${slug}`;
      const priceNum = parseServicePriceForSchema(service.price);
      const offer = {
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalService",
          name: service.title,
          url: `${CM7_SITE_URL}${path}`,
        },
      };
      if (priceNum != null) {
        offer.price = priceNum;
        offer.priceCurrency = "PLN";
      }
      return offer;
    });

  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Centrum Medyczne 7",
    url: `${CM7_SITE_URL}/uslugi`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Usługi medyczne CM7",
      itemListElement,
    },
  };
}

/**
 * Single service page JSON-LD (/uslugi/:slug from CMS).
 */
export function buildMedicalServiceDetailSchema(service, pathSlug) {
  if (!service || !service.title || !pathSlug) return null;

  const priceNum = parseServicePriceForSchema(service.price);
  const desc = (service.shortDescription || service.description || "").trim();

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalService",
    name: service.title,
    url: `${CM7_SITE_URL}/uslugi/${pathSlug}`,
    provider: {
      "@type": "MedicalOrganization",
      name: "Centrum Medyczne 7",
      url: CM7_SITE_URL,
      address: { ...cm7PostalAddressLd },
    },
    areaServed: {
      "@type": "City",
      name: "Skarżysko-Kamienna",
    },
  };

  if (desc) {
    schema.description = desc;
  }
  if (priceNum != null) {
    schema.offers = {
      "@type": "Offer",
      price: String(priceNum),
      priceCurrency: "PLN",
    };
  }

  return schema;
}
