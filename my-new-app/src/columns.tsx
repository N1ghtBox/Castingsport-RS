import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import IColumns from "./interfaces/columns";
import Competetors from "./interfaces/competetor";
import { getTotalScoreT3, getTotalScoreT5 } from "./utils";

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
    title: 'Okręg',
    dataIndex: 'club',
    width: '15%',
    align:'center',
    render: renderEmpty('club')
  },
  {
    title: 'Kategoria',
    dataIndex: 'category',
    align:'center',
    render: renderEmpty('category')
},
] as any

let scoreWithTime = [
  {
    title:'Wynik',
    dataIndex:'score',
    editable:true,
    sorter:{
      multiple:2,
      compare:(a:any,b:any) => a.score - b.score
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
    sorter:
    {
      multiple:1,
      compare: (a:any,b:any) => {
        let time = moment(b.time, 'm.ss.SS')
        return moment(a.time, 'm.ss.SS').subtract({minutes:time.minutes(), seconds:time.seconds(), milliseconds:time.milliseconds()})
      }
    },
    width:'20%',
  }
]

let scoreDistanceHighest = [
  {
    title:'Odległość',
    dataIndex:'score',
    editable:true,
    align:'center',
    width:'20%',
    sorter: (a:any,b:any) => a.score - b.score,
    render(_:any,record:any){
      return !record.disqualified ? record.score.toFixed(2) : 'DNS'
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
    sorter:{
      multiple:2,
      compare:(a:any,b:any) => a.score - b.score
    },
    render(_:any,record:any){
      return !record.disqualified ? record.score.toFixed(2) : 'DNS'
    }
  },
  {
    title:'Rzut 2',
    dataIndex:'score2',
    editable:true,
    align:'center',
    width:'20%',
    sorter:{
      multiple:1,
      compare:(a:any,b:any) => a.score - b.score
    },
    render(_:any,record:any){
      return !record.disqualified ? record.score2.toFixed(2) : 'DNS'
    }
  },
]

const columns:IColumns = {
    list:{columns:[
        ...info.map((column:any)=>{return {...column, editable:true}}),
        {
          title:'Drużyna',
          dataIndex:'team',
          align:'center',
          editable:true,
          render:renderEmpty('team') 
        },
        ...Array.from({length:9}, (_:any, i: number) => {
            return {
                title:`D${i + 1}`,
                dataIndex:`D${i + 1}`,
                editable:true,
                align:'center',
                render: (_:any, value:any) => {
                    let discipline = value.disciplines[i]
                    return (
                        <div>
                            {discipline.takesPart ? <CheckOutlined /> : <CloseOutlined />}
                        </div>)
                },
            } as any
        })
      ], rules:[]},
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
      T3:{
        columns:[
          ...info,
          ...Array.from({length:3}, (_:any, i: number) => {
            return {
                title:`D${i + 3}`,
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
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT3(value)
            return !value.disqualified ? totalScore : '---'
          }
        }
        ],
        rules:[]
      },
      T5:{
        columns:[
          ...info,
          ...Array.from({length:5}, (_:any, i: number) => {
            return {
                title:`D${i + 1}`,
                align:'center',
                render: (_:any, value:any) => {
                    let discipline = value.disciplines[i]
                    return !value.disqualified ? i + 1 === 5 ? 
                          Math.round(discipline.score * 1.5 * 1000) / 1000 :
                          discipline.score2 !== undefined ? `${(Math.round(discipline.score * 100) / 100).toFixed(2)}\t${(Math.round(discipline.score2 * 100) / 100).toFixed(2)}` : discipline.score
                          : 'DNS'
                          
                },
            } as any
        }),
        {
          title:'D1-5',
          sorter:(a:any, b:any) => {
            let totalScoreA = getTotalScoreT5(a)
            let totalScoreB = getTotalScoreT5(b)
            return !a.disqualified ? totalScoreA - totalScoreB : -1
          },
          defaultSortOrder:'descend',
          sortOrder:'descend',
          render: (_:any, value:any) => {
            let totalScore =  getTotalScoreT5(value)
            return !value.disqualified ? totalScore : 'DNS'
          }
        }
        ],
        rules:[]
      },
}
export default columns;