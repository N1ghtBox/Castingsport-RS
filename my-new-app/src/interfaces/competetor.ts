import { Categories } from "../enums";

interface Competetors {
    key: React.Key;
    startingNumber: string;
    name: string;
    club: string;
    disqualified:boolean
    category: Categories;
    score: number,
    score2?: number,
    time?:string
}
export default Competetors;