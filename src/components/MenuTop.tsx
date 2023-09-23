import { BarsOutlined, SettingOutlined, TrophyOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate()

  const onClick: MenuProps["onClick"] = (e) => {
    navigate(`/${e.key}`)
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[props.activeTab]}
      mode="horizontal"
      style={{position:'absolute', top:0, width:'100%'}}
      items={items}
    />
  );
};

interface IProps{
  activeTab:string
}

export default MenuTop;
