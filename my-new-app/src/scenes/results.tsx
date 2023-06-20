import moment from "moment";
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom";
import IResult from "../interfaces/IResult";
const { ipcRenderer } = window.require("electron");

let disciplines = {
    1:"Mucha cel",
    2:"Mucha odległość",
    3:"Spinning sprawnościowy 7,5g Arenberg",
    4:"Spinning cel 7,5g",
    8:"Multi-cel 18g jednorącz"
}


const Results = (props:IProps) => {
    const {state} = useLocation()
    const [columns, setColumns] = useState([])
    const [results, setResults] = useState<IResult[]>([])
    const [info, setInfo] = useState<any>()

    useEffect(()=>{
        setColumns(state.columns)
        setResults(state.results)
        setInfo(state.info)
        // (async ()=>{
        //     await ipcRenderer.invoke('printResults')
        // })()
    },[state])

    const sortByTime = (a:IResult, b:IResult) => {
        if(!a.time) return 0
        let Atime = moment(b.time, 'm.ss.SS')
        let Btime = moment(b.time, 'm.ss.SS')
        if (Atime.isBefore(Btime)) return 1
        if (Atime.isAfter(Btime)) return -1
        return 0
         
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
                <h6 style={{marginTop:0, textAlign:'center'}}>Błonie, 12-14 sierpień 2016 r.</h6>
            </span>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{backgroundColor:'aqua', height:'fit-content',padding:'10px 50px', marginLeft:'15%', fontSize:'larger', fontWeight:'800'}}>
                {info ? info.category : ''}
            </div>
            <span style={{marginRight:'5%'}}>
                <h3 style={{paddingBottom:'15px', borderBottom:'4px solid black', paddingInline:'40px', marginBottom:'5px'}}>Konkurencja {info ? info.dNumber : ''}</h3>
                <h6 style={{marginTop:0, textAlign:'center'}}>Mucha cel</h6>
            </span>
        </div>
        <div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{borderBottom:'2px solid black !important'}}>
                    <tr>
                        {columns.map(name => (
                            <th key={name}>
                                {name}
                            </th>
                        ) )}
                    </tr>
                </thead>
                <tbody style={{textAlign:'center'}}>
                    {
                        results.sort(sortByTime).map(result => (
                            <tr key={result.key}>
                                <td style={{fontWeight:'900', paddingBlock:'10px'}}>
                                    {result.startingNumber}
                                </td>
                                <td>
                                    {result.name}
                                </td>
                                <td>
                                    {result.club}
                                </td>
                                <td>
                                    {result.category}
                                </td>
                                <td>
                                    {result.score}
                                </td>
                                <td>
                                    {result.time ? result.time : result.score2}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    </div>
  )
}
interface IProps{
}
export default Results 