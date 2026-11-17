import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAwinAvailability} from '../lib/awin/stock-availability.mjs';
test('Awin legacy in_stock 1 means available',()=>{
 assert.deepEqual(normalizeAwinAvailability({stock_status:'1',in_stock:'1'},'awin-csv'),{value:'in_stock',source:'in_stock'});
});
test('out of stock takes precedence and zero cannot be published',()=>{
 assert.equal(normalizeAwinAvailability({stock_status:'in_stock',in_stock:'0'},'awin-csv').value,'out_of_stock');
 assert.equal(normalizeAwinAvailability({stock_status:'out_of_stock',in_stock:'1'},'awin-csv').value,'out_of_stock');
});
test('numeric status without documented in_stock cannot imply stock',()=>{
 assert.deepEqual(normalizeAwinAvailability({stock_status:'1'},'awin-csv'),{value:'1',source:'stock_status_unresolved'});
 assert.equal(normalizeAwinAvailability({},'awin-csv').source,'unknown');
});
test('Google availability remains literal',()=>{
 assert.equal(normalizeAwinAvailability({availability:'preorder'},'google-retail').value,'preorder');
});
