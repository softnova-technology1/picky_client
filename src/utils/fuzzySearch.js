/**
 * Ultra-fast, zero-dependency Fuzzy Search & Autocomplete utility for Picky
 * Supports substring match, prefix matching, word boundary bonuses, and Levenshtein typo-tolerance.
 */

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const c1 = s1.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const c2 = s2.charCodeAt(j - 1);
      const cost = c1 === c2 ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,       // insertion
        prev[j] + 1,           // deletion
        prev[j - 1] + cost     // substitution
      );
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }
  return prev[n];
}

/**
 * Calculates a match score between query string and target text:
 * Returns score between 0 (no match) and 1 (exact match).
 */
export function fuzzyMatchScore(query, target) {
  if (!query || !target) return 0;
  const q = String(query).trim().toLowerCase();
  const t = String(target).trim().toLowerCase();
  if (!q || !t) return 0;

  // 1. Exact match
  if (q === t) return 1.0;

  // 2. Starts with query
  if (t.startsWith(q)) return 0.95;

  // 3. Target contains query as whole word or substring
  const index = t.indexOf(q);
  if (index !== -1) {
    const isWordStart = index === 0 || /\s|[-_/]/.test(t.charAt(index - 1));
    return isWordStart ? 0.92 : 0.82;
  }

  // 4. Token-level matching & typo tolerance
  const qWords = q.split(/\s+/).filter(Boolean);
  const tWords = t.split(/\s+/).filter(Boolean);

  let matchedWordsCount = 0;
  let wordScoreSum = 0;

  for (const qWord of qWords) {
    let bestWordScore = 0;

    for (const tWord of tWords) {
      if (tWord === qWord) {
        bestWordScore = Math.max(bestWordScore, 1.0);
        continue;
      }
      if (tWord.startsWith(qWord)) {
        bestWordScore = Math.max(bestWordScore, 0.88);
        continue;
      }
      if (tWord.includes(qWord)) {
        bestWordScore = Math.max(bestWordScore, 0.78);
        continue;
      }

      // Typo tolerance: allow 1 typo for length >= 3, up to 2 typos for length >= 5
      const maxAllowedDist = qWord.length >= 5 ? 2 : qWord.length >= 3 ? 1 : 0;
      if (maxAllowedDist > 0 && Math.abs(tWord.length - qWord.length) <= maxAllowedDist) {
        const dist = levenshteinDistance(qWord, tWord);
        if (dist <= maxAllowedDist) {
          const similarity = 1 - dist / Math.max(qWord.length, tWord.length);
          bestWordScore = Math.max(bestWordScore, 0.7 * similarity);
        }
      }
    }

    if (bestWordScore >= 0.4) {
      matchedWordsCount++;
      wordScoreSum += bestWordScore;
    }
  }

  if (matchedWordsCount === qWords.length) {
    return Math.min(0.9, (wordScoreSum / qWords.length) * 0.9);
  }

  if (matchedWordsCount > 0 && qWords.length > 1) {
    return (matchedWordsCount / qWords.length) * 0.6;
  }

  return 0;
}

/**
 * Searches an array of objects or strings with fuzzy matching
 */
export function fuzzyFilter(items = [], query = '', options = {}) {
  if (!Array.isArray(items)) return [];
  const cleanQ = String(query || '').trim();
  if (!cleanQ) return items;

  const {
    keys = ['name', 'title'],
    threshold = 0.38,
    limit = null,
  } = options;

  const scored = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let maxScore = 0;
    let bestKey = '';

    if (typeof item === 'string') {
      maxScore = fuzzyMatchScore(cleanQ, item);
      bestKey = 'string';
    } else if (item && typeof item === 'object') {
      for (const key of keys) {
        let val = '';
        if (key.includes('.')) {
          const parts = key.split('.');
          let cur = item;
          for (const p of parts) {
            cur = cur ? cur[p] : undefined;
          }
          val = cur;
        } else {
          val = item[key];
        }

        if (Array.isArray(val)) {
          for (const elem of val) {
            const sc = fuzzyMatchScore(cleanQ, elem);
            if (sc > maxScore) {
              maxScore = sc;
              bestKey = key;
            }
          }
        } else if (val !== null && val !== undefined) {
          const sc = fuzzyMatchScore(cleanQ, String(val));
          if (sc > maxScore) {
            maxScore = sc;
            bestKey = key;
          }
        }
      }
    }

    if (maxScore >= threshold) {
      scored.push({ item, score: maxScore, bestKey });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const results = scored.map((s) => s.item);
  return limit && limit > 0 ? results.slice(0, limit) : results;
}
