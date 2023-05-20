import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import IColumns from "./interfaces/columns";
import moment from "moment";

const renderEmpty = (nameOfDataIndex:string) => {
  return (_:any, record:any) => {
    if(record[nameOfDataIndex] === '') return <div style={{width:'100%', height:'30px'}}></div>
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
  },
  {
    title:'Punkty',
    dataIndex:'',
    align:'center',
    width:'20%',
    render(_:any, record:any) {
      return `${Math.round(record.score * 1.5 * 100) / 100}`
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
  },
  {
    title:'Rzut 2',
    dataIndex:'score2',
    editable:true,
    align:'center',
    width:'20%',
  },
]

const columns:IColumns = {
    list:{columns:[
        ...info.map((column:any)=>{return {...column, editable:true}}),
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
}
export default columns;