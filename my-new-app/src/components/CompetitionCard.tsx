import { PlusCircleOutlined } from "@ant-design/icons";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { Avatar } from "antd";
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
      <div className={classNames.content} onClick={props.onClick}>
        {props.addNewCard ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "1.2rem",
            }}
          >
            <PlusCircleOutlined className={classNames.icon} />
            <span style={{ fontSize: "1.2rem", color: "var(--secondary)" }}>
              Dodaj nowy projekt
            </span>
          </div>
        ) : props.competition ? (
          <div
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
            <h4
              style={{
                marginBlock: "10px 5px",
                textAlign: "center",
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              {props.competition.name}
            </h4>
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
  competition?: { name: string; logo: string; date: string };
  addNewCard?: boolean;
  onClick: () => void;
}
export default CompetitionCard;
