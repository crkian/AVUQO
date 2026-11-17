import test from 'node:test';
import assert from 'node:assert/strict';
import {collectAwinImages,selectAwinPrimaryImage} from '../lib/awin/collect-images.mjs';

test('preserves Awin image variants in priority order without duplicates',()=>{
 const images=collectAwinImages({
  merchant_image_url:'https://images.example.com/main.jpg',
  aw_image_url:'https://images.example.com/awin.jpg',
  merchant_thumb_url:'https://images.example.com/thumb.jpg',
  large_image:'https://images.example.com/large.jpg',
  alternate_image:'https://images.example.com/alt.jpg',
  alternate_image_two:'https://images.example.com/alt2.jpg',
  alternate_image_three:'https://images.example.com/alt3.jpg',
  alternate_image_four:'https://images.example.com/alt4.jpg',
  aw_thumb_url:'https://images.example.com/thumb.jpg'
 },'96428');
 assert.equal(images.length,8);
 assert.equal(selectAwinPrimaryImage(images).url,'https://images.example.com/main.jpg');
 assert(images.every(x=>x.feed_id==='96428'&&x.source_field&&x.role));
});
test('recognises Google additional images and eliminates duplicates',()=>{
 const images=collectAwinImages({image_link:'https://cdn.example.com/a.jpg',
 additional_image_link:'https://cdn.example.com/a.jpg, https://cdn.example.com/b.jpg',
 lifestyle_image_link:'https://cdn.example.com/lifestyle.jpg'},'F5142');
 assert.equal(images.length,3);
});
test('refuses unsafe or private URLs',()=>{
 const images=collectAwinImages({
  merchant_image_url:'http://example.com/a.jpg',
  aw_image_url:'https://localhost/test.jpg',
  alternate_image:'https://127.0.0.1/private',
  large_image:'https://cdn.example.com/pic.jpg',
  aw_thumb_url:'https://user:password@cdn.example.com/img.jpg'
 },'96428');
 assert.equal(images.length,1);
 assert.equal(images[0].source_field,'large_image');
});
test('empty feed remains unpictured, no invented placeholders',()=>{
 assert.deepEqual(collectAwinImages({},'96428'),[]);
 assert.equal(selectAwinPrimaryImage([]),null);
});
