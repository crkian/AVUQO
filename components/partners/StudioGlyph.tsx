/** Original AVUQO editorial category motifs. These line icons do not
 * impersonate any supplier logo, official artwork or trademark. */
import {
 Wrench,PawPrint,Puzzle,Gift,Smartphone,Palette,CarFront,Route,
 Plane,ParkingCircle,ClipboardCheck,Wifi,Users,Zap,RadioTower,
 SimCard,Signal,MessageCircle,LifeBuoy,House,Mail
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import type {StudioEditorial} from "../../lib/partners/studio-editorial";

const sceneIcons:Readonly<Record<StudioEditorial["scene"],LucideIcon>>={
 workbench:Wrench,companion:PawPrint,storybook:Puzzle,confectionery:Gift,
 handsets:Smartphone,atelier:Palette,garage:CarFront,roadbook:Route,
 departures:Plane,parking:ParkingCircle,mot:ClipboardCheck,connection:Wifi,
 cooperative:Users,energy:Zap,fibre:RadioTower,mobile:SimCard,
 everyday:Signal,conversation:MessageCircle,rescue:LifeBuoy,property:House,festive:Mail
};
export const sceneIcon=(scene:StudioEditorial["scene"]):LucideIcon=>sceneIcons[scene];
