/**
 * Chrome/Windows may append " (1)", " (2)", etc. to duplicate Awin downloads.
 * Canonicalise only that suffix, preserving the actual .csv/.csv.gz extension.
 *
 * The name determines at most which PARSER to use, never the advertiser's
 * identity, partnership status, image rights or permission to publish.
 */
export function normalizedFeedFilename(filename: string): string {
  return filename.replace(/ \([1-9]\d*\)(?=\.csv(?:\.gz)?$)/i, '');
}

/** Only the exact Craft Buddy retail-format basename selects its specialised parser. */
export function isCraftBuddyGoogleFeedFilename(filename: string): boolean {
  return /^45747-retail-en_GB\.csv(?:\.gz)?$/i.test(normalizedFeedFilename(filename));
}
