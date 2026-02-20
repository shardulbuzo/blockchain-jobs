import { useMemo } from "react";
import { useRoute } from "wouter";
import Home from "./home";
import { useJobsStore } from "@/state/jobs-store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findBySlug(values: string[], slug: string) {
  return values.find((value) => slugify(value) === slug);
}

export default function FilteredHome() {
  const [, categoryParams] = useRoute("/category/:id");
  const [, sectorParams] = useRoute("/sector/:id");
  const [, countryParams] = useRoute("/country/:id");
  const { categories, sectors, locations } = useJobsStore();

  const kind = categoryParams?.id
    ? "category"
    : sectorParams?.id
      ? "sector"
      : countryParams?.id
        ? "country"
        : "category";

  const slug =
    categoryParams?.id || sectorParams?.id || countryParams?.id || "";

  const match = useMemo(() => {
    if (!slug) return "";
    if (kind === "category") return findBySlug(categories, slug) || "";
    if (kind === "sector") return findBySlug(sectors, slug) || "";
    return findBySlug(locations, slug) || "";
  }, [categories, locations, sectors, kind, slug]);

  const pageTitle =
    kind === "country"
      ? `Crypto Jobs in ${match || slug}`
      : `${match || slug} Jobs`;

  const description =
    kind === "country"
      ? `Browse crypto and web3 jobs in ${match || slug}. Discover roles by company, sector, and category on Crypto Jobs.`
      : `Browse ${match || slug} crypto and web3 jobs. Discover roles by company, sector, and location on Crypto Jobs.`;

  const canonicalPath = `/${kind}/${slug}`;

  return (
    <Home
      filterKey={`${kind}:${slug}`}
      initialFilters={{
        category: kind === "category" ? match || slug : "all",
        sector: kind === "sector" ? match || slug : "all",
        location: kind === "country" ? match || slug : "all",
      }}
      heading={pageTitle}
      seoOverride={{
        title: `${pageTitle} | Crypto Jobs`,
        description,
        canonicalPath,
        keywords: [
          "crypto jobs",
          "web3 jobs",
          "blockchain jobs",
          match || slug,
        ],
        noIndex: !match,
      }}
    />
  );
}
