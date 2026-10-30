/**
 * Owner-facing, advisory taxonomy for private Awin product feed reviews.
 * Categorisation never validates network approval, data/image rights or product freshness.
 */
export type FeedCategorySuggestion = {
  department:string;
  subcategory:string;
  href:"/crafts"|"/chocolate-gifts"|"/pets"|"/keyboards";
};

export function suggestFeedCategory(input:{
  merchantName:string;title:string;category:string|null;
}):FeedCategorySuggestion|null {
  const merchant=input.merchantName.trim().toLowerCase();
  const title=input.title.toLowerCase();
  const rawCategory=(input.category??"").toLowerCase();
  const text=title+" "+rawCategory;

  if(merchant==="craft buddy shop"){
    let subcategory="Craft kits & creative gifts";
    if(/flower|flora|wreath|garland|vase/.test(text)) subcategory="Flower-making & decorative crafts";
    else if(/crystal art|diamond painting|crystal card|gem it|crystal motif/.test(text)) subcategory="Crystal Art & diamond painting";
    else if(/greeting|notecard|card making|papercraft|paper products|cardstock|sticker/.test(text)) subcategory="Cards & papercraft";
    else if(/stamp|die set|stencil|tool|accessor|adhesive|glue/.test(text)) subcategory="Craft tools & accessories";
    else if(/puzzle|figure|collectable|doll/.test(text)) subcategory="Puzzles & creative play";
    return {department:"Crafts & Hobbies",subcategory,href:"/crafts"};
  }
  if(merchant==="cadbury gifts direct"){
    let subcategory="Chocolate & sweet treats";
    if(/hamper|basket/.test(text)) subcategory="Chocolate hampers";
    else if(/birthday|valentine|christmas|easter|occasion|gift/.test(text)) subcategory="Occasion & chocolate gifts";
    else if(/box|collection|selection/.test(text)) subcategory="Chocolate boxes & collections";
    else if(/bar|chocolate/.test(text)) subcategory="Chocolate bars & sharing";
    return {department:"Chocolate & Gifts",subcategory,href:"/chocolate-gifts"};
  }
  if(merchant==="petlibro uk affiliate program"){
    let subcategory="Pet care accessories";
    if(/feeder/.test(text)&&/fountain/.test(text)) subcategory="Feeder & fountain bundles";
    else if(/fountain|water dispenser/.test(text)) subcategory="Water fountains";
    else if(/feeder|feeding/.test(text)) subcategory="Automatic pet feeders";
    else if(/filter/.test(text)) subcategory="Filters & replacement parts";
    return {department:"Pets & Pet Care",subcategory,href:"/pets"};
  }
  if(merchant==="akko uk"){
    let subcategory="Keyboard & desktop accessories";
    if(/refurbished|refurb/.test(text)) subcategory="Refurbished keyboards";
    else if(/keycap/.test(text)) subcategory="Keycaps & customisation";
    else if(/switch/.test(text)) subcategory="Keyboard switches";
    else if(/keyboard|monsgeek|iso-uk/.test(text)) subcategory="Mechanical keyboards";
    return {department:"Mechanical Keyboards",subcategory,href:"/keyboards"};
  }
  return null;
}
