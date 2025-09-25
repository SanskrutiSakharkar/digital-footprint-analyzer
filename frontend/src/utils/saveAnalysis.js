/**
 * Save a report/analysis in a consistent shape so CompareReports can read it.
 * @param {string} name - human label for this run (e.g., "After cleanup Sep 21")
 * @param {object} metrics - numeric-heavy object; nested numbers are fine.
 * @param {object} [meta] - any extras you want to keep (not used in diffing)
 * @returns {string} id
 */
export function saveAnalysis(name, metrics, meta = {}) {
  const id = crypto.randomUUID();
  const payload = {
    __kind: "cloud-footprint-analysis",
    id,
    name,
    createdAt: Date.now(),
    metrics,     // e.g. { accountsTotal: 14, risks.high: 2, categories: { social: 8 } }
    meta,        // optional: raw inputs, notes, etc.
  };
  localStorage.setItem(`analysis:${id}`, JSON.stringify(payload));
  return id;
}
