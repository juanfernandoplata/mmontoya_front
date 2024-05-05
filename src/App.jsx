import React, { useEffect, createContext, useContext } from 'react';
import { useState, useRef } from 'react';

import axios from "axios";

import 'chart.js/auto'
import { Bar, Pie, Line, getElementAtEvent } from 'react-chartjs-2';

import { BAR_STACKED_CLICKABLE, LINE } from './chartOpts';

import WhatsAppLogo from "./assets/WhatsApp.svg.webp"
import EmailIcon from "./assets/Email.svg"
import FilterIcon from "./assets/FilterIcon.svg"


const MONTH_NAMES = [ "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" ]
const DAY_NAMES = [ "Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom" ]

const Ctx = createContext( null )

const apiHostname = "https://mmontoya-back.onrender.com"

function MTsButton( { text, onClick, marginLeft = false } ){
    return <button
        style = {{
            height: "25px",
            marginLeft: marginLeft ? "7px" : "0",
            padding: "0 8px",
            fontSize: "medium",
            fontWeight: "bold"
        }}

        onClick = { onClick }
    >
        { text }
    </button>
}


function FilterButton( { text, bgColor, onClick } ){
    return <button
        onClick = { onClick }

        style = {{
            width: "60px",
            height: "20px",

            margin: "0",
            marginTop: "6px",
            padding: "0",
            
            fontSize: "x-small",
            fontWeight: "bold",

            backgroundColor: bgColor
        }}
    >
        { text }
    </button>
}


function MTsChart(){
    const {
        mTs, setMTs,
        pTs, setPTs,
        // mTsData, setMTsData,
        pTsData, setPTsData,
        interList, setInterList,
        selInter, setSelInter,
        clientRoadmap, setClientRoadmap
    } = useContext( Ctx )

    const chartRef = useRef( null )
    const [ data, setData ] = useState( { labels: [], datasets: [] } )
    const pTsDataIndex = useRef( null )
    const [ opts, setOpts ] = useState( BAR_STACKED_CLICKABLE( setMTs, setPTs, setData, setPTsData, pTsDataIndex ) )

    const [ agents, setAgents ] = useState( [ "-" ] )

    const [ showFilters, setShowFilters ] = useState( false )
    const [ filters, setFilters ] = useState({
        selAgent: 0,
        contact: true,
        deposit: true,
        arrival: true
    })

    useEffect(
        () => {
            axios.get( `${apiHostname}/agents` )
            .then( ( res ) => {
                setAgents( [ "-" ].concat( res.data ) )
            })
        },
        []
    )

    useEffect(
        () => {
            axios.get( `${apiHostname}/interactions/count?year=2024` )
            .then( ( res ) => {
                const labels = res.data.datasets.map( ( e ) => e.label )
                const data = res.data.datasets.map(
                    ( e ) => e.data.reduce( ( acum, e ) => acum + e )
                )

                setData( res.data )
                setPTsData({
                    labels: labels,
                    datasets: [ { data: data } ]
                })

                axios.get( `${apiHostname}/interactions?year=2024` )
                .then( ( res ) => {
                    setInterList( res.data )
                })
            })
        },
        []
    )

    const buildFiltersQParams = () => {
        let qParams = ""
        
        if( !filters.contact ){
            qParams = qParams.concat( "&exc_cont=true" )
        }
        if( !filters.deposit ){
            qParams = qParams.concat( "&exc_dep=true" )
        }
        if( !filters.arrival ){
            qParams = qParams.concat( "&exc_arr=true" )
        }

        return qParams
    }

    const handleYearClick = () => {
        let qParams = `?year=${mTs.year}`
        qParams = qParams.concat( buildFiltersQParams() )
        axios.get( `${apiHostname}/interactions/count${qParams}` )
        .then( ( res ) => {
            setData( res.data )
            setMTs( ( curr ) => ( { ...curr, month: null, week: null, day: null } ) )
            setPTs( ( curr ) => ( { ...curr, month: null, week: null, day: null } ) )

            const labels = res.data.datasets.map( ( e ) => e.label )
            const data = res.data.datasets.map(
                ( e ) => e.data.reduce( ( acum, e ) => acum + e )
            )

            pTsDataIndex.current = -1
            setPTsData({
                labels: labels,
                datasets: [ { data: data } ]
            })

            axios.get( `${apiHostname}/interactions${qParams}` )
            .then( ( res ) => {
                setInterList( res.data )
                setSelInter( -1 )

                setClientRoadmap( { labels: [], datasets: [] } )
                setCreateInter( false )
            })
        })
    }

    const handleMonthClick = () => {
        let qParams = `?year=${mTs.year}&month=${mTs.month}`
        qParams = qParams.concat( buildFiltersQParams() )
        axios.get( `${apiHostname}/interactions/count${qParams}` )
        .then( ( res ) => {
            setData( res.data )
            setMTs( ( curr ) => ( { ...curr, week: null, day: null } ) )
            setPTs( ( curr ) => ( { ...curr, week: null, day: null } ) )

            const labels = res.data.datasets.map( ( e ) => e.label )
            const data = res.data.datasets.map(
                ( e ) => e.data.reduce( ( acum, e ) => acum + e )
            )

            pTsDataIndex.current = -1
            setPTsData({
                labels: labels,
                datasets: [ { data: data } ]
            })

            axios.get( `${apiHostname}/interactions${qParams}` )
            .then( ( res ) => {
                setInterList( res.data )
                setSelInter( -1 )

                setClientRoadmap( { labels: [], datasets: [] } )
                setCreateInter( false )
            })
        })
    }

    const handleWeekClick = () => {
        let qParams = `?year=${mTs.year}&month=${mTs.month}&week=${mTs.week}`
        qParams = qParams.concat( buildFiltersQParams() )
        axios.get( `${apiHostname}/interactions/count${qParams}` )
        .then( ( res ) => {
            setData( res.data )
            setMTs( ( curr ) => ( { ...curr, day: null } ) )
            setPTs( ( curr ) => ( { ...curr, day: null } ) )

            const labels = res.data.datasets.map( ( e ) => e.label )
            const data = res.data.datasets.map(
                ( e ) => e.data.reduce( ( acum, e ) => acum + e )
            )

            pTsDataIndex.current = -1
            setPTsData({
                labels: labels,
                datasets: [ { data: data } ]
            })

            axios.get( `${apiHostname}/interactions${qParams}` )
            .then( ( res ) => {
                setInterList( res.data )
                setSelInter( -1 )

                setClientRoadmap( { labels: [], datasets: [] } )
                setCreateInter( false )
            })
        })
    }

    const handleChartClick = ( e ) => {
        if( !opts.onHover ){ return }
        const element = getElementAtEvent( chartRef.current, e )
        if( !element.length ){ return }
        const { index } = element[ 0 ]

        let qParams = "?"
        if( mTs.week !== null ){
            setPTs( { ...mTs, day: index } )
            qParams += `year=${mTs.year}&month=${mTs.month}&week=${mTs.week}&day=${index}`
        }
        else if( mTs.month && mTs.week === null ){
            setMTs( ( curr ) => ( { ...curr, week: index } ) )
            setPTs( ( curr ) => ( { ...curr, week: index } ) )
            // setOpts( BAR_STACKED_NOT_CLICKABLE( setMTs, setPTs, setData, setPTsData, pTsDataIndex ) )
            qParams += `year=${mTs.year}&month=${mTs.month}&week=${index}`
        }
        else if( mTs.year && mTs.month === null ){
            setMTs( ( curr ) => ( { ...curr, month: index + 1 } ) )
            setPTs( ( curr ) => ( { ...curr, month: index + 1 } ) )
            qParams += `year=${mTs.year}&month=${index + 1}`
        }
        else{
            console.log( "ERROR: this condition should NEVER be true..." )
            // console.log( ts )
        }

        qParams = qParams.concat( buildFiltersQParams() )

        pTsDataIndex.current = -1
        axios.get( `${apiHostname}/interactions/count${qParams}` )
        .then( ( res ) => {
            setData( res.data )

            axios.get( `${apiHostname}/interactions${qParams}` )
            .then( ( res ) => {
                setInterList( res.data )
                setSelInter( -1 )
                setClientRoadmap( { labels: [], datasets: [] } )
                setCreateInter( false )
            })
        })
    }

    return <div
        style = {{
            width: "100%",
            height: "100%",

            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }}
    >
        <div
            style = {{
                position: "relative",
            }}
        >
            <div
                style = {{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",

                    marginRight: "auto"
                }}
            >
                <MTsButton
                    text = { mTs.year }
                    onClick = { handleYearClick }
                />
                { mTs.month !== null && <MTsButton
                    text = { MONTH_NAMES[ mTs.month - 1 ] }
                    marginLeft = { true }
                    onClick = { handleMonthClick }
                />}
                { mTs.week !== null && <MTsButton
                    text = { `S${ mTs.week + 1 }` }
                    marginLeft = { true }
                    onClick = { handleWeekClick }
                />}
            </div>
            <button
                onClick = { () => setShowFilters( curr => !curr ) }

                style = {{
                    position: "absolute",
                    top: "0px",
                    right: "0px",

                    width: "25px",
                    height: "25px",

                    margin: "0",
                    marginLeft: "auto",
                    padding: "0",
                    paddingTop: "3px"
                }}
            >
                <img
                    src = { FilterIcon }
                    width = "16px"
                    height = "16px"
                />
            </button>
            { showFilters && <div
                style = {{
                    position: "absolute",
                    top: "35px",
                    right: "0px",

                    backgroundColor: "#F1F4F9",
                    borderColor: "#E2E9F3",
                    borderRadius: "5px",

                    // border: "1px solid red"
                }}
            >
                <div
                    style = {{
                        // width: "300px",
                        // height: "200px",
                        padding: "10px",

                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <select
                        value = { agents[ filters.selAgent ] }

                        onClick = { ( e ) => setFilters( curr => (
                            { ...curr, selAgent: e.target.selectedindex }
                        ))}
                    >
                        { agents.map( ( e, i ) => (
                            <option key = { i }>{ e }</option>
                        ))}
                    </select>
                    <FilterButton
                        text = "CONTACT"
                        bgColor = { filters.contact ? "#31a3fa" : "#e3f0fa" }

                        onClick = { ( e ) => setFilters( curr => (
                            { ...curr, contact: !curr.contact }
                        ))}
                    />
                    <FilterButton
                        text = "DEPOSIT"
                        bgColor = { filters.deposit ? "#f83939" : "#fae3e3" }

                        onClick = { ( e ) => setFilters( curr => (
                            { ...curr, deposit: !curr.deposit }
                        ))}
                    />
                    <FilterButton
                        text = "ARRIVAL"
                        bgColor = { filters.arrival ? "#f9b331" : "#faf2e3" }

                        onClick = { ( e ) => setFilters( curr => (
                            { ...curr, arrival: !curr.arrival }
                        ))}
                    />
                </div>
            </div>}
        </div>
        <div
            style = {{
                width: "100%",
                height: "89%",
            }}
        >
            <Bar
                ref = { chartRef }
                data = { data }
                options = { opts }

                onClick = { handleChartClick }
            />
        </div>
    </div>
}


function LeftUpperFrame(){
    const { clientRoadmap } = useContext( Ctx )

    return <div
        style = {{
            width: "100%",

            maxHeight: clientRoadmap.labels.length === 0 ? "100%" : "63%",
            height: clientRoadmap.labels.length === 0 ? "100%" : "63%",

            padding: "15px",
            backgroundColor: "white",
            borderRadius: "5px",
            border: "1px solid #E2E9F3"
        }}
    >
        <MTsChart/>
    </div>
}


function ClientRoadMap(){
    const chartRef = useRef( null )
    const { clientRoadmap, setSelRoadmapInter, setCreateInter } = useContext( Ctx )

    return <div
        style = {{
            position: "relative"
        }}
    >
        { <button
            onClick = { () => {
                setCreateInter( true )
            }}

            style = {{
                position: "absolute",

                width: "25px",
                height: "25px",
                
                margin: "0",
                padding: "0"
            }}
        >
            <p
                style = {{
                    position: "absolute",
                    top: "-6px",
                    left: "4px",
    
                    margin: "0",
                    padding: "0",
    
                    fontSize: "x-large",
                    fontWeight: "bold"
                }}
            >
                +
            </p>
        </button>}
        <Line
            ref = { chartRef }
            data = { clientRoadmap }
            options = { LINE }

            onClick = { ( e ) => {
                const element = getElementAtEvent( chartRef.current, e )
                if( !element.length ){ return }
                const { datasetIndex, index } = element[ 0 ]

                if( clientRoadmap.datasets[ datasetIndex ].label !== "MILESTONE" ){
                    setSelRoadmapInter( { datasetIndex: datasetIndex, index: index } )
                }
            }}
        />
    </div>
}


function LeftLowerFrame(){
    const { clientRoadmap } = useContext( Ctx )

    return <div
        style = {{
            width: "100%",

            maxHeight: clientRoadmap.labels.length === 0 ? "0px" : "35%",
            height: clientRoadmap.labels.length === 0 ? "0px" : "35%",

            padding: clientRoadmap.labels.length === 0 ? "0" : "15px",

            backgroundColor: "white",
            borderRadius: "5px",
            border: clientRoadmap.labels.length === 0 ? "none" : "1px solid #E2E9F3"
        }}
    >
        <ClientRoadMap/>
    </div>
}


function LeftSide(){
    return <div
        style = {{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",

            width: "70%",
            height: "100%",
        }}
    >
        <LeftUpperFrame/>
        <LeftLowerFrame/>
    </div>
}


function PTsPTag( { text, marginLeft = false } ){
    return <p
        style = {{
            height: "25px",
            margin: "0",
            marginLeft: marginLeft ? "7px" : "0",
            padding: "0 8px",

            border: "1px solid #E2E9F3",
            borderRadius: "5px",
            backgroundColor: "#F1F4F9",
            fontSize: "medium",
            fontWeight: "bold",
        }}
    >
        { text }
    </p>
}


function PTsChart(){
    const { pTs, pTsData } = useContext( Ctx )

    return <>
        <div
            style = {{
                width: "100%",
                height: "100%",

                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div
                style = {{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                { pTs.month !== null && <PTsPTag
                    text = { MONTH_NAMES[ pTs.month - 1 ] }
                />}
                { pTs.week !== null && <PTsPTag
                    text = { `S${ pTs.week + 1 }` }
                    marginLeft = { true }
                />}
                { pTs.day !== null && <PTsPTag
                    text = { `${ DAY_NAMES[ pTs.day ] }` }
                    marginLeft = { true }
                />}
            </div>
            <div
                style = {{
                    width: "100%",
                    height: "86%",

                    padding: "0",
                }}
            >
                <Pie
                    data = { pTsData }
                    options = {{
                        responsive: true,
                        maintainAspectRatio: false,
                    
                        plugins: {
                            legend: {
                                position: "left"
                            }
                        }
                    }}
                />
            </div>
        </div>
    </>
}


function RightUpperFrame(){
    return <div
        style = {{
            width: "100%",
            height: "40%",

            padding: "15px",
            backgroundColor: "white",
            borderRadius: "5px",
            border: "1px solid #E2E9F3"
        }}
    >
        <PTsChart/>
    </div>
}


function Checker( { checked = false, handleCheckerClick } ){
    return <div
        className = "checker"

        onClick = { handleCheckerClick }

        style = {{
            position: "relative",

            width: "17px",
            height: "17px",

            marginRight: "7px",
            
            borderRadius: "50%",
            border: "1px solid E2E9F3",
            backgroundColor: "white"
        }}
    >
        <div
            style = {{
                position: "absolute",

                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                
                width: "9px",
                height: "9px",
                
                margin: "auto",
                
                borderRadius: "50%",
                border: "1px solid E2E9F3",
                backgroundColor: checked ? "#57f252" : "#f25252"
            }}
        />
    </div>
}


const BarType = { "CONTACT": 0, "DEPOSIT": 1, "ARRIVAL": 2 }

// function InterBar( { i, barType, clientVid, clientName, checked, handleCheckerClick } ){
//     const BarBgCols = [ "#e3f0fa", "#fae3e3", "#faf2e3" ]

//     const {
//         setSelInter,
//         clientRoadmap, setClientRoadmap
//     } = useContext( Ctx )

//     const handleClick = () => {
//         setSelInter( i )
        
//         axios.get( `http://localhost:8000/client/${clientVid}/roadmap` )
//         .then( ( res ) => {
//             const roadmap = res.data
//             setClientRoadmap( roadmap )
//         })
//     }

//     return <div
//         style = {{
//             width: "100%",
//             height: "50px",

//             marginBottom: "7px",
//             padding: "5px",

//             borderRadius: "5px",
//             border: "1px solid #E2E9F3",
//             backgroundColor: BarBgCols[ BarType[ barType ] ]
//         }}
//     >
//         <div
//             style = {{
//                 width: "100%",
//                 height: "100%",

//                 display: "flex",
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center"
//             }}
//         >
//             <p
//                 className = "client-name"

//                 onClick = { handleClick }

//                 style = {{
//                     paddingLeft: "7px",

//                     fontSize: "large",
//                     fontWeight: "bold"
//                 }}
//             >
//                 { clientName }
//             </p>
//             <Checker
//                 checked = { checked }
//                 handleCheckerClick = { handleCheckerClick }
//             />
//         </div>
//     </div>
// }


function InterBar( { interIndex, interaction, handleCheckerClick } ){
    const BarBgCols = [ "#e3f0fa", "#fae3e3", "#faf2e3" ]

    const {
        setSelInter,
        clientRoadmap, setClientRoadmap,
        selRoadmapInter, setSelRoadmapInter
    } = useContext( Ctx )

    const handleClick = () => {
        axios.get( `${apiHostname}/client/${interaction.client.vid}/roadmap` )
        .then( ( res ) => {
            const roadmap = res.data

            setSelInter( interIndex )
            setClientRoadmap( roadmap )

            let i = 0
            for( const e of roadmap.datasets[ BarType[ interaction.interaction.milestone_type ] ].data ){
                if( e.x === interaction.interaction.inter_date ){
                    setSelRoadmapInter( { datasetIndex: BarType[ interaction.interaction.milestone_type ], index: i } )
                    return
                }
                i += 1
            }

            console.log( "Error: this sould never be printed..." )
        })
    }

    return <div
        style = {{
            width: "100%",
            height: "50px",

            marginBottom: "7px",
            padding: "5px",

            borderRadius: "5px",
            border: "1px solid #E2E9F3",
            backgroundColor: BarBgCols[ BarType[ interaction.interaction.milestone_type ] ]
        }}
    >
        <div
            style = {{
                width: "100%",
                height: "100%",

                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >
            <p
                className = "client-name"

                onClick = { handleClick }

                style = {{
                    paddingLeft: "7px",

                    fontSize: "large",
                    fontWeight: "bold"
                }}
            >
                { interaction.client.name }
            </p>
            <Checker
                checked = { interaction.interaction.checked }
                handleCheckerClick = { handleCheckerClick }
            />
        </div>
    </div>
}


function InterBarCont( { interList, setInterList } ){
    const handleCheckerClick = ( i ) => {
        const client_vid = interList[ i ].client.vid
        const milestone_type = interList[ i ].interaction.milestone_type
        const inter_date = interList[ i ].interaction.inter_date

        const qArgs = `?client_vid=${client_vid}&milestone_type=${milestone_type}&inter_date=${inter_date}}`

        axios.post( `${apiHostname}/interactions/checked/toogle${qArgs}` )
        .then( ( res ) => {
            setInterList( ( curr ) => {
                const aux = curr.slice()
                aux[ i ].interaction.checked = res.data.new_value
                
                return aux
            })
        })
    }

    return <div
        style = {{
            width: "100%",
            height: "100%"
        }}
    >
        { interList.map( ( e, i ) => (
            <InterBar
                key = { i }
                interIndex = { i }
                interaction = { interList[ i ] }

                handleCheckerClick = { () => handleCheckerClick( i ) }
            />
        ))}
        <div style = {{ height: "8px" }}/>
    </div>
}


function PTagPosAbs( { text, top, left, fontSize } ){
    return <p
        style = {{
            position: "absolute",
            top: top,
            left: left,

            width: "fit-content",

            margin: "0",
            padding: "0",

            fontSize: fontSize,
            fontWeight: "bold",

            // border: "1px solid red"
        }}
    >
        { text }
    </p>
}


// function PTag( { text, fontSize } ){
//     return <p
//         style = {{
//             width: "fit-content",

//             margin: "0",
//             padding: "0",

//             fontSize: fontSize,
//             fontWeight: "bold",

//             // border: "1px solid red"
//         }}
//     >
//         { text }
//     </p>
// }


function ClientName( { name, lastname } ){
    return <div
        style = {{
            position: "relative",

            width: "250px",
            height: "95px",

            // border: "1px solid red"
        }}
    >
        <PTagPosAbs
            text = { name }
            top = "-13px"
            left = "0px"
            fontSize = "xxx-large"
        />
        <PTagPosAbs
            text = { lastname }
            top = "47px"
            left = "0px"
            fontSize = "xx-large"
        />
    </div>
}


function WhatsAppInfo( { phone } ){
    return <div
        style = {{
            display: "flex",
            flexDirection: "row",

            marginTop: "10px",

            // border: "1px solid red"
        }}
    >
        <img
            width = "30px"
            height = "30px"
            src = { WhatsAppLogo }
        />
        <p
            style = {{
                width: "fit-content",

                margin: "0",
                marginLeft: "10px",
                padding: "0",

                fontSize: "large",
                fontWeight: "bold"
            }}
        >
            { phone }
        </p>
    </div>
}


function EmailInfo( { email } ){
    return <div
        style = {{
            display: "flex",
            flexDirection: "row",

            marginTop: "10px",

            // border: "1px solid red"
        }}
    >
        <img
            width = "24px"
            height = "24px"
            src = { EmailIcon }

            style = {{
                marginLeft: "3px"
            }}
        />
        <p
            style = {{
                width: "fit-content",

                margin: "0",
                marginLeft: "12px",
                padding: "0",

                fontSize: "large",
                fontWeight: "bold"
            }}
        >
            { email }
        </p>
    </div>
}


function InterDetails( { interaction, handleClose } ){
    const { clientRoadmap, selRoadmapInter } = useContext( Ctx )

    return <div
        style = {{
            position: "relative",

            width: "100%",
            height: "100%",

            overflow: "hidden"
        }}
    >
        <div
            className = "close-btn"

            onClick = { handleClose }

            style = {{
                position: "absolute",
                top: "0px",
                left: "309px",

                width: "22px",
                height: "22px",

                borderRadius: "50%",
                border: "1px solid #E2E9F3",

                backgroundColor: "#F1F4F9"
            }}
        >
            <PTagPosAbs
                text = "x"
                top = "-4px"
                left = "6px"
                fontSize = "medium"
            />
        </div>
        <ClientName
            name = { interaction.client.name }
            lastname = { interaction.client.lastname }
        />
        <WhatsAppInfo
            phone = { interaction.client.phone }
        />
        <EmailInfo
            email = { interaction.client.email }
        />
        <p
            style = {{
                margin: "0px",
                marginTop: "7px",

                padding: "0px",

                fontSize: "x-large",
                fontWeight: "bold",

                // border: "1px solid red"
            }}
        >
            Comentarios
        </p>
        <textarea
            readOnly = { true }

            value = {
                clientRoadmap
                .datasets[ selRoadmapInter.datasetIndex ]
                .data[ selRoadmapInter.index ]
                .info
                .comments
            }

            style = {{
                width: "100%",
                height: "58px",

                marginTop: "10px",

                resize: "none"
            }}
        >
            {/* { interaction.interaction.inter_desc } */}
        </textarea>
    </div>
}


function InterCreator( { interaction, handleClose } ){
    const interTypes = [ "CONTACT", "DEPOSIT", "ARRIVAL" ]
    const [ type, setType ] = useState( 0 )
    const [ date, setDate ] = useState( "" )
    const [ comments, setComments ] = useState( "" )

    const { setClientRoadmap, setCreateInter } = useContext( Ctx )

    return <div
        style = {{
            position: "relative",

            width: "100%",

            overflow: "hidden"
        }}
    >
        <div
            className = "close-btn"

            onClick = { handleClose }

            style = {{
                position: "absolute",
                top: "0px",
                left: "309px",

                width: "22px",
                height: "22px",

                borderRadius: "50%",
                border: "1px solid #E2E9F3",

                backgroundColor: "#F1F4F9"
            }}
        >
            <PTagPosAbs
                text = "x"
                top = "-4px"
                left = "6px"
                fontSize = "medium"
            />
        </div>
        <ClientName
            name = { interaction.client.name }
            lastname = { interaction.client.lastname }
        />
        <div
            style = {{
                display: "flex",
                alignItems: "center",

                marginTop: "10px"
            }}
        >
            <p
                style = {{
                    margin: "0px",
                    padding: "0px",

                    fontSize: "x-large",
                    fontWeight: "bold"
                }}
            >
                Tipo:
            </p>
            <select
                value = { interTypes[ type ] }

                onChange = { ( e ) => setType( e.target.selectedIndex ) }

                style = {{
                    width: "107px",
                    height: "30px",

                    marginLeft: "10px",
                    marginTop: "5px",

                    fontSize: "large"
                }}
            >
                <option>CONTACT</option>
                <option>DEPOSIT</option>
                <option>ARRIVAL</option>
            </select>
        </div>
        <div
            style = {{
                display: "flex",
                alignItems: "center",

                marginTop: "10px"
            }}
        >
            <p
                style = {{
                    margin: "0px",
                    padding: "0px",

                    fontSize: "x-large",
                    fontWeight: "bold"
                }}
            >
                Fecha:
            </p>
            <input
                type = "date"
                value = { date }

                onChange = { ( e ) => setDate( e.target.value ) }

                style = {{
                    width: "135px",
                    height: "30px",

                    marginLeft: "10px",
                    marginTop: "5px",
                    padding: "0",

                    fontSize: "large"
                }}
            />
        </div>
        <p
            style = {{
                margin: "0px",
                marginTop: "7px",

                padding: "0px",

                fontSize: "x-large",
                fontWeight: "bold"
            }}
        >
            Comentarios
        </p>
        <textarea
            value = { comments }

            onChange = { ( e ) => setComments( e.target.value ) }

            style = {{
                width: "100%",
                height: "58px",

                marginTop: "10px",

                resize: "none"
            }}
        />
        <button
            onClick = { () => {
                axios.post(
                    `${apiHostname}/interactions/create`,
                    {
                        client_vid: interaction.client.vid,
                        milestone_type: interTypes[ type ],
                        inter_date: date,
                        inter_desc: comments
                    }
                )
                .then( ( res ) => {
                    if( res.status == 200 ){
                        axios.get( `${apiHostname}/client/${interaction.client.vid}/roadmap` )
                        .then( ( res ) => {
                            setClientRoadmap( res.data )
                        })

                        setCreateInter( false )
                    }
                })
            }}

            style = {{
                width: "100%",
                height: "30px",

                marginTop: "10px",
                padding: "0",
                paddingBottom: "35px",

                textAlign: "center",
                fontSize: "x-large",
                fontWeight: "bold"
            }}
        >
            Guardar
        </button>
        <div style = {{ height: "8px" }}/>
    </div>
}


function RightLowerFrame(){
    const {
        interList, setInterList,
        selInter, setSelInter,
        clientRoadmap, setClientRoadmap,
        createInter, setCreateInter
    } = useContext( Ctx )

    return <div
        style = {{
            width: "100%",
            height: "58%",

            overflow: "auto",

            padding: "15px",
            backgroundColor: "white",
            borderRadius: "5px",
            border: "1px solid #E2E9F3"
        }}
    >
        { selInter === -1 && <InterBarCont
            interList = { interList }
            setInterList = { setInterList }
        />}
        { selInter !== -1 && !createInter && <InterDetails
            interaction = { interList[ selInter ] }

            handleClose = { () => {
                setSelInter( -1 )
                setClientRoadmap( { labels: [], datasets: [] } )
            }}
        />}
        { selInter !== -1 && createInter && <InterCreator
            interaction = { interList[ selInter ] }
            
            handleClose = { () => {
                setCreateInter( false )
            }}
        />}
    </div>
}


function RightSide(){
    return <div
        style = {{
            width: "29%",
            height: "100%",

            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }}
    >
        <RightUpperFrame/>
        <RightLowerFrame/>
    </div>
}


function Dashboard(){
    const [ mTs, setMTs ] = useState( { year: 2024, month: null, week: null, day: null } )
    const [ pTs, setPTs ] = useState( { year: 2024, month: null, week: null, day: null } )
    // const [ mTsData, setMTsData ] = useState( null )
    const [ pTsData, setPTsData ] = useState( { labels: [], datasets: [] } )
    const [ interList, setInterList ] = useState( [] )
    const [ selInter, setSelInter ] = useState( -1 )
    const [ clientRoadmap, setClientRoadmap ] = useState( { labels: [], datasets: [] } )
    const [ selRoadmapInter, setSelRoadmapInter ] = useState( -1 )
    const [ createInter, setCreateInter ] = useState( false )

    return <Ctx.Provider
        value = {{
            mTs, setMTs,
            pTs, setPTs,
            // mTsData, setMTsData,
            pTsData, setPTsData,
            interList, setInterList,
            selInter, setSelInter,
            clientRoadmap, setClientRoadmap,
            selRoadmapInter, setSelRoadmapInter,
            createInter, setCreateInter
        }}
    >
        <div
            style = {{
                width: "100vw",
                height: "100vh",

                padding: "15px",
            }}
        >
            <div
                style = {{
                    width: "100%",
                    height: "100%",

                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <LeftSide/>
                <RightSide/>
            </div>
        </div>
    </Ctx.Provider>
}


function App(){
    return <Dashboard/>
}


export default App