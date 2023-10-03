import { Transfer } from "antd";
import { useState } from "react";

interface RecordType {
  key: string;
  title: string;
}

const SummaryTransfer = (props: IProps) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const handleChange = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
    props.setIds([...newTargetKeys])
  };

  const handleSelectChange = (
    sourceSelectedKeys: string[],
    targetSelectedKeys: string[]
  ) => {
    setSelectedKeys([...targetSelectedKeys, ...sourceSelectedKeys]);
  };

  return (
    <>
      <Transfer
        dataSource={props.data}
        titles={["Zawody", "Cykl"]}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onChange={handleChange}
        onSelectChange={handleSelectChange}
        render={(item) => item.title}
        oneWay
        style={{ marginBottom: 16 }}
      />
    </>
  );
};
interface IProps {
  data: RecordType[];
  setIds: (ids:any[]) => void
}
export default SummaryTransfer;
