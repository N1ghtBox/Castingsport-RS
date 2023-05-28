import { Modal, Button } from "antd"
import DataType from "../interfaces/dataType"

const EditModal = (props:IProps) => {
  return (
    <Modal
        open={props.open}
        centered
        title={props.editEntity ? props.editEntity.name : ''}
        closable={false}
        width={320}
        onOk={props.onDelete}
        onCancel={props.onCancel}
        footer={[
          <Button key="back" onClick={props.onCancel}>
            Anuluj
          </Button>,
          <Button key="disqualification" type="primary" onClick={props.onDisqualify}>
            Zdyskwalifikuj
          </Button>,
          <Button
            key="Delete"
            type="primary"
            danger
            onClick={props.onDelete}
          >
            Usuń
          </Button>,
        ]}
      />
  )
}
interface IProps{
    open:boolean
    onDisqualify:() => void
    onDelete: () => void
    onCancel: () => void
    editEntity:DataType
}
export default EditModal 