/**
 * Star Citizen Community Supporter & Contributor Referral Pool
 *
 * HOW TO GET ADDED TO THIS RANDOMIZER:
 * This project is 100% free and open-source. To thank the pilots who keep this
 * suite running and improving:
 *
 * 1. VIA KO-FI: Fuel server hosting at https://ko-fi.com/thenom and include your
 *    Star Citizen referral code (and optional RSI handle) in your donation message.
 * 2. VIA GITHUB: Submit a Pull Request (bug fix, new controller preset in Hardware Studio,
 *    conflict logic improvement, or sc-daemon game patch extraction) and append your
 *    entry to the REFERRAL_POOL array below!
 */

export interface ReferralEntry {
  /** Star Citizen Referral Code (format: STAR-XXXX-XXXX) */
  code: string;
  /** Pilot RSI Handle or community nickname */
  pilotName: string;
  /** Contribution category */
  role: 'creator' | 'supporter' | 'contributor';
  /** Human-readable badge label (e.g. 'Project Creator', 'Ko-fi Supporter', 'Code Contributor') */
  roleLabel: string;
  /** Direct Roberts Space Industries account creation URL */
  enlistUrl?: string;
  /** Date added to the community pool (YYYY-MM-DD) */
  addedDate?: string;
  /** Optional pilot quote, fleet specialization, or shoutout */
  note?: string;
}

/** Permanent creator referral code for the project maintainer */
export const CREATOR_REFERRAL_CODE = 'STAR-7TZ5-ZNDC';
export const CREATOR_ENLIST_URL = `https://www.robertsspaceindustries.com/enlist?referral=${CREATOR_REFERRAL_CODE}`;

export const CREATOR_ENTRY: ReferralEntry = {
  code: CREATOR_REFERRAL_CODE,
  pilotName: 'thenom',
  role: 'creator',
  roleLabel: 'Project Creator',
  enlistUrl: CREATOR_ENLIST_URL,
  addedDate: '2026-09-27',
  note: 'Project Maintainer & Creator'
};

/**
 * The community referral pool.
 * Anyone who supports the project on Ko-fi or contributes code on GitHub can get added here.
 */
export const REFERRAL_POOL: ReferralEntry[] = [
  CREATOR_ENTRY
  // New contributors and Ko-fi supporters can add their entries below:
  // {
  //   code: 'STAR-XXXX-XXXX',
  //   pilotName: 'PilotHandle',
  //   role: 'contributor', // or 'supporter'
  //   roleLabel: 'Code Contributor', // or 'Ko-fi Supporter'
  //   addedDate: '2026-09-27',
  //   note: 'VKB Gladiator HOSAS Profile Contributor'
  // }
];

/**
 * Returns the official RSI enlistment URL for a given referral code.
 */
export function getEnlistUrl(code: string): string {
  const cleanCode = code.trim().toUpperCase();
  return `https://www.robertsspaceindustries.com/enlist?referral=${encodeURIComponent(cleanCode)}`;
}

/**
 * Selects a random referral code from the pool.
 * When multiple codes are registered, avoids picking the currently displayed code if possible.
 */
export function getRandomReferral(
  pool: ReferralEntry[] = REFERRAL_POOL,
  currentCode?: string
): ReferralEntry {
  if (!pool || pool.length === 0) {
    return CREATOR_ENTRY;
  }

  if (pool.length === 1) {
    return pool[0];
  }

  // Filter out current code to ensure a new pick on reroll
  const eligible = currentCode
    ? pool.filter(entry => entry.code.toUpperCase() !== currentCode.toUpperCase())
    : pool;

  const choices = eligible.length > 0 ? eligible : pool;
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}
