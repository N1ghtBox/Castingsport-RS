import { Breadcrumb, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { summary } from "../";
import { HomeOutlined } from "@ant-design/icons";

const { ipcRenderer } = window.require("electron");

const { Column, ColumnGroup } = Table;

interface DataType {
  key: React.Key;
  firstName: string;
  place: number;
  score: number;
  address: string;
}

const data: DataType[] = [
  {
    key: "1",
    firstName: "John",
    score: 32,
    place: 1,
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    firstName: "Jim",
    score: 42,
    place: 1,
    address: "London No. 1 Lake Park",
  },
  {
    key: "3",
    firstName: "Joe",
    score: 32,
    place: 1,
    address: "Sydney No. 1 Lake Park",
  },
];

const Summary = () => {
  const summaryData = useLoaderData() as summary;
  const navigate = useNavigate();
  const [finals, setFinals] = useState<any[]>([]);
  const [competitionNames, setNames] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const localFinals: { name: string; finals: any[] }[] =
        await ipcRenderer.invoke("getFinalsById", summaryData.compIds);

      setNames(localFinals.map((x) => x.name));

      setFinals(localFinals.map((x) => x.finals));
    })();
  }, []);

  useEffect(() => {
    console.log(finals);
  }, [finals]);

  return (
    <>
      <Breadcrumb
        style={{ marginLeft: 16 }}
        items={[
          {
            title: <HomeOutlined />,
            onClick: async () => {
              navigate("/");
            },
          },
          {
            title: summaryData.name,
          },
        ]}
      />
      <Table dataSource={data}>
        <Column
          title="Imię i nazwisko"
          dataIndex="firstName"
          key="firstName"
          align="center"
        />
        <Column
          title="Okręg"
          dataIndex="address"
          key="address"
          align="center"
        />
        {competitionNames.map((name) => (
          <ColumnGroup
            title={<span style={{ fontSize: "12px" }}>{name}</span>}
            align="center"
            key={name}
          >
            <Column title="test1" key={"test1"} align="center" />
            <Column title="test" key={"test2"} align="center" />
          </ColumnGroup>
        ))}
        <Column
          title="Łączny wynik"
          dataIndex="score"
          key="score"
          align="center"
        />
        <Column
          title="Miejsce"
          dataIndex="address"
          key="address"
          align="center"
        />
      </Table>
    </>
  );
};

export default Summary;
