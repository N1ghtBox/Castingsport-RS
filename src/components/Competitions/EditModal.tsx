import { Modal, Button, Checkbox } from "antd";
import { Categories } from "../../enums";
import DataType from "../../interfaces/dataType";

const EditModal = (props: IProps) => {
  return (
    <Modal
      open={props.open}
      centered
      title={props.editEntity ? props.editEntity.name : ""}
      closable={false}
      width={320}
      onOk={props.onDelete}
      onCancel={props.onCancel}
      footer={[
        <Button key="back" onClick={props.onCancel}>
          Anuluj
        </Button>,
        <Button
          key="disqualification"
          type="primary"
          onClick={props.onDisqualify}
        >
          Zdyskwalifikuj
        </Button>,
        <Button key="Delete" type="primary" danger onClick={props.onDelete}>
          Usuń
        </Button>,
      ]}
    >
      {props.editEntity && props.editEntity.category === Categories.Kadet ? (
        <Checkbox
          onChange={(e) => props.onCheck(e.target.checked)}
          checked={props.editEntity && props.editEntity.girl}
        >
          Kadetka
        </Checkbox>
      ) : null}
    </Modal>
  );
};
interface IProps {
  open: boolean;
  onDisqualify: () => void;
  onCheck: (value: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
  editEntity: DataType;
}
export default EditModal;
