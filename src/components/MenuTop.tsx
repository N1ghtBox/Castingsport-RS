import { BarsOutlined, SettingOutlined, TrophyOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { ipcRenderer } = window.require("electron");

const items: MenuProps["items"] = [
  {
    label: "Zawody",
    key: "competitions",
    icon: <TrophyOutlined />,
  },
  {
    label: "Cykle",
    key: "summaries",
    icon: <BarsOutlined />,
  }, 
  {
    label: "Ustawienia",
    key: "settings",
    icon:  <SettingOutlined/>,
  },
];

const MenuTop = (props : IProps) => {
  const [update,setUpdate] = useState(false)
  const navigate = useNavigate()

  const onClick: MenuProps["onClick"] = (e) => {
    navigate(`/${e.key}`)
  };

  useEffect(()=>{
    (async () => {
      setUpdate(await ipcRenderer.invoke("IsUpdateAvailable"))
    })();
  },[])

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[props.activeTab]}
      mode="horizontal"
      style={{width:'100%'}}
      items={items}
    />
  );
};

interface IProps{
  activeTab:string
}

export default MenuTop;
