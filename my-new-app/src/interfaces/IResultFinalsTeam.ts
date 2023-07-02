import { Categories } from "../enums";

interface competition{
    number:number,
    takesPart:boolean,
    score:number,
    score2?:number,
    time?:string,
}

interface IResultFinalsTeam{
    key: React.Key;
    scores:string,
    team:string,
    teamName:string,
    total:number;
}
export default IResultFinalsTeam