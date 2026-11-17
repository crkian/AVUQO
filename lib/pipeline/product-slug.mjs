import {createHash} from 'node:crypto';

/** Stable and collision-resistant URL slug. Brand-only inputs must not erase
 * SKU/condition/colour/size from the canonical identity.
 * The identity hash is deterministic; collisions fail safely under DB unique index.
 */
export function canonicalProductSlug(canonicalKey, title){
 if(typeof canonicalKey!=='string'||!canonicalKey.trim())throw new Error('missing_canonical_identity');
 const human=(typeof title==='string'?title:'').normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,82).replace(/-+$/g,'')||'product';
 const digest=createHash('sha256').update(canonicalKey).digest('hex').slice(0,20);
 return `${human}-${digest}`;
}
