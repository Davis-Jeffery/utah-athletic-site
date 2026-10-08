// Builds the image URL map the site uses. Every image is optimized to WebP at build time.
// Keys are file names in src/assets/images without the extension; content refers to images by key.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,png,webp}', { eager: true });

// Widths per image group. Collage photos get two sizes: a small one for the home
// collage tiles and section photos, and a large one ("<key>@lg") for full-bleed heroes.
const variants = (key: string): [string, number, number][] => {
  if (key.startsWith('collage-')) return [['', 760, 66], ['@lg', 1800, 70]];
  if (key.startsWith('hero-')) return [['', 2000, 72]];
  if (key.startsWith('video-')) return [['', 960, 72]];
  return [['', 320, 80]];
};

let cache: Promise<Record<string, string>> | undefined;

export function buildAssets() {
  cache ??= (async () => {
    const out: Record<string, string> = {};
    for (const [path, mod] of Object.entries(files)) {
      const key = path.split('/').pop()!.replace(/\.[^.]+$/, '');
      for (const [suffix, width, quality] of variants(key)) {
        const img = await getImage({ src: mod.default, width: Math.min(width, mod.default.width), format: 'webp', quality });
        out[key + suffix] = img.src;
      }
    }
    out.logo = '/logo-ua.avif';
    return out;
  })();
  return cache;
}
