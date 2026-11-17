/** Awin legacy in_stock is a 1/0 flag; stock_status is not that field.
 * Never infer available inventory from an unexplained numeric stock_status.
 * Source: Awin Hosting and Column Descriptions, in_stock field.
 */
export function normalizeAwinAvailability(fields,format){
 if(format==='google-retail')return {value:String(fields?.availability??'').trim(),source:'availability'};
 const status=String(fields?.stock_status??'').trim();
 const flag=String(fields?.in_stock??'').trim();
 const normalized=status.toLowerCase().replace(/[\s-]+/g,'_');
 if(['out_of_stock','unavailable','sold_out','discontinued'].includes(normalized))
  return {value:'out_of_stock',source:'stock_status'};
 if(flag==='0')return {value:'out_of_stock',source:'in_stock'};
 if(['in_stock','instock','available','low_stock','limited'].includes(normalized))
  return {value:normalized,source:'stock_status'};
 if(flag==='1')return {value:'in_stock',source:'in_stock'};
 return {value:status,source:status?'stock_status_unresolved':'unknown'};
}
