import { mergeStyleSets } from "@fluentui/merge-styles";
import { ConfigProvider, DatePicker, Input, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompetitionCard from "../components/CompetitionCard";
import UploadPicture from "../components/UploadPic";
import { getMessageProps } from "../utils";
import locale from 'antd/locale/pl_PL'
import { Dayjs } from "dayjs";

const {ipcRenderer} = window.require('electron')

const { RangePicker } = DatePicker;

const classNames = mergeStyleSets({
    removeWidth:{
        'span':{
            width:'auto !important',
        }
    }
})

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
    "Grudzień"
]

const Start = (props: IProps) => {
    const navigate = useNavigate()
    const [messageApi, contextHolder] = message.useMessage();
    const [listOfCompetition, setListOfCompetiton] = useState([])
    const [isModalOpen, setModalOpen] = useState(false)
    const [newCompName, setNewCompName] = useState('')
    const [logo, setLogo] = useState<string>('')
    const [date, setDate] = useState<string>('')

    useEffect(()=>{
        (async () => {
            messageApi.open(getMessageProps('loading','Ładowanie projektów...', 3))
            try{
                let comp = await ipcRenderer.invoke('getCompetitions')
                setListOfCompetiton(comp)
                messageApi.destroy()
                messageApi.open(getMessageProps('success','Załadowano projekty', 0.5))
            }catch{
                messageApi.destroy()
                messageApi.open(getMessageProps('error','Błąd podczas ładowania projektów', 1))
            }
        })()
    },[])

    const openCompetition = (id:string) => {
        navigate('/scores', {state:id})
    }

    const onCancel = () => {
        setModalOpen(false)
        setNewCompName('')
    }

    const onOk = async () => {
        if(!newCompName.trim()){
            messageApi.open(getMessageProps('error','Nie podano nazwy', 2))
            return
        }

        if(!logo){
            messageApi.open(getMessageProps('error','Nie podano logo', 2))
            return
        }
        if(!date){
            messageApi.open(getMessageProps('error','Nie podano daty', 2))
            return
        }
        try{
            messageApi.open(getMessageProps('loading','Tworzenie zawodów...', 2))
            let comp = await ipcRenderer.invoke('createNewComp', {logo, newCompName, date})
            navigate('/scores', {state:comp.id})
        }catch (ex){
            console.log(ex)
            if(ex.toString().includes('413')){
                messageApi.open(getMessageProps('error','Zbyt duży plik', 4))
                return
            }
            messageApi.open(getMessageProps('error','Nie udało się utworzyć zawodów', 2))
        }
        }

    return(
        <div style={{height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', gap:'50px'}}>
            <Modal 
                centered
                title="Utwórz nowe zawody" 
                open={isModalOpen} 
                onOk={onOk} 
                okText={'Utwórz'}
                cancelText={'Anuluj'}
                okButtonProps={{style:{background:'#d9363e'}}}
                onCancel={onCancel}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'50px'}} className={classNames.removeWidth}>
                        <div>
                            <Input 
                                style={{height:'40px', marginBottom:'15px'}}
                                placeholder="Wprowadź nazwę" 
                                value={newCompName}
                                onChange={e => setNewCompName(e.target.value)}/>
                            <ConfigProvider locale={locale}>
                                <RangePicker onChange={(values:[Dayjs, Dayjs]) => {
                                    setDate(`${values[0].date()}-${values[1].date()} ${months[values[1].month()]} ${values[1].year()}`)
                                }}/>
                            </ConfigProvider>
                        </div>
                        <UploadPicture
                            uploadPicture={pic => setLogo(pic)}
                            />
                    </div>

            </Modal>
            {contextHolder}
            {listOfCompetition.map( value => (
                <CompetitionCard
                    key={value.id}
                    competition={value}
                    onClick={()=> openCompetition(value.id)}
                    />
            ))}
                <CompetitionCard
                    addNewCard
                    onClick={()=>setModalOpen(true)}
                    />
        </div>
    )
}
interface IProps{

}
export default Start;
