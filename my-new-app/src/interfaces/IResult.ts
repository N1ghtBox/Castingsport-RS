import { Categories } from "../enums";

interface competition{
    number:number,
    takesPart:boolean,
    score:number,
    score2?:number,
    time?:string,
}

interface IResult{
    score: number;
    score2: number;
    time: string;
    key: React.Key;
    startingNumber: string;
    disqualified: boolean;
    name: string;
    club: string;
    category: Categories;
    team?: string;
    disciplines: competition[];
}
export default IResult