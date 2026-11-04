/**
 * Basit Markdown (## başlık, 1. / - liste, **kalın**) — e-kitap açıklamaları için.
 * Sunucu ve tarayıcı tarafında kullanılabilir (client bileşeni değil).
 */

export type Block =
  | { kind: 'h'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ol'; items: string[] }
  | { kind: 'ul'; items: string[] };

/** Satır sonları kaybolmuş metinlerde (tek satıra yapışmış) başlık ve liste başlarını ayır */
export function normalize(src: string): string {
  return src
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+(#{2,3} )/g, '\n\n$1')
    .replace(/[ \t]+(\d{1,2}\. \*\*)/g, '\n$1')
    .replace(/[ \t]+([-•] \*\*)/g, '\n$1');
}

export function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  for (const raw of normalize(src).split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) {
      flush();
      // Satır sonu kaybolmuşsa başlık paragrafı yutmasın: uzun başlığı ilk cümlede böl
      const m = h[1].length > 90 ? h[1].match(/^(.{8,120}?[.?!:])\s+(.+)$/) : null;
      if (m) { blocks.push({ kind: 'h', text: m[1] }); para.push(m[2]); }
      else blocks.push({ kind: 'h', text: h[1] });
      continue;
    }
    const ol = line.match(/^\d{1,2}[.)]\s+(.*)$/);
    if (ol) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ol') last.items.push(ol[1]); else blocks.push({ kind: 'ol', items: [ol[1]] });
      continue;
    }
    const ul = line.match(/^[-•*]\s+(.*)$/);
    if (ul) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === 'ul') last.items.push(ul[1]); else blocks.push({ kind: 'ul', items: [ul[1]] });
      continue;
    }
    para.push(line);
  }
  flush();
  return blocks;
}

/** Meta açıklama / kart özeti için düz metin */
export function stripMarkdown(src: string): string {
  return normalize(src)
    .replace(/^#{1,4}\s+/gm, '')
    .replace(/^\s*(\d{1,2}[.)]|[-•*])\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

