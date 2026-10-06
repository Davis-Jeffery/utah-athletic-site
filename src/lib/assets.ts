// Builds the image URL map the app uses. Every image is optimized to WebP at build time.
// Keys match the image fields in src/data/programs.ts.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,png,webp}', { eager: true });

// Widths per image group: hero backgrounds are full-bleed, the rest are cards and badges.
const widthFor = (key: string) => (key.startsWith('hero-') ? 2000 : key.startsWith('video-') ? 960 : 320);

let cache: Promise<Record<string, string>> | undefined;

export function buildAssets() {
  cache ??= (async () => {
    const out: Record<string, string> = {};
    for (const [path, mod] of Object.entries(files)) {
      const key = path.split('/').pop()!.replace(/\.[^.]+$/, '');
      const w = Math.min(widthFor(key), mod.default.width);
      const img = await getImage({ src: mod.default, width: w, format: 'webp', quality: 72 });
      out[key] = img.src;
    }
    // Names the ported template uses directly.
    out.logo = '/logo-ua.avif';
    out.heroHome = out['hero-home'];
    out.badgeA = out['slot-ecnl'];
    out.badgeB = out['slot-ea'];
    return out;
  })();
  return cache;
}
