import { ArgsProps } from "antd/es/message"
import { Categories, Teams } from "./enums"
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
    let D6 = parseFloat(a.disciplines[5].score) + parseFloat(a.disciplines[5].score2)
    let D7 = Math.round(parseFloat(a.disciplines[6].score) * 1.5 * 1000) / 1000

    return Math.round((D6 + D7) *1000)/1000
} 

export const getTotalScoreT13 = (a:any) => {
    if(!a.disciplines) return 0
    let D8 = parseFloat(a.disciplines[7].score)
    let D9 = Math.round(parseFloat(a.disciplines[8].score) * 1.5 * 1000) / 1000
    return Math.round((D8 + D9) *1000) / 1000
} 

export const getCategoriesForDiscipline = (number: number):[number, 5] => {
    if(number === 11) return [1,5]
    if(number === 12 || number === 13) return [3,5]
    if([6,7,8,9].includes(number)) return [3,5]
    if([1,2].includes(number)) return [1,5]
    return [0,5]
}

export const getDisciplineRangeForResults = (key:number): [number,number] => {
    if(key < 10) return [key, key+1]
    if(key == 10) return [2,5]
    if(key == 11) return [0,5]
    if(key == 12) return [5,7]
    if(key == 13) return [7,9]
    return [0, 10]

}

export const getTotalScore = (key:number) => {
    if(key === 10) return (a:any) => getTotalScoreT3(a)
    if(key === 11) return (a:any) => getTotalScoreT5(a)
    if(key === 12) return (a:any) => getTotalScoreT12(a)
    if(key === 13) return (a:any) => getTotalScoreT13(a)
    return () => 0
}

export const mapToTeams = (value:DataType, array: any[], getScore: (value:DataType) => number, type:string) => {
    if(!value.club || !value.team || value.team === Teams.Indywidualnie) return
    if(type !== value.team)  return
    let teamIndex = array.findIndex(team => team.teamName === value.club && team.type === value.team)
    if(teamIndex >= 0){
        let localTeam = array[teamIndex]
        localTeam.scores += `${getScore(value)}\n`
        localTeam.team += `${value.startingNumber} ${value.name}\n`
        localTeam.total += getScore(value)
    }else{
        array.push({
            key:array.length,
            scores: `${getScore(value)}\n`,
            team:`${value.startingNumber} ${value.name}\n`,
            total: getScore(value),
            teamName:`${value.club}`,
            type:`${value.team}`
        })
    }
}

export const checkIfTakesPart = (value:DataType, range:[number,number]) => {
    let takesPart = true
    Object.values(value.disciplines).slice(...range).forEach(dis=>{
        if(!dis.takesPart){
            takesPart = false
            return
        }
    })
    return takesPart
}

export const filterByGender = (x:DataType, selectedCategory:string) => {
  if(selectedCategory === "Wszyscy") return true
  if(selectedCategory === "Senior") return x.category === Categories.Junior || x.category === Categories.Senior || (x.category === Categories.Kadet && !x.girl)
  return x.category === Categories.Juniorka || x.category === Categories.Kobieta || (x.category === Categories.Kadet && x.girl)
}


export const getMessageProps = (type:'loading' | 'success' | 'error', content:string, duration:number, key?:string): ArgsProps =>{
    return {
        type,
        content,
        duration,
        key
    }
}