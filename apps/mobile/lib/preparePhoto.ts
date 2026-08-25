import { ImageManipulator, SaveFormat } from "expo-image-manipulator"

/**
 * Pl@ntNet matches on leaf and flower shape, so a wide photo buys nothing past
 * roughly this width -- and the whole image travels to the API as base64 inside
 * a JSON body, which inflates it by about a third on the way.
 */
const MAX_WIDTH = 1024
const JPEG_QUALITY = 0.7

/**
 * Downscales a picked photo and returns it as base64.
 *
 * launchCameraAsync's own `quality` option only re-encodes on native; the web
 * implementation hands back the file at full resolution. A modern phone camera
 * then clears Vercel's request body limit on its own, and the platform rejects
 * the upload before the API route ever runs -- with no CORS headers on the
 * rejection, so the browser reports it as an opaque "Failed to fetch" rather
 * than a status. Resizing here keeps the payload well underneath that ceiling
 * on both platforms.
 */
export async function preparePhotoForIdentify(uri: string): Promise<string | null> {
  const image = await ImageManipulator.manipulate(uri)
    .resize({ width: MAX_WIDTH })
    .renderAsync()

  const { base64 } = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: JPEG_QUALITY,
    base64: true,
  })

  return base64 ?? null
}
