import { mergeStyleSets } from "@fluentui/merge-styles";
import { Input, Modal, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuTop from "../components/MenuTop";
import SummaryCard from "../components/Summaries/SummaryCard";
import { getMessageProps } from "../utils";
import SummaryTransfer from "../components/Competitions/SummaryTransfer";

const { ipcRenderer } = window.require("electron");

const classNames = mergeStyleSets({
  removeWidth: {
    span: {
      width: "auto !important",
    },
  },
});

const SummariesList = (props: IProps) => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [listOfFinals, setListOfFinals] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [name, setName] = useState<string>("");

  const onCancel = () => {
    setModalOpen(false);
    setIds([]);
    setName("");
  };

  const onOk = async () => {
    setModalOpen(false);
    let comp = await ipcRenderer.invoke("addSummary", { name, compIds: ids });
    navigate(`/summaries/${comp.id}`);
  };

  useEffect(() => {
    const fetch = async () => {
      
      messageApi.open(getMessageProps("loading", "Ładowanie projektów...", 0, "loading"));
      try {
        let comp = await ipcRenderer.invoke("getCompetitions");
        messageApi.destroy("loading")
        setListOfFinals(comp);

        let summaries = await ipcRenderer.invoke("getSummaries");
        setSummaries(summaries || []);

        messageApi.open(getMessageProps("success", "Załadowano", 1,"success"));
      } catch {
        setTimeout(async ()=>{
          await fetch()
        },2000)
        messageApi.open(
          getMessageProps("error", "Błąd podczas ładowania", 1, "fail")
        );
      }
    }

    fetch()

  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "50px",
      }}
    >
      {contextHolder}
      <Modal
        centered
        title={"Utwórz nowy cykl"}
        open={isModalOpen}
        onOk={onOk}
        okText={"Utwórz"}
        cancelText={"Anuluj"}
        okButtonProps={{ style: { background: "#d9363e" } }}
        onCancel={onCancel}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "50px",
          }}
          className={classNames.removeWidth}
        >
          <Input
            value={name}
            placeholder="Nazwa cyklu"
            onChange={(e) => setName(e.target.value)}
          />
          <SummaryTransfer
            setIds={(ids: string[]) => setIds([...ids])}
            data={listOfFinals.map((value) => {
              return {
                key: value.id,
                title: value.name,
              };
            })}
          />
        </div>
      </Modal>
      <MenuTop activeTab="summaries" />
      {summaries.map((x) => (
        <SummaryCard
          key={x.id}
          summary={{ name: x.name }}
          deleteComp={async () => {
            let localSummaries = await ipcRenderer.invoke("deleteSummary", x.id)
            setSummaries([...localSummaries])
          }}
          onClick={() => navigate(`/summaries/${x.id}`)}
        />
      ))}
      <SummaryCard key={"new"} addNewCard onClick={() => setModalOpen(true)} />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          textAlign: "center",
          paddingBlock: "15px",
        }}
      >
        Copyright 2023 &copy;{" "}
        <a
          className={"linkedIn-link"}
          onClick={async () => await ipcRenderer.invoke("openLinkedIn")}
        >
          Dawid Witczak
        </a>
      </div>
    </div>
  );
};
interface IProps {}
export default SummariesList;
