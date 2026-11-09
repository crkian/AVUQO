/** Original AVUQO vector artwork. No supplier imagery, logos or stock licensing needed. */
export default function TyreWheelVisual({small=false}:{small?:boolean}){
 const treads=Array.from({length:40},(_,index)=>index);
 const spokes=Array.from({length:10},(_,index)=>index);
 return <svg viewBox="0 0 620 620" width="100%" height="100%" role="img"
  aria-label="Illustration of a performance tyre and alloy wheel"
  style={{maxWidth:small?360:550,filter:"drop-shadow(0 33px 27px rgba(5,5,9,.40))"}}>
  <defs>
   <radialGradient id="rubber" cx="36%" cy="30%" r="76%">
    <stop offset="0%" stopColor="#55525d"/><stop offset="39%" stopColor="#25232c"/>
    <stop offset="78%" stopColor="#121219"/><stop offset="100%" stopColor="#030407"/>
   </radialGradient>
   <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
    <stop stopColor="#fff8fb"/><stop offset=".20" stopColor="#8c879c"/>
    <stop offset=".38" stopColor="#f3e8ec"/><stop offset=".61" stopColor="#4c4959"/>
    <stop offset=".83" stopColor="#d5cdd7"/><stop offset="1" stopColor="#747080"/>
   </linearGradient>
   <radialGradient id="hub"><stop stopColor="#cec4d7"/><stop offset=".6" stopColor="#6b6073"/><stop offset="1" stopColor="#201b2b"/></radialGradient>
   <linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#29232f"/><stop offset=".52" stopColor="#111217"/><stop offset="1" stopColor="#46404a"/></linearGradient>
   <filter id="shine"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <ellipse cx="310" cy="552" rx="205" ry="32" fill="#050309" opacity=".36" filter="url(#shine)"/>
  <g transform="translate(310 295) rotate(-17)">
   <circle r="258" fill="#08090e"/>
   <circle r="249" fill="url(#rubber)" stroke="#47424c" strokeWidth="4"/>
   {treads.map(i=><g key={i} transform={"rotate("+(i*9)+")"}>
    <path d="M-13 -250 L-7 -232 L-30 -217 M12 -250 L7 -232 L29 -216" fill="none" stroke={i%2?"#54515a":"#45444d"} strokeWidth="7" strokeLinecap="round" opacity=".80"/>
    <path d="M-3 -253 L-3 -238" stroke="#111217" strokeWidth="3"/>
   </g>)}
   <circle r="218" fill="url(#side)" stroke="#59525f" strokeWidth="3"/>
   <circle r="207" fill="none" stroke="#665965" strokeWidth="2" opacity=".6"/>
   <circle r="185" fill="#101017" stroke="#3e3c4b" strokeWidth="2"/>
   <path d="M-178 -50 A188 188 0 0 1 137 -128" fill="none" stroke="#aaa0b3" strokeWidth="4" opacity=".36"/>
   <circle r="172" fill="url(#metal)" stroke="#efdfec" strokeWidth="7"/>
   <circle r="151" fill="#18151f" stroke="#a69aa9" strokeWidth="3"/>
   {spokes.map(i=><g key={i} transform={"rotate("+(i*36)+")"}>
    <path d="M-12 -146 L-27 -55 L-8 -31 L-3 -31 L-2 -65 L3 -143Z" fill="url(#metal)" stroke="#c6bbc7" strokeWidth="2"/>
    <path d="M9 -146 L29 -55 L9 -31 L4 -32 L3 -66 L2 -144Z" fill="#a7a0b0" stroke="#e5dbe2" strokeWidth="2"/>
   </g>)}
   <circle r="57" fill="#403848" stroke="#aaa0b6" strokeWidth="5"/>
   <circle r="42" fill="url(#hub)" stroke="#dbccd9" strokeWidth="6"/>
   <circle r="18" fill="#251f31" stroke="#9b8d9d" strokeWidth="3"/>
   {Array.from({length:5},(_,i)=><circle key={i} cx={Math.cos(i*2*Math.PI/5)*44} cy={Math.sin(i*2*Math.PI/5)*44} r="6" fill="#1c1a24" stroke="#a49aaa" strokeWidth="3"/>)}
   <circle r="245" fill="none" stroke="#d6c7da" strokeWidth="2" opacity=".19"/>
  </g>
 </svg>;
}