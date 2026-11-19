"use client";

import {useState} from "react";
import {ImageOff} from "lucide-react";

/** Approved supplier images stay inside the AVUQO product page. */
export default function ProductGallery({images,title}:{images:readonly string[];title:string}){
 const [selected,setSelected]=useState(0);
 const current=images[selected]??images[0];
 return <div>
  <div style={{minHeight:300,display:"grid",placeItems:"center",padding:10}}>
   {current?<img src={current} alt={title+(images.length>1?` image ${selected+1} of ${images.length}`:"")}
     referrerPolicy="no-referrer" style={{width:"100%",maxHeight:430,objectFit:"contain"}}/>:
    <div style={{display:"grid",justifyItems:"center",gap:8}}><ImageOff size={36} aria-hidden="true"/><span>No approved product photo</span></div>}
  </div>
  {images.length>1&&<div aria-label="Product image gallery" style={{display:"flex",gap:8,flexWrap:"wrap",padding:"10px 0"}}>
   {images.map((url,index)=><button key={url} type="button" aria-label={`Show product image ${index+1} of ${images.length}`}
     aria-pressed={selected===index} onClick={()=>setSelected(index)}
     style={{border:selected===index?"2px solid #7443b5":"1px solid #c7bccd",background:"#fff",borderRadius:9,padding:5,cursor:"pointer",width:68,height:68}}>
     <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
    </button>)}
  </div>}
 </div>;
}
