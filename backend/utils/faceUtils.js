/**
 * Utility functions for face recognition
 */

const FACE_MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD) || 0.84;
const MAX_EUCLIDEAN_DISTANCE = parseFloat(process.env.MAX_EUCLIDEAN_DISTANCE) || 0.48;

/**
 * Computes cosine similarity between two arrays
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns {number} Value between -1 and 1
 */
const cosineSimilarity = (a, b) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Computes euclidean distance between two arrays
 * @param {number[]} a 
 * @param {number[]} b 
 * @returns {number}
 */
const euclideanDistance = (a, b) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
};

/**
 * Validates a face embedding
 * @param {number[]} embedding 
 * @returns {object} { valid, error }
 */
const validateEmbedding = (embedding) => {
  if (!embedding || !Array.isArray(embedding)) {
    return { valid: false, error: 'Embedding must be an array' };
  }
  if (embedding.length !== 128) {
    return { valid: false, error: `Embedding must have exactly 128 dimensions, got ${embedding.length}` };
  }
  for (let i = 0; i < embedding.length; i++) {
    if (typeof embedding[i] !== 'number' || !Number.isFinite(embedding[i])) {
      return { valid: false, error: 'Embedding elements must be finite numbers' };
    }
  }
  return { valid: true, error: null };
};

/**
 * Finds the best match for a given embedding among a list of profiles using dual strict criteria
 * @param {number[]} embedding 
 * @param {object[]} faceProfiles 
 * @returns {object|null} Match object or null if none above strict threshold
 */
const findBestMatch = (embedding, faceProfiles) => {
  let bestMatch = null;
  let highestSimilarity = -1;
  let lowestDistance = Infinity;

  for (const profile of faceProfiles) {
    const candidateVectors = [];
    if (profile.embedding && profile.embedding.length === 128) {
      candidateVectors.push(profile.embedding);
    }
    if (Array.isArray(profile.embeddings)) {
      for (const vec of profile.embeddings) {
        if (Array.isArray(vec) && vec.length === 128) {
          candidateVectors.push(vec);
        }
      }
    }

    if (candidateVectors.length === 0) continue;

    for (const vec of candidateVectors) {
      const similarity = cosineSimilarity(embedding, vec);
      const distance = euclideanDistance(embedding, vec);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        lowestDistance = distance;
        bestMatch = profile;
      }
    }
  }

  // Enforce strict dual criteria: Cosine similarity >= 0.84 AND Euclidean distance <= 0.48
  if (highestSimilarity >= FACE_MATCH_THRESHOLD && lowestDistance <= MAX_EUCLIDEAN_DISTANCE) {
    // Convert similarity to intuitive match confidence percentage (0-100%)
    const confidencePercent = Math.min(99.9, Math.max(84.0, ((highestSimilarity - 0.5) / 0.5) * 100)).toFixed(1);

    return {
      match: bestMatch,
      similarity: highestSimilarity,
      distance: lowestDistance,
      confidencePercent: parseFloat(confidencePercent),
      userId: bestMatch.userId
    };
  }

  return null;
};

const ACCESS_PERMISSIONS = {
  'Computer Lab': ['student', 'faculty', 'admin'],
  'Library': ['student', 'faculty', 'admin'],
  'Server Room': ['admin'],
  'Faculty Lounge': ['faculty', 'admin'],
  'Exam Hall': ['student', 'faculty', 'admin'],
  'Research Lab': ['faculty', 'admin'],
  'Admin Office': ['admin'],
  'Auditorium': ['student', 'faculty', 'admin']
};

module.exports = {
  FACE_MATCH_THRESHOLD,
  cosineSimilarity,
  euclideanDistance,
  validateEmbedding,
  findBestMatch,
  ACCESS_PERMISSIONS
};
