import { Select, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Categories } from '../enums';
import DataType from '../interfaces/dataType';

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const teamResultsColumns:ColumnTypes = [
    {
        title:'Drużyna',
        dataIndex:'teamName',
        align:'center'
    },
    {
        title:'Team',
        dataIndex:'team',
        align:'center'
    },
    {
        title:'Wyniki',
        dataIndex:'scores',
        align:'center'
    },
    {
        title:'Total',
        dataIndex:'total',
        align:'center',
        sorter:(a:any,b:any) => {
            return a.total - b.total
        },
        defaultSortOrder:'descend',
        sortOrder:'descend',
    },
    
]

type team = {team:string, scores:string, total:number, teamName:string}

const ResultsTable = (props: IProps) => {
    const [type, setType] = useState<'Indywidualnie' | 'Drużyny'>('Indywidualnie');
    const [results, setResults] = useState<any[]>(props.dataSource)

    const changeType = (key:'Indywidualnie' | 'Drużyny') => {
        setType(key)
        if(key === 'Indywidualnie') setResults(props.dataSource)
        else{
            let competetorsGroupByTeam:team[] = []
            props.dataSource.forEach(value => {
                if(!value.team) return
                let teamIndex = competetorsGroupByTeam.findIndex(team => team.teamName === value.team)
                if(teamIndex >= 0){
                    let localTeam = competetorsGroupByTeam[teamIndex]
                    localTeam.scores += `${props.getScores(value)}\n`
                    localTeam.team += `${value.startingNumber} ${value.name}\n`
                    localTeam.total += props.getScores(value)
                }else{
                    competetorsGroupByTeam.push({
                        scores: `${props.getScores(value)}\n`,
                        team:`${value.startingNumber} ${value.name}\n`,
                        total: props.getScores(value),
                        teamName:`${value.team}`
                    })
                }
            })
            setResults(competetorsGroupByTeam)
        }
    }

    useEffect(()=>{
        changeType(type)
    },[props.getScores])

    return (
        <div>
            <div style={{display:"flex", height:"5vh", alignItems:'center', gap:'30px'}}>
                <Select
                    style={{ width: 120, marginLeft: 16 }}
                    onChange={props.handleCategoryChange}
                    value={props.selectedCategory}
                    options={[
                      ...Object.keys(Categories).map(key => {
                        return {
                            label:key,
                            value: key,
                        }
                    })]
                  }
                    />
                <Select
                    style={{ width: 120, marginLeft: 16 }}
                    onChange={changeType}
                    value={type}
                    options={[
                        {
                            label:'Indywidualnie',
                            value:'Indywidualnie'
                        },
                        {
                            label:'Drużyny',
                            value:'Drużyny'
                        }
                    ]}
                    />
            </div>
            <Table
                rowClassName={() => 'border'}
                bordered
                showSorterTooltip={false}
                pagination={{ pageSize: 20 }}
                style={{ maxHeight: "95vh", height: "95vh", whiteSpace:'pre' }}
                dataSource={results}
                columns={type ==='Drużyny' ? teamResultsColumns : props.columns as ColumnTypes}
            />
        </div>
    )
}

interface IProps {
    dataSource: DataType[]
    columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string; })[]
    handleCategoryChange: (key:string) => void
    selectedCategory: string
    getScores:(value:DataType) => number
}

export default ResultsTable;