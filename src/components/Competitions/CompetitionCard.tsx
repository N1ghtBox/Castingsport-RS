import {
  CheckCircleFilled,
  DeleteOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { Avatar, Button, Dropdown, Tooltip } from "antd";
import Paragraph from "antd/es/typography/Paragraph";

const classNames = mergeStyleSets({
  content: {
    width: "200px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "100",
    cursor: "pointer",
  },
  icon: {
    fontSize: "4rem",
    color: "var(--secondary)",
    marginBottom: ".8rem",
  },
  box: {
    height: "250px",
    display: "flex",
    backgroundColor: "white",
    position: "relative",
    borderRadius: "20px",
    pointerEvents: "all",
    overflow: "hidden",
    border: "1px solid black",
  },
});

const CompetitionCard = (props: IProps) => {
  return (
    <div className={classNames.box}>
      {props.summaryGenerated ? (
        <Tooltip title="Wygenerowano wyniki końcowe">
          <CheckCircleFilled
            style={{
              position: "absolute",
              left: "15px",
              top: "15px",
              color: "green",
            }}
          />
        </Tooltip>
      ) : null}
      <div className={classNames.content}>
        {!props.addNewCard ? (
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: <span onClick={() => props.editComp()}>Edytuj</span>,
                },
                {
                  key: "2",
                  label: (
                    <span onClick={() => props.generateFinalResults()}>
                      Generuj wyniki końcowe
                    </span>
                  ),
                },
                {
                  type: "divider",
                },
                {
                  key: "3",
                  danger: true,
                  label: (
                    <span onClick={() => props.deleteComp()}>
                      <DeleteOutlined style={{ marginRight: "5px" }} />
                      Usuń
                    </span>
                  ),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              icon={<MoreOutlined />}
              style={{
                fontSize: "20px",
                position: "absolute",
                right: "10px",
                top: "10px",
                zIndex: "100",
                border: "none",
                boxShadow: "none",
              }}
            />
          </Dropdown>
        ) : null}

        {props.addNewCard ? (
          <div
            onClick={props.onClick}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "1.2rem",
            }}
          >
            <PlusCircleOutlined className={classNames.icon} />
            <span
              style={{
                fontSize: "1.2rem",
                color: "var(--secondary)",
                textAlign: "center",
              }}
            >
              Dodaj nowe zawody
            </span>
          </div>
        ) : props.competition ? (
          <div
            onClick={props.onClick}
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              style={{ marginBlock: "15px" }}
              src={props.competition.logo}
              size={100}
            />
            <h5
              style={{
                maxHeight: "70px",
                marginBlock: "10px 5px",
                textAlign: "center",
                maxWidth: "90%",
                wordBreak: "break-word",
              }}
            >
              {props.competition.name}
            </h5>
            <Paragraph style={{ marginTop: "auto" }}>
              {props.competition.date}
            </Paragraph>
          </div>
        ) : null}
      </div>
    </div>
  );
};
interface IProps {
  competition?: {
    name: string;
    logo: string;
    date: string;
    generated: boolean;
  };
  addNewCard?: boolean;
  onClick: () => void;
  deleteComp?: () => void;
  editComp?: () => void;
  generateFinalResults?: () => void;
  summaryGenerated?: boolean;
}
export default CompetitionCard;
