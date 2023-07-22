import { EditOutlined, FilePdfOutlined, HomeOutlined, PrinterOutlined, SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, ConfigProvider, FloatButton, message, notification, Tabs, TabsProps, Tooltip } from "antd";
import { Rule } from "antd/es/form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import columns from "../columns";
import { Categories, DisciplinesForCategories, Teams } from "../enums";
import Competetors from "../interfaces/competetor";
import ICompetition from "../interfaces/Competition";
import DataType from "../interfaces/dataType";
import { checkIfTakesPart, filterByGender, getDisciplineRangeForResults, getMessageProps, getTotalScore } from "../utils";
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
  const [competitionInfo, setCompetitionInfo] = useState<ICompetition>({id:'', name:'', logo:'', date:'', mainJudge:'', secretaryJudge:''})
  const [currentColumns, setColumns] = useState<any[]>(columns.list.columns)
  const [competitionFilter, setCompetitionFilter] = useState<(value?:any) => boolean>(() => () => true)
  const [categoryFilter, setCategoryFilter] = useState<(value?:any) => boolean>(() => () => true)
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszyscy')
  const [typeOfTeams, setTypeOfTeams] = useState<string>(Teams.Młodzieżowa)
  const [isList, setIsList] = useState(true)
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>()
  const [showResults, setShowResults] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntity, setEditEntity] = useState<DataType | undefined>()
  const [rules, setRules] = useState<Rule[]>([])
  const [key, setKey] = useState(0)
  const [notificationApi, contextHolderNotifications] = notification.useNotification();
  const [type, setType] = useState<'Indywidualnie' | 'Drużyny'>('Indywidualnie');
  const [messageApi, contextHolderMessages] = message.useMessage();
  const [tabKey, setTabKey] = useState("list")
  const {state} = useLocation();
  const navigate = useNavigate()


  useEffect(()=>{
    if(state.key) onChange(state.key);
    (async ()=>{
      let comp = await ipcRenderer.invoke('getById', state.id);
      setCompetitionInfo({id:comp.id, name:comp.name, logo:comp.logo, date:comp.date, secretaryJudge:comp.secretaryJudge, mainJudge:comp.mainJudge})
      setDataSource([...comp.competetors]);
      setIntervalId(setInterval(UpdateComp, 1000 * 60 ))
    })()
    return () => clearInterval(intervalId)
  },[state])

  useEffect(()=>{
    return clearInterval(intervalId)
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
      setTabKey(key)
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
                takesPart: i >= 2 && i < 5 ? true : discipline.takesPart
              }
              return {
                ...discipline,
                takesPart: i < set ? true : discipline.takesPart
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
          girl:false,
          disqualified:false,
          name: ``,
          club: '',
          team:Teams.Indywidualnie,
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

      const handleCategoryChange = (category:string) => {
        setSelectedCategory(category)
        if(category === "Wszyscy") setCategoryFilter(() => () => true)
        else if (category === "Junior"  && (showResults || (!showResults && !isList && ![3,4,5].includes(key)))) setCategoryFilter(() => (value:any) => {return value.category === category || (value.category === 'Kadet' && !value.girl)})
        else if (category === "Juniorka"  && (showResults || (!showResults && !isList && ![3,4,5].includes(key)))) setCategoryFilter(() => (value:any) => {return value.category === category || ( value.category === 'Kadet' && value.girl)})
        else setCategoryFilter(() => (value:any) => {return value.category === category})
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

      const onCheck = (value:boolean) => {
        let localDatasource = [...dataSource]
        let checkCompetetorIndex = localDatasource.findIndex(data => data.key === editEntity.key)
        localDatasource[checkCompetetorIndex].girl = value
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

      const printResults = async (action:'printResults' | 'exportToPdf') => {
        await UpdateComp()
        let competetors = dataSource
                            .filter(value => type!=='Drużyny' ? categoryFilter(value) : true)
                            .filter(value => value.category !== selectedCategory && type!=='Drużyny' ? checkIfTakesPart(value,getDisciplineRangeForResults(key)):true)
                            .map((value:DataType) => {
                              if(showResults) return value
                              return {
                                ...value,
                                score:value.disciplines[key - 1].score,
                                score2:value.disciplines[key - 1].score2,
                                time:value.disciplines[key - 1].time,
                              }
                            })
                            .sort((a:any,b:any) => {
          if(!a.score2 || !b.score2) return b.score - a.score
          return (b.score + b.score2) - (a.score + a.score2) 
        })

        if(key === 12 || key === 13) 
          competetors = dataSource.filter(x => filterByGender(x,selectedCategory) && checkIfTakesPart(x, getDisciplineRangeForResults(key)))

        let columns = currentColumns.map(column => column.title)

        
        let info = {
          ...competitionInfo,
          category:selectedCategory,
          dNumber:key,
          tabKey
        }

        clearInterval(intervalId)
        if(showResults) 
          if(type === 'Indywidualnie') navigate('/resultsFinals', {state:{columns, results:competetors, info, action}})
          else navigate('/resultsFinalsTeam', {state:{ results:competetors, info:{...info, type:typeOfTeams}, action}})
        else navigate('/results', {state:{columns, results:competetors, info, action}})
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
                  <FloatButton icon={<FilePdfOutlined disabled/>} /> 
                </Tooltip>
               :
               dataSource.filter(categoryFilter).length <= 0 ?
                <Tooltip title="Brak zawodników">
                  <FloatButton icon={<FilePdfOutlined disabled/>} /> 
                </Tooltip>
               : 
               <Tooltip title="Wyeksportuj do PDF">
                <FloatButton icon={<FilePdfOutlined />} onClick={() => printResults('exportToPdf')}/> 
                </Tooltip>
              : null}

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
               : 
               <Tooltip title="Wydrukuj">
                <FloatButton icon={<PrinterOutlined />} onClick={() => printResults('printResults')}/> 
               </Tooltip>
              : null}
              <Tooltip title="Zapisz">
                <FloatButton icon={<SaveOutlined />} onClick={() => UpdateComp()}/>
              </Tooltip>
            </FloatButton.Group>
          </ConfigProvider>
          <Breadcrumb
            style={{marginLeft:16}}
            items={[
              {
                title: <HomeOutlined />,
                onClick: async () => {
                  await UpdateComp()
                  navigate('/')
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
              onCheck={onCheck}
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
                finalKey={key}
                dataSource={[6,7,8,9].includes(key) ? 
                  dataSource.filter(x => filterByGender(x, selectedCategory) && x.disciplines[key - 1].takesPart).map(value => {return {
                    ...value,
                    score:value.disciplines[key - 1].score,
                    score2:value.disciplines[key - 1].score2,
                    time:value.disciplines[key - 1].time,
                  }})
                  : getFilteredCompetetors() as any} 
                />
            :
                <ResultsTable
                  finalKey={key}
                  type={type}
                  setType={setType}
                  disciplineRange={getDisciplineRangeForResults(key)}
                  getScores={getTotalScore(key)}
                  selectedCategory={selectedCategory}
                  selectedTeamType={typeOfTeams}
                  handleCategoryChange={handleCategoryChange}
                  handleTeamTypeChange={(key:string) => setTypeOfTeams(key)}
                  columns={currentColumns}
                  dataSource={dataSource.filter(
                    key === 12 || key === 13 ? 
                    value => filterByGender(value, selectedCategory) 
                    : 
                    type === 'Drużyny' ? 
                    () => true
                    :
                    categoryFilter)} />
            }
            <div style={{display:'flex', position:'absolute', width:'50%', left:0, bottom:0}}>
              <Tabs 
                className={'tabs'}
                tabBarStyle={{margin:0}}
                type="card"
                onChange={onChange}
                activeKey={tabKey} 
                items={tabs}/>
            </div>
        </div>
    )
}
interface IProps{
    children: any
}

export default Layout;