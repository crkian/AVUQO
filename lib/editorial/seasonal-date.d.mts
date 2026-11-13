export type SeasonalMoment = "black-friday" | "christmas" | "valentines" | "easter" | "sales" | "spring" | "summer" | "autumn" | "back-to-school" | "halloween" | "mothers-day" | "fathers-day";
export function ukCivilDate(now:Date):{year:number;month:number;day:number}|null;
export function easterDate(year:number):{year:number;month:number;day:number};
export type SeasonalWindow = {id:SeasonalMoment;name:string;from:string;to:string;href:string;note:string};
export function annualSeasonalWindows(year:number):SeasonalWindow[];
export function editorialMomentForDate(now:Date):SeasonalMoment|null;
