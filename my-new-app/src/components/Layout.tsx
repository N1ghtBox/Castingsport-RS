import { Tabs, TabsProps, notification } from "antd";
import { useEffect, useState } from "react";
import columns from "../columns";
import { Categories, DisciplinesForCategories } from "../enums";
import Competetors from "../interfaces/competetor";
import DataType from "../interfaces/dataType";
import EditableTable from "./EditableTable";
import ScoreTable from "./ScoreTable";
import { Rule } from "antd/es/form";
import { useLocation } from "react-router-dom";
import { createCompetetorFromFile } from "../utils";

const tabs: TabsProps['items'] = [
  {
    key: 'list',
    label: `Lista`,
  },
  {
    key: 'D1',
    label: `D1`,
  },
  {
    key: 'D2',
    label: `D2`,
  },
  {
    key: 'D3',
    label: `D3`,
  },
  {
    key: 'D4',
    label: `D4`,
  },
  {
    key: 'D5',
    label: `D5`,
  },
  {
    key: 'D6',
    label: `D6`,
  },
  {
    key: 'D7',
    label: `D7`,
  },
  {
    key: 'D8',
    label: `D8`,
  },
  {
    key: 'D9',
    label: `D9`,
  },
  {
    key:'T3',
    label:'3-bój'
  },
  {
    key:'T5',
    label:'5-bój'
  }
];

const Layout = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [currentColumns, setColumns] = useState<any[]>(columns.list.columns)
  const [competitionFilter, setCompetitionFilter] = useState<(value?:any) => boolean>(() => () => true)
  const [categoryFilter, setCategoryFilter] = useState<(value?:any) => boolean>(() => () => true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszyscy')
  const [isList, setIsList] = useState(true)
  const [showAddButton, setShowAddButton] = useState(true)
  const [rules, setRules] = useState<Rule[]>([])
  const [key, setKey] = useState(0)
  const [api, contextHolder] = notification.useNotification();
  const {state} = useLocation();

  useEffect(()=>{
    let data = (state as string[]).map(createCompetetorFromFile)
    console.log(data)
    setDataSource([...data])
  },[state])

    const onChange = (key:string) => {
      if(key === "list"){
         setCompetitionFilter(() => () => true)
         setShowAddButton(true)
      } else {
        setShowAddButton(false)
      }
      if(key.startsWith("D")) {

        setIsList(false)
        setKey(parseInt(key[1]))
        let numberOfCompetition = parseInt(key[1])
        setCompetitionFilter(() => (value:any) => {
          return (Object.values(value.disciplines).find((item:any) => item.number === numberOfCompetition) as any).takesPart
        })
        
      }
      else{
         setIsList(true)
         setKey(0)
        }
      setColumns((columns as any)[key].columns)
      setRules((columns as any)[key].rules)
    }

    const handleSave = (row: DataType) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];

        if(item.startingNumber !== row.startingNumber && newData.find((item) => item.startingNumber === row.startingNumber)){
          api.warning({
            message:`Podany numer startowy został powielony`,
            duration:3,
            placement: 'bottomRight',
          })
          return
        }

        if(item.category !== row.category){
            let set:number = DisciplinesForCategories[row.category as any] as any
            row.disciplines = Object.values(row.disciplines).map((discipline: any, i:number)=>{
              if(row.category === Categories.Kadet) return {
                ...discipline,
                takesPart: i >= 2 && i < 5 ? true : false
              }
              return {
                ...discipline,
                takesPart: i < set ? true : false
              }
            })
        }

        newData.splice(index, 1, {
          ...item,
          ...row,
        });

        setDataSource(newData);
      };

      const handleSaveScore = (row: Competetors) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];

        item.disciplines[key - 1].score = row.score
        item.disciplines[key - 1].time = row.time
        item.disciplines[key - 1].score2 = row.score2

        newData.splice(index, 1, {
          ...item,
        });

        setDataSource(newData);
      };


      const handleAdd = () => {
        const newData: DataType = {
          key: `${dataSource.length + 1}`,
          startingNumber:'',
          name: ``,
          club: '',
          category:Categories.Kadet,
          disciplines:{
            ...Array.from({length:9}, (_:any, i:number) => {
              return {
                score:0,
                number:i+1,
                score2:0,
                time:'_.__.__',
                takesPart: i >= 2 && i < 5 ? true : false,
              }
            })
          }
        };
        setDataSource([...dataSource, newData]);
      };

      const handleCategoryChange = (key:string) => {
        setSelectedCategory(key)
        if(key === "Wszyscy") setCategoryFilter(() => () => true)
        else setCategoryFilter(() => (value:any) => {return value.category === key})
      }

    return (
        <div className={'mainContainer'}>
            {contextHolder}
            {isList ? <EditableTable 
              showAddButton={showAddButton}
              selectedCategory={selectedCategory}
              handleCategoryChange={handleCategoryChange}
              columns={currentColumns}
              handleSave={handleSave}
              dataSource={dataSource.filter(categoryFilter)} 
              handleAdd={handleAdd}/>
            :
            <ScoreTable 
              selectedCategory={selectedCategory}
              handleCategoryChange={handleCategoryChange}
              columns={currentColumns}
              handleSave={handleSaveScore}
              rules={rules}
              dataSource={dataSource.filter(competitionFilter).filter(categoryFilter).map((value:DataType) => {
                return {
                  ...value,
                  score:value.disciplines[key - 1].score,
                  score2:value.disciplines[key - 1].score2,
                  time:value.disciplines[key - 1].time,
                }
              })} />}
            <div style={{display:'flex', position:'absolute', width:'50%', left:0, bottom:0}}>
              <Tabs 
                className={'tabs'}
                tabBarStyle={{margin:0}}
                type="card"
                onChange={onChange}
                defaultActiveKey="1" 
                items={tabs}/>
            </div>
        </div>
    )
}
interface IProps{
    children: any
}

export default Layout;