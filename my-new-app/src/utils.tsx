import DataType from "./interfaces/dataType"

export const getTotalScoreT3 = (a:any) => {
    let D3 = parseInt(a.disciplines[2].score)
    let D4 = parseInt(a.disciplines[3].score)
    let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000

    return Math.round((D3 + D4 + D5) *1000)/1000
}   

export const getTotalScoreT5 = (a:any) => {
    let D1 = parseInt(a.disciplines[0].score)
    let D2 = parseInt(a.disciplines[1].score) + parseInt(a.disciplines[1].score2)
    let D3 = parseInt(a.disciplines[2].score)
    let D4 = parseInt(a.disciplines[3].score)
    let D5 = Math.round(parseFloat(a.disciplines[4].score) * 1.5 * 1000) / 1000

    return Math.round((D1 + D2 + D3 + D4 + D5) *1000)/1000
}  

export const createCompetetorFromFile = (data: string) => {
    let values = data.split(',')
    let competetor:DataType = {
        key: parseInt(values[0]),
        startingNumber:values[1],
        disqualified:false,
        name:values[2],
        club:values[3],
        category:values[4] as any,
        disciplines: [...values.slice(5).map((value:string, i:number) => {
            if(i === 1) return {
                takesPart:true,
                number:i + 1,
                score: parseFloat(value.split('-')[0]),
                score2: parseFloat(value.split('-')[1]),
            }
            return {
                takesPart:true,
                score: i === 4 ? parseFloat(value) : parseInt(value),
                number:i + 1,
                time:'_.__.__'
            }
        }),
        ...Array.from({length:4}, (_:any, i:number) => {
            return {
                takesPart:false,
                number:i + 6,
                score:0,
                score2:0,
            }
        })
    ]

    }
    return competetor
}