import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyTooledUpCategory} from '../lib/awin/tooled-up-taxonomy.mjs';
const cases=[
 ['DIY','tools'],['Hand Tools','tools'],['Power Tools','tools'],
 ['Garden Tools','garden'],['Lawn Mowers','garden'],
 ["Men's Footwear",'fashion'],["Men's Trousers",'fashion'],
 ['Home Security','home'],['Vacuum Cleaners','home'],
 ['Vehicle Servicing','motoring'],['Auto Care','motoring']
];
test('Tooled Up supplier categories remain meaningful',()=>{
 for(const [input,want] of cases)assert.equal(classifyTooledUpCategory(input),want,input);
});
test('unknown categories remain tools pending taxonomy review',()=>{
 assert.equal(classifyTooledUpCategory('Unmapped Supplier Class'),'tools');
});
