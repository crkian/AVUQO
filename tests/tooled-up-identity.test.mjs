import test from 'node:test';
import assert from 'node:assert/strict';
import {tooledUpIdentityText} from '../lib/awin/tooled-up-identity.mjs';

test('very long identical titles from distinct SKU variants have distinct prefix identities',()=>{
 const name='Draper Professional Metal Cutting Disc '.repeat(12);
 const a=tooledUpIdentityText(name,'496:599095');
 const b=tooledUpIdentityText(name,'496:599098');
 assert.notEqual(a.slice(0,120),b.slice(0,120));
 assert.match(a,/^Tooled Up SKU [a-f0-9]{24} /);
});
test('same exact SKU is stable and supports supplier punctuation',()=>{
 const a=tooledUpIdentityText('Drill Bit 1/8in','496:SKU/AB_1');
 assert.equal(a,tooledUpIdentityText('Drill Bit 1/8in','496:SKU/AB_1'));
});
test('reject missing advertiser, SKU or title',()=>{
 assert.throws(()=>tooledUpIdentityText('Drill','31539:123'),/invalid_tooled_up_sku_identity/);
 assert.throws(()=>tooledUpIdentityText('','496:123'),/invalid_tooled_up_sku_identity/);
});
