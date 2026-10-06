// Maps the image keys used in src/data/*.ts to optimized Astro image imports.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/images/*.{jpg,png,webp}', {
  eager: true,
});

export function img(key: string): ImageMetadata {
  const match = Object.entries(files).find(([path]) => path.split('/').pop()?.split('.')[0] === key);
  if (!match) throw new Error(`Unknown image key: ${key}`);
  return match[1].default;
}
