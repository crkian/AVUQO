/** Private, header-only recognition. Never return sample values or signed URLs. */
const safeName = s => /^[A-Za-z][A-Za-z0-9_ -]{0,63}$/.test(s);
const aliases = {
 identity: ['merchant_product_id','product_id','id','sku','item_id','g:id','offer_id'],
 title: ['product_name','title','name','g:title','product_title'],
 price: ['search_price','price','sale_price','g:price','retail_price'],
 link: ['aw_deep_link','deep_link','product_url','url','link','g:link'],
 currency: ['currency','currency_code','g:currency'],
 availability: ['availability','stock_status','in_stock','g:availability']
};
function splitRecord(s,delimiter){
 const out=[];let value='',quoted=false,closed=false;
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(quoted){if(c==='"'&&s[i+1]==='"'){value+='"';i++;}else if(c==='"'){quoted=false;closed=true;}else value+=c;}
  else if(c==='"'&&!value&&!closed)quoted=true;
  else if(c===delimiter){out.push(value.trim());value='';closed=false;}
  else if(c==='\r'||c==='\n')break;
  else if(closed&&c!==' '&&c!=='\t')return null;
  else if(!closed)value+=c;
 }
 if(quoted)return null;
 out.push(value.trim());return out;
}
export function profileAwinHeader(text,format=''){
 if(typeof text!=='string')return {status:'needs_schema_probe',reason:'sample_unavailable',columns:[],columnCount:0,delimiter:'unknown',fields:[]};
 const head=text.slice(0,8192).replace(/^\uFEFF/,'').trimStart();
 if(/^<\?xml\b|^<\w+[\s>]/i.test(head))return {status:'specialist_adapter',reason:'xml_format',columns:[],columnCount:0,delimiter:'xml',fields:[]};
 if(/^[\[{]/.test(head))return {status:'specialist_adapter',reason:'json_format',columns:[],columnCount:0,delimiter:'json',fields:[]};
 const firstLine=head.split(/\r?\n/,1)[0]||'';
 let winner=null;
 for(const [name,delimiter] of [['tab','\t'],['comma',','],['semicolon',';'],['pipe','|']]){
  const columns=splitRecord(firstLine,delimiter);
  if(columns&&columns.length>1&&columns.length<=256&&(!winner||columns.length>winner.columns.length))winner={name,columns};
 }
 if(!winner)return {status:'needs_schema_probe',reason:'unrecognised_delimiter',columns:[],columnCount:0,delimiter:'unknown',fields:[]};
 const normal=winner.columns.map(x=>x.toLowerCase().replace(/[\s-]+/g,'_'));
 const fields=Object.entries(aliases).filter(([,names])=>names.some(n=>normal.includes(n))).map(([name])=>name);
 const safe=winner.columns.slice(0,120).map(c=>safeName(c)?c:'[redacted]');
 const status=fields.includes('identity')&&fields.includes('title')&&fields.includes('price')?'candidate_adapter':'needs_schema_probe';
 return {status,reason:status==='candidate_adapter'?'header_fields_identified':'missing_core_fields',delimiter:winner.name,columns:safe,columnCount:winner.columns.length,fields,declaredFormat:String(format).slice(0,30).replace(/[^A-Za-z0-9_-]/g,'')};
}
