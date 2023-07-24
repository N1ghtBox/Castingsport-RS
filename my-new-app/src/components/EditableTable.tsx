import React, { useContext, useEffect, useRef, useState } from "react";
import { Checkbox, CheckboxRef, InputRef, Select } from "antd";
import { Button, Form, Input, Table } from "antd";
import type { FormInstance } from "antd/es/form";
import { Categories, Teams } from "../enums";
import DataType from "../interfaces/dataType";
import { PlusOutlined } from "@ant-design/icons";
import TeamSelect from "./TeamSelect";

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
  dataSource: DataType[];
  handleSave: (record: DataType) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  dataSource,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      if (!inputRef.current) return;
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = async () => {
    setEditing(!editing);
    if (dataIndex.startsWith("D")) {
      form.setFieldsValue({ disciplines: record.disciplines });
    } else form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async (value?: any) => {
    try {
      const values = await form.validateFields();
      if (value && dataIndex === "team") {
        values.team = value;
      }

      if (dataIndex.startsWith("D")) {
        let range = dataIndex.slice(1).split("-");
        let index = Object.values(values.disciplines).slice(
          parseInt(range[0]) - 1,
          parseInt(range[1])
        );
        index.forEach((value: any) => {
          value.takesPart = !value.takesPart;
        });
      }

      toggleEdit();

      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex.startsWith("D") ? "disciplines" : dataIndex}
      >
        {dataIndex == "category" ? (
          <Select
            style={{ width: 120 }}
            onBlur={save}
            onSelect={save}
            onDeselect={save}
            open
            options={Object.keys(Categories).map((key) => {
              return {
                label: key,
                value: key,
              };
            })}
          />
        ) : dataIndex === "team" ? (
          <Select
            style={{ width: 120 }}
            onBlur={save}
            onSelect={save}
            onDeselect={save}
            open
            options={Object.keys(Teams).map((key: any) => {
              return {
                label: Teams[key as keyof typeof Teams],
                value: key,
              };
            })}
          />
        ) : dataIndex.startsWith("D") ? (
          <Checkbox
            onChange={save}
            checked={record.disciplines[parseInt(dataIndex[1]) - 1].takesPart}
          />
        ) : (
          <Input
            type={dataIndex == "startingNumber" ? "number" : "text"}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        )}
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

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

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
        dataSource: props.dataSource,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: props.handleSave,
      }),
    };
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          height: "5vh",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <Button
          onClick={props.handleAdd}
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginLeft: 16, background: "#d9363e" }}
        />

        <Select
          style={{ width: 120 }}
          value={props.selectedCategory}
          onChange={props.handleCategoryChange}
          options={[
            {
              label: "Wszyscy",
              value: "Wszyscy",
            },
            ...Object.keys(Categories).map((key) => {
              return {
                label: key,
                value: key,
              };
            }),
          ]}
        />
      </div>

      <Table
        components={components}
        rowClassName={() => "editable-row border"}
        bordered
        pagination={{ pageSize: 16 }}
        style={{
          maxHeight: "95vh",
          height: "calc(95vh - 22px)",
          whiteSpace: "pre",
        }}
        dataSource={props.dataSource}
        columns={columns as ColumnTypes}
      />
    </div>
  );
};

interface IProps {
  dataSource: DataType[];
  handleAdd: () => void;
  handleSave: (row: DataType) => void;
  columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];
  handleCategoryChange: (key: string) => void;
  selectedCategory: string;
}

export default EditableTable;
