import { InboxOutlined } from "@ant-design/icons";
import { message } from "antd";
import { UploadProps } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";

const UploadCSV = (props:IProps) => {
  
  const draggerProps: UploadProps = {
    name: 'file',
    accept:"text/csv",
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    action: async (file) => {
      const reader = new FileReader();
      reader.onload = (e)=>{
        if(typeof e.target.result === 'string'){
          props.setDataFromFile(e.target.result.split('\r\n'))
        }
      }
        reader.readAsText(file)
        return ''
    },
    customRequest:() => {}
  };

    return (
      <>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Dragger>
      </>
    );
  };
  
  interface IProps{
    setDataFromFile: (data: string[]) => void
  }

  export default UploadCSV;