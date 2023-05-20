import React, { useContext, useEffect, useRef, useState } from 'react';
import { Checkbox, InputRef, Select } from 'antd';
import { Button, Form, Input, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { Categories } from '../enums';
import DataType from '../interfaces/dataType';
import { PlusOutlined } from '@ant-design/icons';

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
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof DataType;
  record: DataType;
  handleSave: (record: DataType) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
        if(!inputRef.current) return
        inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    if(dataIndex.startsWith("D")){
      form.setFieldsValue({ disciplines: record.disciplines })
    }
    else 
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });

  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      if(dataIndex.startsWith("D")){
        let index = Object.values(values.disciplines).findIndex((DataType:any) => DataType.number === parseInt(dataIndex[1]))
        values.disciplines[index].takesPart = !values.disciplines[index].takesPart
      }

      toggleEdit();
      
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
        name={dataIndex.startsWith("D") ? 
                "disciplines" : 
                dataIndex}
      >
        {
            dataIndex == "category" ?
              <Select
                  style={{ width: 120 }}
                  onBlur={save}
                  onSelect={save}
                  onDeselect={save}
                  options={Object.keys(Categories).map(key => {
                      return {
                          label:key,
                          value: key,
                      }
                  })}
                  /> :
            dataIndex.startsWith("D")?
              <Checkbox 
                onChange={save}
                checked={record.disciplines[parseInt(dataIndex[1]) - 1].takesPart}/>
                :
              <Input 
                type={dataIndex == "startingNumber" ? "number" : "text"}
                ref={inputRef} 
                onPressEnter={save} 
                onBlur={save} />
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

const EditableTable = (props: IProps) => {

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
            handleSave:props.handleSave,
          }),
        };
      });

      return (
        <div>
          <div style={{display:"flex", height:"5vh", alignItems:'center', gap:'30px'}}>
            <Button 
              icon={<PlusOutlined />}
              onClick={props.handleAdd} 
              type="primary" 
              style={{marginLeft:16, background:'#d9363e'}}/>

            <Select
                style={{ width: 120 }}
                value={props.selectedCategory}
                onChange={props.handleCategoryChange}
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
              pagination={{pageSize:15}}
              style={{maxHeight:"95vh", height:"95vh"}}
              dataSource={props.dataSource}
              columns={columns as ColumnTypes}
            />
        </div>
      )
}

interface IProps{
  dataSource: DataType[]
  handleAdd: () => void
  handleSave: (row:DataType) => void
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string;})[]
  handleCategoryChange: (key:string) => void
  selectedCategory: string
}

export default EditableTable;