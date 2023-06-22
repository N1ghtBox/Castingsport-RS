import { EditOutlined, HomeOutlined, PrinterOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, ConfigProvider, FloatButton, message, notification, Tabs, TabsProps, Tooltip } from "antd";
import { Rule } from "antd/es/form";
import moment from "moment";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import columns from "../columns";
import { Categories, DisciplinesForCategories } from "../enums";
import Competetors from "../interfaces/competetor";
import ICompetition from "../interfaces/Competition";
import DataType from "../interfaces/dataType";
import { getMessageProps, getTotalScoreT3, getTotalScoreT5 } from "../utils";
import EditableTable from "./EditableTable";
import EditModal from "./EditModal";
import ResultsTable from "./ResultsTable";
import ScoreTable from "./ScoreTable";

const { ipcRenderer } = window.require("electron");

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
    key:'T10',
    label:'3-bój'
  },
  {
    key:'T11',
    label:'5-bój'
  },
  {
    key:'T12',
    label:'2-bój odległościowy'
  },
  {
    key:'T13',
    label:'2-bój multi'
  }
];

const Layout = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [competitionInfo, setCompetitionInfo] = useState<ICompetition>({id:'', name:'', logo:''})
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
  const [notificationApi, contextHolderNotifications] = notification.useNotification();
  const [messageApi, contextHolderMessages] = message.useMessage();
  const {state} = useLocation();
  const navigate = useNavigate()


  useEffect(()=>{
    (async ()=>{
      let comp = await ipcRenderer.invoke('getById', state);
      setCompetitionInfo({id:comp.id, name:comp.name, logo:comp.logo})
      setDataSource([...comp.competetors]);
      setInterval(UpdateComp, 1000 * 60 )
    })()
    return () => clearInterval()
  },[state])

  useEffect(()=>{
    return clearInterval()
  },[])

  const UpdateComp = async () => {
    let localDatasource, localCompInfo: ICompetition
    setCompetitionInfo(prev => {localCompInfo = prev; return prev})
    setDataSource(prev => {localDatasource = prev; return prev})
    messageApi.open(getMessageProps('loading', 'Zapisywanie...', 3))
    await ipcRenderer.invoke('saveCompetiton', { name:localCompInfo.name, id:localCompInfo.id, competetors:localDatasource})
    messageApi.destroy()
    messageApi.open(getMessageProps('success', 'Zapisano', 2))
  }

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
        setKey(parseInt(key.slice(1)))
        setIsList(false)
        setShowResults(true)
        if(selectedCategory  === 'Wszyscy'){
          setCategoryFilter(() => (value:any) => {return value.category === 'Kadet'})
          setSelectedCategory('Kadet')
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
          notificationApi.warning({
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
                time:'',
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

      const printResults = () => {
        let competetors = getFilteredCompetetors().sort((a:any,b:any) => {
          if(!a.score2 || !b.score2) return a.score - b.score
          return (a.score + a.score2) - (b.score + b.score2)
        })
        let columns = currentColumns.map(column => column.title)

        
        let info = {
          ...competitionInfo,
          category:selectedCategory,
          dNumber:key,
        }

        clearInterval()
        if(showResults) navigate('/resultsFinals', {state:{columns, results:competetors, info}})
        else navigate('/results', {state:{columns, results:competetors, info}})
      }

      const getFilteredCompetetors = () => {
        return dataSource.filter(competitionFilter).filter(categoryFilter).map((value:DataType) => {
          if(showResults) return value
          return {
            ...value,
            score:value.disciplines[key - 1].score,
            score2:value.disciplines[key - 1].score2,
            time:value.disciplines[key - 1].time,
          }
        })
      }

    return (
        <div className={'mainContainer'}>
          <ConfigProvider
            theme={{
              
              token: {
                
                colorPrimary: '#d9363e',
              },
            }}
          >
            <FloatButton.Group
              trigger="click"
              type="primary"
              style={{ right: 24 }}
              className={'changeBg'}
              icon={<SettingOutlined />}
              >

              {!isList ? 
               selectedCategory === "Wszyscy" ? 
                <Tooltip title="Należy wybrać kategorie">
                  <FloatButton icon={<PrinterOutlined disabled/>} /> 
                </Tooltip>
               :
               dataSource.filter(categoryFilter).length <= 0 ?
                <Tooltip title="Brak zawodników">
                  <FloatButton icon={<PrinterOutlined disabled/>} /> 
                </Tooltip>
               : <FloatButton icon={<PrinterOutlined />} onClick={() => printResults()}/> 
              : null}
              <FloatButton icon={<SaveOutlined />} onClick={() => UpdateComp()}/>
            </FloatButton.Group>
          </ConfigProvider>
          <Breadcrumb
            style={{marginLeft:16}}
            items={[
              {
                href: '/main_window',
                title: <HomeOutlined />,
                onClick: async () => {
                  await UpdateComp()
                  navigate('/main_window')
                }
              },
              {
                title: competitionInfo.name,
              },
            ]}
            />
            <img src={competitionInfo.logo} alt="" style={{position:'absolute', right:16, top:10, height:'5vh'}}/>
            <EditModal
              open={modalOpen}
              editEntity={editEntity}
              onCancel={onCancel}
              onDelete={onDelete}
              onDisqualify={onDisqualify}
            />
            {contextHolderMessages}
            {contextHolderNotifications}
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
                dataSource={getFilteredCompetetors() as any} 
                />
            :
                <ResultsTable
                  getScores={key === 10 ? getTotalScoreT3 : getTotalScoreT5}
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