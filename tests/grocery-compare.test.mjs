// Uses TypeScript source via Node's built-in type stripping (Node >= 22.10 with suitable support).
import test from 'node:test';import assert from 'node:assert/strict';
import {calculateBasket,parsePence} from '../lib/groceries/compare.ts';
import {parseSavedBasket} from '../lib/groceries/storage.ts';
const now=Date.now();const fresh=new Date(now-3600000).toISOString();const stores=[{id:'a',name:'A'},{id:'b',name:'B'}];const basket=[{id:'x',name:'Milk',quantity:2,productId:'p'}];
const price=(store_id,price_pence,extra={})=>({product_id:'p',store_id,price_pence,currency:'GBP',status:'published',is_available:true,usage_rights_confirmed:true,last_checked_at:fresh,expires_at:null,...extra});
test('pennies exact',()=>{assert.equal(parsePence('1.20'),120);assert.equal(parsePence('1.234'),null);});
test('quantities',()=>assert.equal(calculateBasket(basket,stores,[price('a',123)],{},now).results.find(x=>x.store.id==='a').subtotalPence,246));
test('incomplete cannot beat complete',()=>{const r=calculateBasket(basket,stores,[price('b',500)],{},now);assert.deepEqual(r.winners,['b']);});
test('personal override is local',()=>{const r=calculateBasket(basket,stores,[price('a',300),price('b',200)],{x:{a:100}},now);assert.deepEqual(r.winners,['a']);assert.equal(r.results[0].personalCount,1);});
test('ties',()=>assert.equal(calculateBasket(basket,stores,[price('a',200),price('b',200)],{},now).winners.length,2));
test('empty',()=>assert.equal(calculateBasket([],stores,[],{},now).winners.length,0));
test('expiry',()=>assert.equal(calculateBasket(basket,stores,[price('a',200,{expires_at:new Date(now-1000).toISOString()})],{},now).winners.length,0));
test('corrupt guest storage',()=>assert.deepEqual(parseSavedBasket('{broken'),[]));
