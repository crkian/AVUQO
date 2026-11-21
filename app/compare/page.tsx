import type { Metadata } from "next";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import ContractCompare from "./ContractCompare";
import "./compare.css";
export const metadata: Metadata = { title: "Compare contracts | AVUQO", description: "Compare the full minimum-term costs of mobile, broadband and TV contracts. Editable illustrative examples, not live provider quotes.", alternates:{canonical:"/compare"}, robots:{index:false,follow:true} };
export default function ComparePage() {
  return <><Header/><main><ContractCompare/></main><Footer/></>;
}
