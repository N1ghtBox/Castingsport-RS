import { Table } from "antd";
import { Rule } from "antd/es/form";

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

type Columns = {columns : (ColumnTypes[number] & { editable?: boolean; dataIndex: string;align:string})[], rules: Rule[]}

interface IColumns{
    list: Columns;
    D1: Columns;
    D2: Columns;
    D3: Columns;
    D4: Columns;
    D5: Columns;
    D6: Columns;
    D7: Columns;
    D8: Columns;
    D9: Columns;
}
export default IColumns;