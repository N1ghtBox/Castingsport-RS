import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import { Teams } from "./enums";
import IColumns from "./interfaces/columns";
import Competetors from "./interfaces/competetor";
import DataType from "./interfaces/dataType";
import { checkIfTakesPart, getDisciplineRangeForResults, getTotalScoreT12, getTotalScoreT13, getTotalScoreT3, getTotalScoreT5 } from "./utils";

const renderEmpty = (nameOfDataIndex:string) => {
  return (_:any, record:any) => {
    if(record[nameOfDataIndex] === '' || record[nameOfDataIndex] === undefined) return <div style={{width:'100%', height:'22px'}}></div>
    return record[nameOfDataIndex]
  }
}

let info = [
  {
    title: 'Nr. startowy',
    dataIndex: 'startingNumber',
    width:'5%',
    align:'center',
    sorter: (a:any,b:any) => a.startingNumber - b.startingNumber, 
    showSorterTooltip:false,
    render: renderEmpty('startingNumber')
  },
  {
    title: 'Imię i nazwisko',
    dataIndex: 'name',
    width: '15%',
    align:'center',
    render: renderEmpty('name')

  },
  {
    title: 'Okręg/Klub',
    dataIndex: 'club',
    width: '15%',
    onFilter: (value: string, record:DataType) => record.club.indexOf(value) === 0,
    align:'center',
    render: renderEmpty('club')
  },
] as any

let scoreWithTime = [
  {
    title:'Wynik',
    dataIndex:'score',
    editable:true,
    sortDirections:['ascend'],
    sorter:{
      multiple:2,
      compare:(a:any,b:any) => b.score - a.score
    },
    align:'center',
    width:'20%',
    render: (_:any, record:Competetors) => {
      return !record.disqualified ? record.score : 'DNS'
    }
  },
  {
    title:'Czas',
    dataIndex:'time',
    editable:true,
    align:'center',
    sortDirections:['ascend'],
    sorter:
    {
      multiple:1,
      compare: (a:any,b:any) => {
        let time = moment(a.time, 'm.ss.SS')
	let difference = moment(b.time, 'm.ss.SS').diff(time)
        return difference
      }
    },
    width:'20%',
    render: renderEmpty('time')

  }
]

let scoreDistanceHighest = [
  {
    title:'Odległość',
    dataIndex:'score',
    editable:true,
    align:'center',
    width:'20%',
    sortDirections:['ascend'],
    sorter: (a:any,b:any) => b.score - a.score,
    render(_:any,record:any){
      return !record.disqualified ? parseFloat(record.score).toFixed(2) : 'DNS'
    }
  },
  {
    title:'Punkty',
    dataIndex:'',
    align:'center',
    width:'20%',
    render(_:any, record:any) {
      return !record.disqualified ? `${(Math.round(record.score * 1500) / 1000).toFixed(3)}` : '-'
    },
  }
]

let scoreDistanceFly = [
  {
    title:'Rzut 1',
    dataIndex:'score',
    editable:true,
    align:'center',
    width:'20%',
  
    render(_:any,record:any){
      return !record.disqualified ? parseFloat(record.score).toFixed(2) : 'DNS'
    }
  },
  {
    title:'Rzut 2',
    dataIndex:'score2',
    editable:true,
    align:'center',
    width:'20%',
    render(_:any,record:any){
      return !record.disqualified ? parseFloat(record.score2).toFixed(2) : 'DNS'
    }
  },
  {
    title:'Wynik',
    align:'center',
    width:'10%',
    sortDirections:['ascend'],
    sorter:(a:any,b:any) => (parseFloat(b.score) + parseFloat(b.score2)) - (parseFloat(a.score) + parseFloat(a.score2)),
    render(_:any,record:any){
      return !record.disqualified ? (parseFloat(record.score2) + parseFloat(record.score)).toFixed(2) : 'DNS'
    }
  },
]

const columns:IColumns = {
      list:{
        columns:[
        ...info.map((column:any) => {return {...column, editable:true}}),
        {
          title:'Drużyna',
          dataIndex:'team',
          align:'center',
          editable:true,
          render: (value:keyof typeof Teams) => {
            return `${Teams[value]}` 
          }
        },
        {
          title: 'Kategoria',
          dataIndex: 'category',
          align:'center',
          editable:true,
          render: renderEmpty('category')
        },
        {
          title:'3-bój',
          dataIndex:'D3-5',
          align:'center',
          render: (_:any,value:any) => {
            return (
                <div>
                    {checkIfTakesPart(value,[2,5]) ? <CheckOutlined style={{color:'green'}}/> : <CloseOutlined style={{color:'red'}}/>}
                </div>)
          },
        },
        {
          title:'5-bój',
          dataIndex:'D1-2',
          align:'center',
          editable:true,
          render: (_:any,value:any) => {
            return (
                <div>
                    {checkIfTakesPart(value,[0,2]) ? <CheckOutlined style={{color:'green'}}/> : <CloseOutlined style={{color:'red'}}/>}
                </div>)
          },
        },
        {
          title:'2-bój odległościowy',
          dataIndex:'D6-7',
          align:'center',
          editable:true,
          render: (_:any,value:any) => {
            return (
                <div>
                    {checkIfTakesPart(value,getDisciplineRangeForResults(12)) ? <CheckOutlined style={{color:'green'}}/> : <CloseOutlined style={{color:'red'}}/>}
                </div>)
          },
        },
        {
          title:'2-bój multi',
          dataIndex:'D8-9',
          align:'center',
          editable:true,
          render: (_:any,value:any) => {
            return (
                <div>
                    {checkIfTakesPart(value,getDisciplineRangeForResults(13)) ? <CheckOutlined style={{color:'green'}}/> : <CloseOutlined style={{color:'red'}}/>}
                </div>)
          },
        }
        // ...Array.from({length:9}, (_:any, i: number) => {
        //     return {
        //         title:`D${i + 1}`,
        //         dataIndex:`D${i + 1}`,
        //         editable:true,
        //         align:'center',
        //         render: (_:any, value:any) => {
        //             let discipline = value.disciplines[i]
        //             return (
        //                 <div>
        //                     {discipline.takesPart ? <CheckOutlined style={{color:'green'}}/> : <CloseOutlined style={{color:'red'}}/>}
        //                 </div>)
        //         },
        //     } as any
        // })
        ], rules:[]
      },
      D1:{
        columns:[
        ...info,
        ...scoreWithTime
      ], rules:[
        {
          pattern: new RegExp('^[05]$|^([1-9][05])$|^100$'),
          message: "Nieprawidłowy wynik"
        }
      ]
      },
      D2:{
        columns:[
        ...info,
        ...scoreDistanceFly
      ], rules:[
        {
          pattern:new RegExp('^[0]|[1-9][0-9][0-9]?\.[0-9][0-9]$'),
          message:'Nieprawidłowy format'
        }
      ]
      },
      D3:{
        columns:[
        ...info,
        ...scoreWithTime
      ], rules:[
        {
          pattern: new RegExp('^[02468]$|^([1-9][02468])$|^100$'),
          message: "Nieprawidłowy wynik"
        }
      ]
      },
      D4:{
        columns:[
          ...info,
          ...scoreWithTime
        ], rules:[
        {
          pattern: new RegExp('^[05]$|^([1-9][05])$|^100$'),
          message: "Nieprawidłowy wynik"
        }
      ]
      },
      D5:{
        columns:[
          ...info,
          ...scoreDistanceHighest
        ], 
        rules:[
          {
            pattern:new RegExp('^[0]|[1-9][0-9][0-9]?\.[0-9][0-9]$'),
            message:'Nieprawidłowy format'
          }
        ]
      },
      D6:{
        columns:[
          ...info,
          ...scoreDistanceFly
        ], 
        rules:[
          {
            pattern:new RegExp('^[0]|[1-9][0-9][0-9]?\.[0-9][0-9]$'),
            message:'Nieprawidłowy format'
          }
        ]
      },
      D7:{
        columns:[
        ...info,
        ...scoreDistanceHighest
      ], rules:[
        {
          pattern:new RegExp('^[0]|[1-9][0-9][0-9]?\.[0-9][0-9]$'),
          message:'Nieprawidłowy format'
        }
      ]
      },
      D8:{
        columns:[
        ...info,
        ...scoreWithTime
      ], rules:[
        {
          pattern: new RegExp('^[05]$|^([1-9][05])$|^100$'),
          message: "Nieprawidłowy wynik"
        }
      ]
      },
      D9:{
        columns:[
        ...info,
        ...scoreDistanceHighest
        ], rules:[
          {
            pattern:new RegExp('^[0]|[1-9][0-9][0-9]?\.[0-9][0-9]$'),
            message:'Nieprawidłowy format'
          }
        ]
      },
      T10:{
        columns:[
          ...info,
          ...Array.from({length:3}, (_:any, i: number) => {
            return {
                title:`K${i + 3}`,
                align:'center',
                render: (_:any, value:any) => {
                    let discipline = value.disciplines[i+2]
                    return !value.disqualified ? i+3 === 5 ? Math.round(discipline.score * 1500) /1000 : discipline.score : 'DNS'
                },
            } as any
        }),
        {
          title:'D3-5',
          sorter:(a:any, b:any) => {
            let totalScoreA = getTotalScoreT3(a)
            let totalScoreB = getTotalScoreT3(b)
            return !a.disqualified ? totalScoreA - totalScoreB : -1
          },
          defaultSortOrder:'descend',
          sortOrder:'descend',
          sortDirections:['descend'],
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT3(value)
            return !value.disqualified ? totalScore.toFixed(3) : '---'
          }
        }
        ],
        rules:[]
      },
      T11:{
        columns:[
          ...info,
          ...Array.from({length:5}, (_:any, i: number) => {
            return {
                title:`K${i + 1}`,
                align:'center',
                render: (_:any, value:any) => {
                  let discipline = value.disciplines[i]
                    return !value.disqualified ? i + 1 === 5 ? 
                          Math.round(discipline.score * 1.5 * 1000) / 1000 :
                          discipline.score2 > 0 ? `${(Math.round(discipline.score * 100) / 100).toFixed(2)}\t${(Math.round(discipline.score2 * 100) / 100).toFixed(2)}` : discipline.score
                          : 'DNS'
                          
                },
            } as any
        }),
        {
          title:'K1-5',
          sorter:(a:any, b:any) => {
            let totalScoreA = getTotalScoreT5(a)
            let totalScoreB = getTotalScoreT5(b)
            return !a.disqualified ? totalScoreA - totalScoreB : -1
          },
          defaultSortOrder:'descend',
          sortOrder:'descend',
          sortDirections:['descend'],
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT5(value)
            return !value.disqualified ? totalScore.toFixed(3) : 'DNS'
          }
        }
        ],
        rules:[]
      },
      T12:{
        columns:[
          ...info,
          ...Array.from({length:2}, (_:any, i: number) => {
            return {
                title:`K${i + 6}`,
                align:'center',
                render: (_:any, value:any) => {
                    let discipline = value.disciplines[i + 5]
			let score = discipline.score
			if(i + 5 === 6) score = Math.round(discipline.score * 1500) /1000
                    return !value.disqualified ? discipline.score2 ? `${score}\t${discipline.score2}` : `${score}` : 'DNS'
                },
            } as any
        }),
        {
          title:'K6-7',
          sorter:(a:any, b:any) => {
            let totalScoreA = getTotalScoreT12(a)
            let totalScoreB = getTotalScoreT12(b)
            return !a.disqualified ? totalScoreA - totalScoreB : -1
          },
          defaultSortOrder:'descend',
          sortOrder:'descend',
          sortDirections:['descend'],
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT12(value)
            return !value.disqualified ? totalScore.toFixed(3) : '---'
          }
        }
        ],
        rules:[]
      },
      T13:{
        columns:[
          ...info,
          ...Array.from({length:2}, (_:any, i: number) => {
            return {
                title:`K${i + 8}`,
                align:'center',
                render: (_:any, value:any) => {
                    let discipline = value.disciplines[i + 7]
                    return !value.disqualified ? i + 8 === 9 ? Math.round(discipline.score * 1500) /1000 : discipline.score : 'DNS'
                },
            } as any
        }),
        {
          title:'K8-9',
          sorter:(a:any, b:any) => {
            let totalScoreA = getTotalScoreT13(a)
            let totalScoreB = getTotalScoreT13(b)
            return !a.disqualified ? totalScoreA - totalScoreB : -1
          },
          defaultSortOrder:'descend',
          sortOrder:'descend',
          sortDirections:['descend'],
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT13(value)
            return !value.disqualified ? totalScore.toFixed(3) : '---'
          }
        }
        ],
        rules:[]
      }
}
export default columns;