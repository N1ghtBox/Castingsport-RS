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
    let D2 = parseInt(a.disciplines[1].score) + parseInt(a.disciplines[1].score2)
    let D3 = parseInt(a.disciplines[2].score)
    let D4 = parseInt(a.disciplines[3].score)
    let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000

    return Math.round((D1 + D2 + D3 + D4 + D5) *1000)/1000
}  

export const getMessageProps = (type:'loading' | 'success' | 'error', content:string, duration:number): ArgsProps =>{
    return {
        type,
        content,
        duration
    }
}