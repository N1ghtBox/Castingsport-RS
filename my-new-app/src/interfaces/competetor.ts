import { Categories } from "../enums";

interface Competetors {
    key: React.Key;
    startingNumber: string;
    name: string;
    club: string;
    category: Categories;
    score: number,
    score2?: number,
    time?:string
}
export default Competetors;