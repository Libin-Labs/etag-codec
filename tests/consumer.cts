import api = require('@lp-labs/etag-codec');
const tag: api.EntityTag = api.parseEntityTag('"x"');
void tag;
