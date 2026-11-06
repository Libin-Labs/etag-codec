import { formatEntityTag, matchesEntityTag, type EntityTag } from '@lp-labs/etag-codec';
const tag: EntityTag = { weak: false, opaque: 'id' };
const text: string = formatEntityTag(tag);
const matched: boolean = matchesEntityTag(text, tag, 'strong');
// @ts-expect-error comparison mode is weak or strong.
matchesEntityTag(text, tag, 'loose');
void matched;
