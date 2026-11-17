/** Deterministic retail taxonomy for Tooled Up's physical-goods master feed.
 * Unknown/ambiguous categories remain in tools; no specialist services or
 * fitted quotes are inferred by name. Original merchant category stays in raw
 * provenance and can support later subcategory drill-down.
 */
export function classifyTooledUpCategory(input){
 const v=String(input??'').trim().toLowerCase();
 if(/footwear|shoe|boot|clothing|trouser|tops|outerwear|hi.vis|high.visibility|workwear|glove|sock|apparel|jacket|men.s|women.s/.test(v))return 'fashion';
 if(/garden|lawn|mower|hedge|plant|watering|outdoor|pressure washer/.test(v))return 'garden';
 if(/vehicle|motor|auto care|car care|garage|automotive|servicing|battery charger/.test(v))return 'motoring';
 if(/household|home security|vacuum|lighting|kitchen|heating|cleaning|bathroom|electrical fittings/.test(v))return 'home';
 if(/paint|decorat|woodwork|hardware|diy|hand tool|power tool|tool|workshop|weld|drill|saw|blade|cutting/.test(v))return 'tools';
 return 'tools';
}
