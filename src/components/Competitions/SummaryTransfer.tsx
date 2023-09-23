import React, { useState } from "react";
import { Switch, Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";

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
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
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
