import type {Metadata} from "next";
import type {ReactNode} from "react";
export const metadata:Metadata={
 title:"Reality Check | Investigate a deal | AVUQO",
 description:"Submit a retailer link for AVUQO source checks. Unknown prices and unverified offers are never presented as confirmed deals.",
 alternates:{canonical:"/reality-check"},
 robots:{index:true,follow:true}
};
export default function RealityCheckLayout({children}:{children:ReactNode}){return children;}
