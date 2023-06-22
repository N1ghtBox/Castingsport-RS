import { ArgsProps } from "antd/es/message"
import DataType from "./interfaces/dataType"

export const getTotalScoreT3 = (a:any) => {
    if(!a.disciplines) return 0
    let D3 = parseInt(a.disciplines[2].score)
    let D4 = parseInt(a.disciplines[3].score)
    let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000

    return Math.round((D3 + D4 + D5) *1000)/1000
}   

export const getTotalScoreT5 = (a:any) => {
    if(!a.disciplines) return 0
    let D1 = parseInt(a.disciplines[0].score)
    let D2 = parseFloat(a.disciplines[1].score) + parseFloat(a.disciplines[1].score2)
    let D3 = parseInt(a.disciplines[2].score)
    let D4 = parseInt(a.disciplines[3].score)
    let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000

    return Math.round((D1 + D2 + D3 + D4 + D5) *1000) / 1000
} 

export const getTotalScoreT12 = (a:any) => {
    if(!a.disciplines) return 0
    let D6 = Math.round(parseFloat(a.disciplines[5].score) * 1.5 * 1000) / 1000
    let D7 = Math.round(parseFloat(a.disciplines[6].score) * 1.5 * 1000) / 1000

    return Math.round((D6 + D7) *1000)/1000
} 

export const getTotalScoreT13 = (a:any) => {
    if(!a.disciplines) return 0
    let D8 = Math.round(parseFloat(a.disciplines[7].score) * 1.5 * 1000) / 1000
    let D9 = Math.round(parseFloat(a.disciplines[8].score) * 1.5 * 1000) / 1000

    return Math.round((D8 + D9) *1000)/1000
} 

export const getDisciplineRangeForResults = (key:number): [number,number] => {
    if(key == 10) return [2,5]
    if(key == 11) return [0,5]
    if(key == 12) return [6,8]
    if(key == 13) return [8,10]
    return [0, 10]

}


export const getMessageProps = (type:'loading' | 'success' | 'error', content:string, duration:number, key?:string): ArgsProps =>{
    return {
        type,
        content,
        duration,
        key
    }
}