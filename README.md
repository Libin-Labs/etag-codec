# @lp-labs/etag-codec

Entity-tag parser/formatter and conditional-list matcher with explicit weak versus strong
comparison. It does not generate content hashes. Independent, zero runtime or peer dependencies.

## Install and quickstart

```bash
npm install @lp-labs/etag-codec
```

```js
import { formatEntityTag, matchesEntityTag } from '@lp-labs/etag-codec';

const current = formatEntityTag({ weak: false, opaque: 'revision-7' });
if (!matchesEntityTag('W/"revision-7"', current, 'weak')) throw new Error('Weak match failed');
```

## API

- `parseEntityTag(text): EntityTag` parses one strong or `W/` weak quoted tag.
- `formatEntityTag(tag): string` formats `{ weak: boolean; opaque: string }`.
- `parseEntityTagCondition(text): EntityTagCondition` parses `*` or a comma-separated tag list.
- `matchesEntityTag(condition, current, comparison?, resourceExists?): boolean` compares a tag
  (object or serialized value) against a condition. Default comparison is `weak`; choose `strong`
  for If-Match semantics. Wildcard matches only when `resourceExists` is true (default true).
- `EntityTagCondition` is `{ any: true } | { any: false; tags: EntityTag[] }`.

Opaque values accept visible ASCII except DQUOTE; controls, malformed tags, empty list members and
CR/LF are rejected. Lists are limited to 100 tags and 16,384 characters. Errors are `TypeError`.
Comparison is O(t) in condition tag count; parsing is linear in input.

This helper does not implement a hash algorithm, parse dates, decide response status, or apply
If-Modified-Since precedence. Use weak comparison for If-None-Match and strong comparison for
If-Match; callers are responsible for choosing the correct HTTP precondition semantics.

Runtime exports: `parseEntityTag`, `formatEntityTag`, `parseEntityTagCondition`,
`matchesEntityTag`. Type exports: `EntityTag`, `EntityTagCondition`. ESM/CommonJS declarations;
Node.js 18+, ES2022, no browser globals.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
