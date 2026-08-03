import { CustomerDoc } from "@/types/customer";

// Small seeded PRNG so the initial seed is deterministic (and therefore
// diffable/reviewable) rather than pulling in a random-data dependency.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Eleanor", "John", "Diana", "Marcus", "Priya",
  "Wei", "Sofia", "Liam", "Ava", "Noah", "Emma", "Lucas", "Mia", "Ethan",
  "Grace", "Ravi", "Yuki",
];
const LAST_NAMES = [
  "Green", "Ross", "Davis", "Henderson", "Chen", "Patel", "Okafor", "Kim",
  "Nguyen", "Martinez", "Johnson", "Brown", "Wilson", "Anderson", "Clark",
];
export const SEED_COMPANIES = [
  "Acme Corp", "Globex", "Stark Industries", "Innovatech", "Initech",
  "Umbrella Group", "Wayne Enterprises", "Hooli", "Soylent Co", "Pied Piper",
];
const NOTE_SNIPPETS = [
  "Met at product conference. Discussed onboarding needs.",
  "Sent proposal, waiting on legal review.",
  "Very engaged during demo call. Next meeting scheduled.",
  "Requested a discount on annual plan.",
  "Champion left the company, re-engaging with new contact.",
  "Renewal due next quarter, checking in early.",
  "",
];

/**
 * Generates a deterministic batch of realistic-looking customer documents,
 * used ONLY to seed an empty MongoDB collection the first time the app
 * connects to a fresh database. Once seeded, all reads/writes go through
 * MongoDB — this generator never runs again and the app holds no static
 * in-memory dataset.
 */
export function buildSeedCustomers(count: number): CustomerDoc[] {
  const rand = mulberry32(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  function randomDateWithinDays(daysBack: number) {
    const now = Date.now();
    const offset = Math.floor(rand() * daysBack) * 24 * 60 * 60 * 1000;
    return new Date(now - offset).toISOString();
  }

  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const company = pick(SEED_COMPANIES);
    const domain = company.toLowerCase().replace(/[^a-z]/g, "") + ".com";
    const status: CustomerDoc["status"] = rand() > 0.35 ? "active" : "inactive";

    return {
      id: `cust_${String(n).padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${n}@${domain}`,
      phone: `+1 (555) ${String(100 + Math.floor(rand() * 900)).slice(0, 3)}-${String(
        1000 + Math.floor(rand() * 9000)
      ).slice(0, 4)}`,
      company,
      status,
      lastContactDate: randomDateWithinDays(240),
      notes: pick(NOTE_SNIPPETS),
      createdAt: randomDateWithinDays(720),
    };
  });
}
