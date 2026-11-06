export interface EntityTag {
  weak: boolean;
  opaque: string;
}
export type EntityTagCondition = { any: true } | { any: false; tags: EntityTag[] };

function validOpaque(opaque: string): void {
  if (typeof opaque !== 'string' || /[^\x21\x23-\x7e]/.test(opaque))
    throw new TypeError('Entity-tag opaque value contains invalid characters.');
}

export function formatEntityTag(tag: EntityTag): string {
  if (!tag || typeof tag.weak !== 'boolean')
    throw new TypeError('Entity-tag weak flag must be boolean.');
  validOpaque(tag.opaque);
  return `${tag.weak ? 'W/' : ''}"${tag.opaque}"`;
}

export function parseEntityTag(input: string): EntityTag {
  if (typeof input !== 'string' || input.length > 8_192) throw new TypeError('Invalid entity-tag.');
  if (/[\r\n\0]/.test(input)) throw new TypeError('Invalid entity-tag.');
  const match = /^(W\/)?("(?:[\x21\x23-\x7e])*")$(?![\s\S])/.exec(input);
  if (!match) throw new TypeError('Malformed entity-tag.');
  return { weak: match[1] !== undefined, opaque: match[2]!.slice(1, -1) };
}

export function parseEntityTagCondition(input: string): EntityTagCondition {
  if (typeof input !== 'string' || input.length > 16_384 || /[\r\n\0]/.test(input))
    throw new TypeError('Invalid entity-tag condition.');
  const text = input.trim();
  if (text === '*') return { any: true };
  const parts: string[] = [];
  let start = 0,
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') quoted = !quoted;
    else if (text[i] === ',' && !quoted) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (quoted) throw new TypeError('Unterminated entity-tag list.');
  parts.push(text.slice(start).trim());
  if (!parts.length || parts.length > 100 || parts.some((part) => !part))
    throw new TypeError('Invalid entity-tag list.');
  return { any: false, tags: parts.map(parseEntityTag) };
}

export function matchesEntityTag(
  condition: string,
  current: EntityTag | string,
  comparison: 'weak' | 'strong' = 'weak',
  resourceExists = true,
): boolean {
  if (comparison !== 'weak' && comparison !== 'strong')
    throw new TypeError('Invalid entity-tag comparison mode.');
  const parsed = typeof current === 'string' ? parseEntityTag(current) : current;
  if (!parsed || typeof parsed.weak !== 'boolean')
    throw new TypeError('Entity-tag weak flag must be boolean.');
  validOpaque(parsed.opaque);
  const list = parseEntityTagCondition(condition);
  if (list.any) return resourceExists;
  return list.tags.some((tag) => {
    if (comparison === 'strong' && (tag.weak || parsed.weak)) return false;
    return tag.opaque === parsed.opaque;
  });
}
