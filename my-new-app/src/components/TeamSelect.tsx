import { PlusOutlined } from "@ant-design/icons";
import { InputRef, Select, Divider, Space, Input, Button } from "antd";
import { useState, useRef } from "react";

let index = 0;

const TeamSelect = (props:IProps) => {
    const [items, setItems] = useState(['jack', 'lucy']);
    const [name, setName] = useState('');
    const inputRef = useRef<InputRef>(null);
  
    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    };
  
    const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      e.preventDefault();
      setItems([...items, name || `New item ${index++}`]);
      props.save(name)
      setName('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };
  
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Drużyna"
        onSelect={(value:any) => props.save(value)}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
              <Input
                placeholder="Dodaj nową drużyne"
                ref={inputRef}
                value={name}
                onChange={onNameChange}
              />
              <Button type="text" icon={<PlusOutlined />} onClick={addItem}/>
            </Space>
          </>
        )}
        options={props.teams.map(value => {return{title:value, value:value}})}
      />
    );
}
interface IProps{
    teams: string[]
    save:(value?:any) => void
}
export default TeamSelect 