import moment from "moment";
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import IResult from "../interfaces/IResult";
const { ipcRenderer } = window.require("electron");
import 'moment/locale/pl'

let disciplines = [
    "Mucha cel",
    "Mucha odległość",
    "Spinning sprawnościowy 7,5g Arenberg",
    "Spinning cel 7,5g",
    "Odległość spinningowa jednoręczna 7,5g.",
    "Odległość muchowa oburęczna.",
    "Odległość spinningowa oburęczna 18g",
    "Multi-cel 18g jednorącz",
    "Multi-odległość 18g oburęczna",
    "3-bój",
    "5-bój",
    '2-bój odległościowy',
    '2-bój multi',
]


const Results = (props:IProps) => {
    moment.locale('pl')
    const {state} = useLocation()
    const [columns, setColumns] = useState([])
    const [results, setResults] = useState<IResult[]>([])
    const [info, setInfo] = useState<any>()
    const navigate = useNavigate()

    useEffect(()=>{
        setColumns(state.columns)
        setResults(state.results)
        setInfo(state.info);
        (async ()=>{
            await ipcRenderer.invoke(state.action, `Konkurencja-${state.info.dNumber}_${state.info.category}.pdf`)
        })()
    },[state])

    useEffect(()=>{
        document.addEventListener('keydown', ev => {
            if(ev.code === 'Escape') navigate('/scores',{state:{id:state.info.id, key:state.info.tabKey}})
        })
        ipcRenderer.addListener('success', ()=>{
            navigate('/scores',{state:{id:state.info.id, key:state.info.tabKey}})
        })
        return () => {
            document.removeEventListener('keydown',() => {})
            ipcRenderer.removeAllListeners('success')

        }
    },[])

    const sortByTime = (a:IResult, b:IResult) => {
        let time = moment(b.time, 'm.ss.SS')
	let difference = moment(a.time, 'm.ss.SS').diff(time)
        return difference
         
    }

    const renderResultOfDiscipline = (result:IResult, index: number) => {
        return (
            <tr key={result.key}>
                <td style={{fontWeight:'900', paddingBlock:'10px'}}>
                    {index+1}
                </td>
                <td>
                    {result.startingNumber}
                </td>
                <td>
                    {result.name}
                </td>
                <td>
                    {result.club}
                </td>
                <td>
                    {result.score}
                </td>
                <td>
                    {result.time ? result.time : result.score2}
                </td>
            </tr>
        )
    }

    const getName = () => {
        if(!info) return ''
        if(info.dNumber < 10) return `Konkurencja ${info.dNumber}`
        if(info.dNumber === 10) return `Konkurencje 3-5`
        if(info.dNumber === 11) return `Konkurencje 1-5`
        if(info.dNumber === 12) return `Konkurencje 6-7`
        if(info.dNumber === 13) return `Konkurencje 8-9`
        return ''

    }


    return (
    <div id="page" style={{display:'flex', flexDirection:'column'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <span style={{height:'100px'}}>
                <img style={{maxHeight:'100%'}} src={info ? info.logo : ''} alt="">
                </img>
            </span>
            <span style={{marginRight:'5%'}}>
                <h3 style={{paddingBottom:'15px', borderBottom:'4px solid black', marginBottom:'5px', textAlign:'center'}}>{info ? info.name : ''}</h3>
                <h6 style={{marginTop:0, textAlign:'center'}}>{info ? info.date : ''}</h6>
            </span>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{backgroundColor:'aqua', height:'fit-content',padding:'10px 50px', marginLeft:'15%', fontSize:'larger', fontWeight:'800'}}>
                {info ? info.category : ''}
            </div>
            <span style={{marginRight:'5%'}}>
                <h3 style={{paddingBottom:'15px', borderBottom:'4px solid black', paddingInline:'40px', marginBottom:'5px'}}>{getName()}</h3>
                <h6 style={{marginTop:0, textAlign:'center'}}>{info ? disciplines[info.dNumber - 1] : ''}</h6>
            </span>
        </div>
        <div>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'11px',borderBottom:'2px solid black'}}>
                <thead style={{borderBottom:'2px solid black !important'}}>
                    <tr>
			<th>
				Zajęte miejsce
			</th>
                        {columns.map(name => (
                            <th key={name}>
                                {name}
                            </th>
                        ) )}
                    </tr>
                </thead>
                <tbody style={{textAlign:'center'}}>
                    {
                        results.sort(sortByTime).sort((a:any,b:any) => b.score - a.score).map((result:IResult, index:number) => renderResultOfDiscipline(result,index))
                    }
                </tbody>
            </table>
            <div style={{display:'flex', justifyContent:'space-between',marginTop:'15px', marginInline:'15px'}}>
                <span style={{fontSize:'14px'}}>
                    Sędzia główny<br/><br/>
                    {state.info.mainJudge}
                </span>
                <span style={{fontSize:'14px'}}>
                    {moment().format('Do MMMM YYYY, hh:mm')}
                </span>
                <span style={{fontSize:'14px'}}>
                    Sędzia sekretarz<br/><br/>
                    {state.info.secretaryJudge}
                </span>
            </div>
        </div>
    </div>
  )
}
interface IProps{
}
export default Results 