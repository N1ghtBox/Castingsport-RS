import { Form, Input, InputRef, Select, Table } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Competetors from '../interfaces/competetor';
import DataType from '../interfaces/dataType';
import { Categories } from '../enums';
import { MaskedInput } from 'antd-mask-input';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    rules: Rule[],
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Competetors;
    record: Competetors;
    handleSave: (record: Competetors) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    rules,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            if (!inputRef.current) return
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] === 0 ? '' : record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            if(values.score === '') values.score = 0
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={dataIndex === 'time' ? [] : rules}
                >
                {
                    dataIndex !== "time" ?
                        <Input
                            type={"number" }
                            ref={inputRef}
                            onPressEnter={save}
                            onBlur={save} /> :
                        <MaskedInput
                            ref={inputRef} 
                            onPressEnter={save}
                            onBlur={save}
                            mask={'0.00.00'}
                            />
                }
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const ScoreTable = (props: IProps) => {

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = props.columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: props.handleSave,
                rules:props.rules,
            }),
        };
    });

    return (
        <div>
            <div style={{display:"flex", height:"5vh", alignItems:'center', gap:'30px'}}>
                <Select
                    style={{ width: 120, marginLeft: 16 }}
                    onChange={props.handleCategoryChange}
                    value={props.selectedCategory}
                    options={[
                      {
                        label:'Wszyscy',
                        value:'Wszyscy',
                      },
                      ...Object.keys(Categories).map(key => {
                        return {
                            label:key,
                            value: key,
                        }
                    })]
                  }
                    />
            </div>
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                showSorterTooltip={false}
                pagination={{ pageSize: 15 }}
                style={{ maxHeight: "95vh", height: "95vh" }}
                dataSource={props.dataSource}
                columns={columns as ColumnTypes}
            />
        </div>
    )
}

interface IProps {
    dataSource: Competetors[]
    handleSave: (row: Competetors) => void
    columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string; })[]
    rules:Rule[]
    handleCategoryChange: (key:string) => void
    selectedCategory: string
}

export default ScoreTable;