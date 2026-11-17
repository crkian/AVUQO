import test from 'node:test';
import assert from 'node:assert/strict';
import {profileAwinHeader} from '../lib/awin/feed-schema-profile.mjs';
test('recognises retailer fields without row values',()=>{
 const p=profileAwinHeader('id,product_name,search_price,aw_deep_link,availability\n123,Secret Product,99.99,https://secret');
 assert.equal(p.status,'candidate_adapter');assert.equal(p.delimiter,'comma');
 assert.deepEqual(p.fields,['identity','title','price','link','availability']);
 assert.equal(JSON.stringify(p).includes('Secret Product'),false);
});
test('handles semicolon/tab and Google aliases',()=>{
 assert.equal(profileAwinHeader('g:id;g:title;g:price;g:link').status,'candidate_adapter');
 assert.equal(profileAwinHeader('sku\ttitle\tprice').delimiter,'tab');
});
test('quarantines unknowns and redacts unusual identifiers',()=>{
 assert.equal(profileAwinHeader('Thing,???secret??,Cost').status,'needs_schema_probe');
 assert.equal(profileAwinHeader('id,???secret??,price').columns[1],'[redacted]');
 assert.equal(profileAwinHeader('<products><item/></products>').reason,'xml_format');
 assert.equal(profileAwinHeader('{"items":[]}').reason,'json_format');
});
test('does not interpret row contents as extra columns',()=>{
 assert.equal(profileAwinHeader('id,"product_name",price\n1,"chair, blue",5').columnCount,3);
});
