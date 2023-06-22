import { Categories } from "../enums";

interface competition{
    number:number,
    takesPart:boolean,
    score:number,
    score2?:number,
    time?:string,
}

interface IResultFinals{
    key: React.Key;
    startingNumber: string;
    disqualified: boolean;
    name: string;
    club: string;
    category: Categories;
    team?: string;
    disciplines: competition[];
    totalScore:number;
}
export default IResultFinals