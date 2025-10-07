// Album cover mapping for Leevi and the Leavings albums
// Maps album names from the database to cover image filenames

export const albumCoverMap: Record<string, string> = {
  // Direct matches
  "Bulebule": "bulebule.jpg",
  "Hopeahääpäivä": "hopeahaapaiva.jpg", 
  "Häntä koipien välissä": "hantakoipienvalissa.jpg",
  "Kadonnut laakso": "kadonnutlaakso.jpg",
  "Kerran elämässä": "kerranelamassa.jpg",
  "Käärmenäyttely": "kaarmenayttely.jpg",
  "Mies joka toi rock 'n' rollin Suomeen": "miesjokatoirocknrollinsuomeen.jpg",
  "Musiikkiluokka": "musiikkiluokka.jpg",
  "Onnen avaimet": "onnenavaimet.jpg",
  "Perjantai 14. päivä": "perjantai14paiva.jpg",
  "Raha ja rakkaus": "rahajarakkaus.jpg",
  "Rakkauden planeetta": "rakkaudenplaneetta.jpg",
  "Raparperitaivas": "raparperitaivas.jpg",
  "Single": "single.jpg",
  "Suuteleminen kielletty": "suuteleminenkielletty.jpg",
  "Turkmenialainen tyttöystävä": "turkmenialainentyttoystava.jpg",
  "Varasteleva joulupukki": "varastelevajoulupukki.jpg",
  
  // Additional files that might be used for other albums
  "Keskiviikko": "keskiviikko.jpg", // This appears to be an extra file
}

/**
 * Get the cover image path for an album
 * @param albumName - The album name from the database
 * @returns The path to the cover image, or a default if not found
 */
export function getAlbumCover(albumName: string): string {
  // Try exact match first
  let filename = albumCoverMap[albumName]
  
  // If no exact match, try lowercase
  if (!filename) {
    filename = albumCoverMap[albumName.toLowerCase()]
  }
  
  if (filename) {
    return `/levynkannet/${filename}`
  }
  
  // Fallback to a default cover or the single cover
  return `/levynkannet/single.jpg`
}

/**
 * Get all available album covers
 * @returns Array of album names with their cover paths
 */
export function getAllAlbumCovers(): Array<{ name: string; cover: string }> {
  return Object.entries(albumCoverMap).map(([name, filename]) => ({
    name,
    cover: `/levynkannet/${filename}`
  }))
}

/**
 * Check if an album has a cover image
 * @param albumName - The album name to check
 * @returns True if a cover exists, false otherwise
 */
export function hasAlbumCover(albumName: string): boolean {
  return albumName in albumCoverMap
}
