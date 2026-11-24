type Feed={advertiser:string;feed:string};
type Attempt={advertiser_id:string|null;feed_id:string|null;started_at:string};
export function selectPortfolioFeed<T extends Feed>(feeds:readonly T[],attempts:readonly Attempt[],offset=0):T|undefined{
 const last=new Map<string,number>();
 for(const a of attempts){
  if(!a.advertiser_id||!a.feed_id)continue;
  const time=Date.parse(a.started_at);
  if(!Number.isFinite(time))continue;
  const key=a.advertiser_id+":"+a.feed_id;
  last.set(key,Math.max(last.get(key)??0,time));
 }
 const ordered=[...feeds].sort((a,b)=>(last.get(a.advertiser+":"+a.feed)??0)-(last.get(b.advertiser+":"+b.feed)??0));
 return ordered.length?ordered[offset%ordered.length]:undefined;
}
