import test from "node:test";
import assert from "node:assert/strict";
import {suggestFeedCategory} from "../lib/feed-imports/category-suggestions.ts";

const suggest=(merchantName,title,category="")=>suggestFeedCategory({merchantName,title,category});

test("Craft Buddy subcategories include crystal art and flower-making",()=>{
  assert.deepEqual(suggest("Craft Buddy Shop","Cat Crystal Art Card Kit","Arts & Entertainment > Hobbies > Arts & Crafts Kits"),{
    department:"Crafts & Hobbies",subcategory:"Crystal Art & diamond painting",href:"/crafts"
  });
  assert.equal(suggest("Craft Buddy Shop","Forever Flowerz Romantic Roses Kit","Home & Garden > Decor > Artificial Flora")?.subcategory,"Flower-making & decorative crafts");
});

test("Cadbury chocolate and hampers remain separate from grocery live prices",()=>{
  assert.equal(suggest("Cadbury Gifts Direct","Chocolate Gifts", "Hampers")?.subcategory,"Chocolate hampers");
  assert.equal(suggest("Cadbury Gifts Direct","Cadbury Dairy Milk Chocolate Bar 110g","Chocolate")?.subcategory,"Chocolate bars & sharing");
});

test("Petlibro's blank feed category is classified using title only",()=>{
  assert.equal(suggest("Petlibro UK Affiliate Program","Smart Pet Feeder With Camera","")?.subcategory,"Automatic pet feeders");
  assert.equal(suggest("Petlibro UK Affiliate Program","Dockstream Battery Operated Water Fountain",null)?.href,"/pets");
});

test("AKKO ISO-UK and refurbished variants map to their intended department",()=>{
  assert.equal(suggest("AKKO UK","Mineral 02 VIA Custom Mechanical Keyboard","Keyboards")?.href,"/keyboards");
  assert.equal(suggest("AKKO UK","Refurbished M3 Mechanical Keyboard","Keyboards")?.subcategory,"Refurbished keyboards");
});

test("unknown merchant cannot receive a guessed public department",()=>{
  assert.equal(suggest("Unknown Merchant","Crystal Art Card Kit","Craft"),null);
});
