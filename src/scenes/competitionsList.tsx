import { mergeStyleSets } from "@fluentui/merge-styles";
import {
  Button,
  ConfigProvider,
  DatePicker,
  Input,
  message,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CompetitionCard from "../components/Competitions/CompetitionCard";
import UploadPicture from "../components/Competitions/UploadPic";
import { getMessageProps } from "../utils";
import locale from "antd/locale/pl_PL";
import dayjs, { Dayjs } from "dayjs";
import MenuTop from "../components/MenuTop";

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

const Start = (props: IProps) => {
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
  const [id, setId] = useState("");
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
    const fetch = async () => {
      messageApi.open(
        getMessageProps("loading", "Ładowanie projektów...", 0, "loading")
      );
      try {
        let comp = await ipcRenderer.invoke("getCompetitions");
        messageApi.destroy("loading");
        console.log(comp);
        setListOfCompetiton(comp);
        messageApi.open(
          getMessageProps("success", "Załadowano projekty", 1, "success")
        );
      } catch {
        setTimeout(async () => {
          await fetch();
        }, 2000);
        messageApi.open(
          getMessageProps(
            "error",
            "Błąd podczas ładowania projektów",
            1,
            "fail"
          )
        );
      }
    };

    fetch();
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
    setId(entity.id);
    let date = entity.date.split(" ");
    let range = date[0].split("-");
    let month = months.findIndex((month) => month === date[1]) + 1;

    setEditDate([
      dayjs(new Date(`${date[2]}.${month}.${range[0]}`)),
      dayjs(new Date(`${date[2]}.${month}.${range[1]}`)),
    ]);

    setSecretaryJudge(entity.secretaryJudge);
  };

  const openCompetition = (id: string) => {
    navigate("/scores", { state: { id } });
  };

  const generateFinals = async (id: string) => {
    let generated = await ipcRenderer.invoke("generateFinalResults", id);
    setListOfCompetiton(generated);
    messageApi.open(
      getMessageProps("success", "Wygenerowano wyniki końcowe", 2)
    );
  };

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
        id,
      });
      setEditDate(undefined);
      setModalOpen(false);
      setLogo("");
      setId("");
      setNewCompName("");
      setMainJudge("");
      setSecretaryJudge("");
      setUpdateMode(false);
      setListOfCompetiton(comp);
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
    <>
      <MenuTop activeTab="competitions" />
      <Modal
        centered
        title={updateMode ? "Edycja zawodów" : "Utwórz nowe zawody"}
        open={isModalOpen}
        onOk={onOk}
        okText={updateMode ? "Edytuj" : "Utwórz"}
        cancelText={"Anuluj"}
        okButtonProps={{ style: { background: "#d9363e" } }}
        onCancel={onCancel}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "50px",
          }}
          className={classNames.removeWidth}
        >
          <div>
            <Input
              style={{ height: "40px", marginBottom: "15px" }}
              placeholder="Wprowadź nazwę"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
            />
            <ConfigProvider locale={locale}>
              <RangePicker
                value={editDate}
                onChange={(values: [Dayjs, Dayjs]) => {
                  setDate(
                    `${values[0].date()}-${values[1].date()} ${
                      months[values[1].month()]
                    } ${values[1].year()} r.`
                  );
                }}
              />
            </ConfigProvider>
            <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
              <Input
                style={{ height: "40px" }}
                placeholder="Sędzia główny"
                value={mainJudge}
                onChange={(e) => setMainJudge(e.target.value)}
              />
              <Input
                style={{ height: "40px" }}
                placeholder="Sędzia sekretarz"
                value={secretaryJudge}
                onChange={(e) => setSecretaryJudge(e.target.value)}
              />
            </div>
          </div>
          <UploadPicture uploadPicture={(pic) => setLogo(pic)} image={logo} />
        </div>
      </Modal>
      <Modal
        centered
        title="Dodaj licencje"
        footer={[
          <Button
            key="okButton"
            type="primary"
            danger
            onClick={async () => await saveLicense()}
          >
            Ok
          </Button>,
        ]}
        closable={false}
        open={isLicenseModalOpen.open}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Input
            status={isLicenseModalOpen.errorMessage ? "error" : ""}
            style={{ height: "40px", marginBottom: "15px" }}
            placeholder="Wprowadź licencje"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          />
          <span style={{ color: "red", width: "100%" }}>
            {isLicenseModalOpen.errorMessage}
          </span>
        </div>
      </Modal>
      {contextHolder}
      {/* <div
        style={{
          minHeight: "80vh",
          marginTop: "5vh",
          width: "calc(100vw - 100px)",
          marginInline: "auto",
          display: "grid",
          gap: "50px",
          gridTemplateColumns: "repeat(auto-fit, 195px)",
        }}
      >
        {listOfCompetition.map((value) => (
          <CompetitionCard
            key={value.id}
            competition={value}
            summaryGenerated={value.summaryGenerated}
            onClick={() => openCompetition(value.id)}
            generateFinalResults={async () => await generateFinals(value.id)}
            deleteComp={async () => await deleteCompetiion(value.id)}
            editComp={() => editComp(value)}
          />
        ))}
        <CompetitionCard
          key={"addNew"}
          addNewCard
          onClick={() => setModalOpen(true)}
        />
      </div> */}
      <div
        style={{
          minHeight: "80vh",
          marginTop: "5vh",
          width: "calc(100vw - 100px)",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "50px",
        }}
      >
        {[
          ...new Set([
            ...listOfCompetition.map((value) => value.year),
            new Date().getFullYear(),
          ]),
        ].map((year: number) => (
          <div
            style={{
              width: "calc(100% - 60px)",
              backgroundColor: "#8080803d",
              padding: "10px 30px 50px 30px",
              borderRadius: "15px",
            }}
            key={year}
          >
            <h3>{year}</h3>
            <div
              style={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: "repeat(auto-fit, 195px)",
                gap: "30px",
              }}
            >
              {listOfCompetition
                .filter((comp) => comp.year == year)
                .map((value) => (
                  <CompetitionCard
                    key={value.id}
                    competition={value}
                    summaryGenerated={value.summaryGenerated}
                    onClick={() => openCompetition(value.id)}
                    generateFinalResults={async () =>
                      await generateFinals(value.id)
                    }
                    deleteComp={async () => await deleteCompetiion(value.id)}
                    editComp={() => editComp(value)}
                  />
                ))}
              {year == new Date().getFullYear() ? (
                <CompetitionCard
                  key={"addNew"}
                  addNewCard
                  onClick={() => setModalOpen(true)}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
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
    </>
  );
};
interface IProps {}
export default Start;
