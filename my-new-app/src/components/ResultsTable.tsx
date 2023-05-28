import { Select, Table } from 'antd';
import type { Rule } from 'antd/es/form';
import { Categories } from '../enums';
import Competetors from '../interfaces/competetor';
import { useState } from 'react';

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const ResultsTable = (props: IProps) => {
    const [type, setType] = useState<'Indywidualnie' | 'Drużyny'>('Indywidualnie');

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
                    onChange={key => setType(key)}
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
                style={{ maxHeight: "95vh", height: "95vh" }}
                dataSource={props.dataSource}
                columns={props.columns as ColumnTypes}
            />
        </div>
    )
}

interface IProps {
    dataSource: Competetors[]
    columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string; })[]
    handleCategoryChange: (key:string) => void
    selectedCategory: string
}

export default ResultsTable;