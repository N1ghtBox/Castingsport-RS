import {
  DeleteOutlined,
  MoreOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { Button, Dropdown } from "antd";

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

const SummaryCard = (props: IProps) => {
  return (
    <div className={classNames.box}>
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
            <span style={{ fontSize: "1.2rem", color: "var(--secondary)" }}>
              Dodaj nowy cykl
            </span>
          </div>
        ) : props.summary ? (
          <div
            onClick={props.onClick}
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent:'center'
            }}
          >
            <h4
              style={{
                marginBlock: "10px 5px",
                textAlign: "center",
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              {props.summary.name}
            </h4>
          </div>
        ) : null}
      </div>
    </div>
  );
};
interface IProps {
  summary?: { name: string };
  addNewCard?: boolean;
  onClick: () => void;
  deleteComp?: () => void;
  editComp?: () => void;
}
export default SummaryCard;
