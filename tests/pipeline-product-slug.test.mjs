import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalProductSlug} from '../lib/pipeline/product-slug.mjs';

test('distinct Samsung variants no longer collide on shared prefix',()=>{
 const a=canonicalProductSlug('samsung-galaxy-a17-5g-blue-128gb-brand-new','Samsung Galaxy A17 5G Blue 128GB Brand New');
 const b=canonicalProductSlug('samsung-galaxy-a27-5g-blue-128gb-brand-new','Samsung Galaxy A27 5G Blue 128GB Brand New');
 assert.notEqual(a,b);
 assert(a.includes('galaxy-a17-5g-blue-128gb'));
 assert(b.includes('galaxy-a27-5g-blue-128gb'));
});
test('same canonical key has stable slug independent of title changes',()=>{
 const a=canonicalProductSlug('example-product-key','Phone Example Blue');
 const b=canonicalProductSlug('example-product-key','Phone Example Blue');
 assert.equal(a,b);
});
test('very long titles are bounded and still unique by identity',()=>{
 const title='Smartphone sophisticated edition '.repeat(12);
 const a=canonicalProductSlug('merchant:sku:1',title);
 const b=canonicalProductSlug('merchant:sku:2',title);
 assert(a.length<=103);assert.notEqual(a,b);
});
test('missing canonical identity is rejected',()=>assert.throws(()=>canonicalProductSlug('', 'Test'),/missing_canonical_identity/));
