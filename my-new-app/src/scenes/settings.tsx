import { mergeStyleSets } from "@fluentui/merge-styles";
import {
  DatePicker,
  message
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MenuTop from "../components/MenuTop";
import { getMessageProps } from "../utils";

const { ipcRenderer } = window.require("electron");

const { RangePicker } = DatePicker;

const classNames = mergeStyleSets({
  removeWidth: {
    span: {
      width: "auto !important",
    },
  },
});

const months = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const Settings = (props: IProps) => {
  const navigate = useNavigate();
  const [params, _] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [listOfCompetition, setListOfCompetiton] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLicenseModalOpen, setLicenseModalOpen] = useState<{
    open: boolean;
    errorMessage: string;
  }>({ open: false, errorMessage: "" });
  const [newCompName, setNewCompName] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [license, setLicense] = useState("");
  const [mainJudge, setMainJudge] = useState("");
  const [secretaryJudge, setSecretaryJudge] = useState("");
  const [editDate, setEditDate] = useState<[Dayjs, Dayjs]>();
  const [logo, setLogo] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    (async () => {
      let valid: { valid: boolean; errorMessage: string } =
        await ipcRenderer.invoke("checkLicense");
      if (params.get("open") && valid.valid) return;
      if (!valid.valid) {
        setLicenseModalOpen({ open: true, errorMessage: valid.errorMessage });
      }
    })();
  }, [params]);

  useEffect(() => {
    (async () => {
      messageApi.open(getMessageProps("loading", "Ładowanie projektów...", 3));
      try {
        let comp = await ipcRenderer.invoke("getCompetitions");
        setListOfCompetiton(comp);
        messageApi.destroy();
        messageApi.open(getMessageProps("success", "Załadowano projekty", 0.5));
      } catch {
        messageApi.destroy();
        messageApi.open(
          getMessageProps("error", "Błąd podczas ładowania projektów", 1)
        );
      }
    })();
  }, []);

  const deleteCompetiion = async (id: string) => {
    let json = await ipcRenderer.invoke("deleteComp", id);
    setListOfCompetiton(json.competitions);
  };

  const editComp = async (entity: any) => {
    setModalOpen(true);
    setUpdateMode(true);
    setLogo(entity.logo);
    setNewCompName(entity.name);
    setMainJudge(entity.mainJudge);
    setDate(entity.date);
    let date = entity.date.split(" ");
    let range = date[0].split("-");
    let month = months.findIndex((month) => month === date[1]) + 1;

    setEditDate([dayjs(new Date(`${date[2]}.${month}.${range[0]}`)), dayjs(new Date(`${date[2]}.${month}.${range[1]}`))]);

    setSecretaryJudge(entity.secretaryJudge);
  };

  const openCompetition = (id: string) => {
    navigate("/scores", { state: { id } });
  };

  const generateFinals = async (id:string) => {
    let generated = await ipcRenderer.invoke('generateFinalResults',id)
    setListOfCompetiton(generated)
  }

  const onCancel = () => {
    setModalOpen(false);
    setEditDate(undefined);
    setLogo("");
    setMainJudge("");
    setSecretaryJudge("");
    setNewCompName("");
  };

  const onOk = async () => {
    if (!newCompName.trim()) {
      messageApi.open(getMessageProps("error", "Nie podano nazwy", 2));
      return;
    }

    if (!logo) {
      messageApi.open(getMessageProps("error", "Nie podano logo", 2));
      return;
    }
    if (!date) {
      messageApi.open(getMessageProps("error", "Nie podano daty", 2));
      return;
    }
    if (!mainJudge) {
      messageApi.open(
        getMessageProps("error", "Nie podano głównego sędziego", 2)
      );
      return;
    }
    if (!secretaryJudge) {
      messageApi.open(
        getMessageProps("error", "Nie podano sędziego sekretarza", 2)
      );
      return;
    }
    if (updateMode) {
      let comp = await ipcRenderer.invoke("editComp", {
        logo,
        name: newCompName,
        date,
        mainJudge,
        secretaryJudge,
      });
      setEditDate(undefined);
      setModalOpen(false);
      setLogo("");
      setNewCompName("");
      setMainJudge("");
      setSecretaryJudge("");
      setUpdateMode(false);
      setListOfCompetiton(comp)
      return;
    }
    try {
      messageApi.open(getMessageProps("loading", "Tworzenie zawodów...", 2));
      let comp = await ipcRenderer.invoke("createNewComp", {
        logo,
        name: newCompName,
        date,
        mainJudge,
        secretaryJudge,
      });
      navigate("/scores", { state: { id: comp } });
    } catch (ex) {
      if (ex.toString().includes("413")) {
        messageApi.open(getMessageProps("error", "Zbyt duży plik", 4));
        return;
      }
      messageApi.open(
        getMessageProps("error", "Nie udało się utworzyć zawodów", 2)
      );
    }
  };

  const saveLicense = async () => {
    let result = await ipcRenderer.invoke("saveLicense", license);
    if (result.valid) setLicenseModalOpen({ open: false, errorMessage: "" });
    else setLicenseModalOpen({ open: true, errorMessage: result.errorMessage });
  };

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
      <MenuTop activeTab='settings'/>
      <div style={{position:'absolute', bottom:0, width:'100%', textAlign:'center', paddingBlock:'15px'}}>
        Copyright &copy;	<a className={'linkedIn-link'} onClick={async () => await ipcRenderer.invoke('openLinkedIn')}>Dawid Witczak</a>
      </div>
    </div>
  );
};
interface IProps {}
export default Settings;
