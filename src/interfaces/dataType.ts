import { Categories, Teams } from "../enums";

interface competition{
    number:number,
    takesPart:boolean,
    score:number,
    score2?:number,
    time?:string,
}

type DataType = {
    key: React.Key;
    startingNumber: string;
    disqualified:boolean
    name: string;
    club: string;
    category: Categories;
    team:Teams;
    girl:boolean;
    disciplines: competition[]
}
export default DataType