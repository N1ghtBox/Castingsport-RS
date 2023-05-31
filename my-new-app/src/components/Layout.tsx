import { EditOutlined } from "@ant-design/icons";
import { Tabs, TabsProps, notification } from "antd";
import { Rule } from "antd/es/form";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import columns from "../columns";
import { Categories, DisciplinesForCategories } from "../enums";
import Competetors from "../interfaces/competetor";
import DataType from "../interfaces/dataType";
import { createCompetetorFromFile, getTotalScoreT3, getTotalScoreT5 } from "../utils";
import EditModal from "./EditModal";
import EditableTable from "./EditableTable";
import ResultsTable from "./ResultsTable";
import ScoreTable from "./ScoreTable";
import send from "../renderer";

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
  const [showResults, setShowResults] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntity, setEditEntity] = useState<DataType | undefined>()
  const [rules, setRules] = useState<Rule[]>([])
  const [key, setKey] = useState(0)
  const [api, contextHolder] = notification.useNotification();
  const {state} = useLocation();

  useEffect(()=>{
    let data = (state as string[]).map(createCompetetorFromFile)
    send('test')
    setDataSource([...data])
  },[state])



    const onChange = (key:string) => {
      if(key === "list"){
        setCompetitionFilter(() => () => true)
        setIsList(true)
        setShowResults(false)
      }
      
      if(key.startsWith("D")) {
        setIsList(false)
        setShowResults(false)
        setKey(parseInt(key[1]))
        let numberOfCompetition = parseInt(key[1])
        setCompetitionFilter(() => (value:any) => {
          return (Object.values(value.disciplines).find((item:any) => item.number === numberOfCompetition) as any).takesPart
        })
        
      }

      if(key.startsWith("T")){
        setKey(parseInt(key[1]))
        setIsList(false)
        setShowResults(true)
        if(selectedCategory  === 'Wszyscy'){
          setCategoryFilter(() => (value:any) => {return value.category === 'Junior'})
          setSelectedCategory('Junior')
        }
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
          disqualified:false,
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
      

      const editColumn = {
        title:'Akcje',
        align:'center',
        render: (_:any, record: any) => {
          return <EditOutlined 
            onClick={()=>{
              setModalOpen(true)
              setEditEntity(record)
            }}
          />
        }
      }

      const onCancel = () => {
        setEditEntity(undefined)
        setModalOpen(false)
      }

      const onDelete = () => {
        let localDatasource = [...dataSource]
        localDatasource = localDatasource.filter(data => data.key !== editEntity.key)
        setDataSource([...localDatasource])
        setEditEntity(undefined)
        setModalOpen(false)
      }

      const onDisqualify = () => {
        let localDatasource = [...dataSource]
        let competetorToDisqualify = localDatasource.find(data => data.key === editEntity.key)
        competetorToDisqualify.disqualified = true
        localDatasource = localDatasource.filter(data => data.key !== editEntity.key)
        setDataSource([...localDatasource,competetorToDisqualify])
        setEditEntity(undefined)
        setModalOpen(false)
      }
      

    return (
        <div className={'mainContainer'}>
            <EditModal
              open={modalOpen}
              editEntity={editEntity}
              onCancel={onCancel}
              onDelete={onDelete}
              onDisqualify={onDisqualify}
            />
            {contextHolder}
            {isList ? <EditableTable 
              selectedCategory={selectedCategory}
              handleCategoryChange={handleCategoryChange}
              columns={[...currentColumns, editColumn]}
              handleSave={handleSave}
              dataSource={dataSource.filter(categoryFilter)} 
              handleAdd={handleAdd}/>
            :
            !showResults ? 
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
                })} 
                />
            :
                <ResultsTable
                  getScores={key === 3 ? getTotalScoreT3 : getTotalScoreT5}
                  selectedCategory={selectedCategory}
                  handleCategoryChange={handleCategoryChange}
                  columns={currentColumns}
                  dataSource={dataSource.filter(categoryFilter)} />
            }
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