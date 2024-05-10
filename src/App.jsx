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

const RiskLevelsParams = {
    L_RISK: { fc: "#059BFF", sc: "#9AD0F5", tc: "#d1e7f6", },
    H_RISK: { fc: "#FF9020", sc: "#FFCF9F", tc: "#f7e4d1", },
    M_RISK: { fc: "#FF4069", sc: "#FFB1C1", tc: "#f7d2da", }
}

const Ctx = createContext( null )

const apiHostname = "https://mmontoya-back.onrender.com"
// const apiHostname = "http://localhost:8000"


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


function MTsChart(){
    const {
        mTimespan, setMTimespan,
        setDTimespan,
        metrics, setMetrics,
        setSegment,
        setInterList,
        setSelInter,
        setClientRoadmap,
        setCreateInter
    } = useContext( Ctx )

    const disableHover = useRef( true )
    const segmentRef = useRef( -1 )

    const chartRef = useRef( null )

    useEffect(
        () => {
            setTimeout( () => {
                disableHover.current = false
            }, 1500 )
        },
        []
    )

    const buildDatasets = () => {
        let datasets = { L_RISK: [], M_RISK: [], H_RISK: [] }

        for( const counts of metrics.segments.counts ){
            datasets.L_RISK.push( counts.L_RISK )
            datasets.M_RISK.push( counts.M_RISK )
            datasets.H_RISK.push( counts.H_RISK )
        }

        return [            
            {
                label: "BAJO",
                data: datasets.L_RISK,
                borderRadius: 5,
                backgroundColor: RiskLevelsParams.L_RISK.fc
            },
            {
                label: "MEDIO",
                data: datasets.M_RISK,
                borderRadius: 5,
                backgroundColor: RiskLevelsParams.M_RISK.fc
            },
            {
                label: "ALTO",
                data: datasets.H_RISK,
                borderRadius: 5,
                backgroundColor: RiskLevelsParams.H_RISK.fc
            }
        ]
    }

    // const buildFiltersQParams = () => {
    //     let qParams = ""
        
    //     if( !filters.contact ){
    //         qParams = qParams.concat( "&exc_cont=true" )
    //     }
    //     if( !filters.deposit ){
    //         qParams = qParams.concat( "&exc_dep=true" )
    //     }
    //     if( !filters.arrival ){
    //         qParams = qParams.concat( "&exc_arr=true" )
    //     }

    //     return qParams
    // }
    
    const handleYearClick = () => {
        let qParams = `?year=${mTimespan.year}`

        axios.get( `${apiHostname}/metrics${qParams}` )
        .then( ( res ) => {
            setMTimespan( ( curr ) => ( { ...curr, month: null, week: null, day: null } ) )
            setDTimespan( ( curr ) => ( { ...curr, month: null, week: null, day: null } ) )
            setMetrics( res.data )
            setSegment( -1 )
        })

        axios.get( `${apiHostname}/interactions${qParams}` )
        .then( ( res ) => {
            setInterList( res.data )
            setSelInter( -1 )
            setClientRoadmap( { labels: [], datasets: [] } )
            setCreateInter( false )
        })

        disableHover.current = true
        setTimeout( () => {
            disableHover.current = false
        }, 1000 )
    }

    const handleMonthClick = () => {
        let qParams = `?year=${mTimespan.year}&month=${mTimespan.month}`
        
        axios.get( `${apiHostname}/metrics${qParams}` )
        .then( ( res ) => {
            setMTimespan( ( curr ) => ( { ...curr, week: null, day: null } ) )
            setDTimespan( ( curr ) => ( { ...curr, week: null, day: null } ) )
            setMetrics( res.data )
            setSegment( -1 )
        })

        axios.get( `${apiHostname}/interactions${qParams}` )
        .then( ( res ) => {
            setInterList( res.data )
            setSelInter( -1 )
            setClientRoadmap( { labels: [], datasets: [] } )
            setCreateInter( false )
        })

        disableHover.current = true
        setTimeout( () => {
            disableHover.current = false
        }, 1000 )
    }

    const handleWeekClick = () => {
        let qParams = `?year=${mTimespan.year}&month=${mTimespan.month}&week=${mTimespan.week}`

        axios.get( `${apiHostname}/metrics${qParams}` )
        .then( ( res ) => {
            setMTimespan( ( curr ) => ( { ...curr, day: null } ) )
            setDTimespan( ( curr ) => ( { ...curr, day: null } ) )
            setMetrics( res.data )
            setSegment( -1 )

            axios.get( `${apiHostname}/interactions${qParams}` )
            .then( ( res ) => {
                setInterList( res.data )
                setSelInter( -1 )
                setClientRoadmap( { labels: [], datasets: [] } )
                setCreateInter( false )
            })
        })

        disableHover.current = true
        setTimeout( () => {
            disableHover.current = false
        }, 1000 )
    }

    const handleChartClick = ( e ) => {
        // if( !opts.onHover ){ return }

        const element = getElementAtEvent( chartRef.current, e )
        if( !element.length ){ return }

        const { index } = element[ 0 ]

        let qParams = "?"
        if( mTimespan.week !== null ){
            setMTimespan( ( curr ) => ( { ...curr, day: index } ) )
            setDTimespan( ( curr ) => ( { ...curr, day: index } ) )
            qParams += `year=${mTimespan.year}&month=${mTimespan.month}&week=${mTimespan.week}&day=${index}`
        }
        else if( mTimespan.month && mTimespan.week === null ){
            setMTimespan( ( curr ) => ( { ...curr, week: index } ) )
            setDTimespan( ( curr ) => ( { ...curr, week: index } ) )
            qParams += `year=${mTimespan.year}&month=${mTimespan.month}&week=${index}`
        }
        else if( mTimespan.year && mTimespan.month === null ){
            setMTimespan( ( curr ) => ( { ...curr, month: index + 1 } ) )
            setDTimespan( ( curr ) => ( { ...curr, month: index + 1 } ) )
            qParams += `year=${mTimespan.year}&month=${index + 1}`
        }
        else{
            console.log( "ERROR: this condition should NEVER be true..." )
            // console.log( ts )
        }

        axios.get( `${apiHostname}/metrics${qParams}` )
        .then( ( res ) => {
            setMetrics( res.data )
            if( mTimespan.week === null ){
                setSegment( -1 )
            }
        })

        axios.get( `${apiHostname}/interactions${qParams}` )
        .then( ( res ) => {
            setInterList( res.data )
            setSelInter( -1 )
            setClientRoadmap( { labels: [], datasets: [] } )
            setCreateInter( false )
        })

        disableHover.current = true
        setTimeout( () => {
            disableHover.current = false
        }, 1000 )
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
                display : "flex",
                justifyContent: "space-between",
                alignItems: "center"
                // position: "relative",
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
                    text = { mTimespan.year }
                    onClick = { handleYearClick }
                />
                { mTimespan.month !== null && <MTsButton
                    text = { MONTH_NAMES[ mTimespan.month - 1 ] }
                    marginLeft = { true }
                    onClick = { handleMonthClick }
                />}
                { mTimespan.week !== null && <MTsButton
                    text = { `S${ mTimespan.week + 1 }` }
                    marginLeft = { true }
                    onClick = { handleWeekClick }
                />}
            </div>
            <div>
                <p
                    style = {{
                        margin: "0",
                        padding: "0",

                        fontSize: "large",
                        fontWeight: "bold"
                    }}
                >
                    Explorador
                </p>
                <div style = {{
                    width: "100%",
                    height: "2px",

                    marginTop: "2px",

                    borderRadius: "2px",
                    backgroundColor: "#213547"
                }}/>
            </div>
        </div>
        <div
            style = {{
                width: "100%",
                height: "89%",
            }}
        >
            <Bar
                ref = { chartRef }

                data = {{
                    labels: metrics.segments.labels,
                    datasets: buildDatasets()
                }}

                options = { BAR_STACKED_CLICKABLE( disableHover, setMTimespan, segmentRef, setSegment, setDTimespan ) }

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

                if( clientRoadmap.datasets[ datasetIndex ].label !== "MILESTONES" ){
                    setSelRoadmapInter( { datasetIndex: datasetIndex, index: index } )
                }
            }}
        />
    </div>
}


function LeftLowerFrame(){
    const { clientRoadmap } = useContext( Ctx )

    return <>
        { clientRoadmap.labels.length !== 0 && <div
            style = {{
                width: "100%",
                height: "35%",

                padding: "15px",

                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #E2E9F3"
            }}
        >
            <ClientRoadMap/>
        </div> }
    </>
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


function PLabel( { text, bc } ){
    return <p
        style = {{
            width: "40px",
            height: "10px",

            margin: "0",
            padding: "0",
            paddingBottom: "13px",

            borderRadius: "2px",
            border: "1px solid grey",
            backgroundColor: bc,

            fontSize: "xx-small",
            fontWeight: "bold",
            textAlign: "center"
        }}
    >
        { text }
    </p>
}


function PercBar( { perc, mbc, sbc } ){
    return <div
        style = {{
            width: "100%"
        }}
    >
        <p
            style = {{
                margin: "0",
                padding: "0",

                fontSize: "medium",
                fontWeight: "bold"
            }}
        >
            { `${ perc }%` }
        </p>
        <div
            style = {{
                width: "100%",
                height: "5px"
            }}
        >
            <div
            style = {{
                width: "100%",

                display: "flex",
                flexDirection: "row"
            }}
        >
            <div
                style = {{
                    width: `${ perc }%`,
                    height: "5px",

                    borderTopLeftRadius: "2px",
                    borderBottomLeftRadius: "2px",
                    backgroundColor: mbc,
                    transition: "width 0.5s"
                }}
            />
            <div
                style = {{
                    width: `${ 100 - perc }%`,
                    height: "5px",

                    borderTopRightRadius: "2px",
                    borderBottomRightRadius: "2px",
                    backgroundColor: sbc,
                    transition: "width 0.5s"
                }}
            />
        </div>
        </div>
    </div>
}


function PTsChart(){
    const {
        pTs, pTsData,
        progPerc, setProgPerc,
        segment, metrics,
        dTimespan
        // timespan
    } = useContext( Ctx )

    const buildDatasets = () => {
        let datasets

        if( segment === -1 ){
            datasets = [{
                data: [
                    metrics.global.counts.L_RISK,
                    metrics.global.counts.M_RISK,
                    metrics.global.counts.H_RISK
                ],

                borderWidth: 1,

                backgroundColor: [
                    RiskLevelsParams.L_RISK.fc,
                    RiskLevelsParams.M_RISK.fc,
                    RiskLevelsParams.H_RISK.fc
                ]
            }]
        }
        else{
            datasets = [{
                data: [
                    metrics.segments.counts[ segment ].L_RISK,
                    metrics.segments.counts[ segment ].M_RISK,
                    metrics.segments.counts[ segment ].H_RISK
                ],

                borderWidth: 1,

                backgroundColor: [
                    RiskLevelsParams.L_RISK.fc,
                    RiskLevelsParams.M_RISK.fc,
                    RiskLevelsParams.H_RISK.fc
                ]
            }]
        }

        return datasets
    }

    const progress = {}
    if( segment === -1 ){
        progress.L_RISK = metrics.global.progress.L_RISK
        progress.M_RISK = metrics.global.progress.M_RISK
        progress.H_RISK = metrics.global.progress.H_RISK
    }
    else{
        progress.L_RISK = metrics.segments.progress[ segment ].L_RISK
        progress.M_RISK = metrics.segments.progress[ segment ].M_RISK
        progress.H_RISK = metrics.segments.progress[ segment ].H_RISK
    }

    return <div
        style = {{
            width: "100%",
            height: "100%"
        }}
    >
        <div
            style = {{
                width: "100%",

                marginBottom: "10px",

                display: "flex",
                flexDirection: "row",
                alignItems: "center"
            }}
        >
            { dTimespan.year !== null && <PTsPTag
                text = { dTimespan.year }
            />}
            { dTimespan.month !== null && <PTsPTag
                text = { MONTH_NAMES[ dTimespan.month - 1 ] }
                marginLeft = { true }
            />}
            { dTimespan.week !== null && <PTsPTag
                text = { `S${ dTimespan.week + 1 }` }
                marginLeft = { true }
            />}
            { dTimespan.day !== null && <PTsPTag
                text = { `${ DAY_NAMES[ dTimespan.day ] }` }
                marginLeft = { true }
            />}
        </div>
        <div
            style = {{
                height: "100%",

                display: "flex",
                flexDirection: "row",
            }}
        >
            <div
                style = {{
                    width: "137px",
                    height: "137px",

                    padding: "0"
                }}
            >
                <Pie
                    data = {{
                        labels: [ "BAJO", "MEDIO", "ALTO" ],
                        datasets: buildDatasets()
                    }}

                    options = {{
                        responsive: true,
                        maintainAspectRatio: false,
                    
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }}
                />
                <div
                    style = {{
                        marginTop: "6px",

                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <PLabel
                        text = "ALTO"
                        bc = "#FF4069"
                    />
                    <PLabel
                        text = "MEDIO"
                        bc = "#FF9020"
                    />
                    <PLabel
                        text = "BAJO"
                        bc = "#059BFF"
                    />
                </div>
            </div>
            <div
                style = {{
                    width: "100%",
                    height: "fit-content",

                    marginLeft: "15px"
                }}
            >
                <p
                    style = {{
                        margin: "0",
                        padding: "0",

                        fontSize: "medium",
                        fontWeight: "bold"
                    }}
                >
                    Progreso
                </p>
                <div style = {{
                    width: "100%",
                    height: "2px",

                    marginTop: "2px",
                    marginBottom: "10px",

                    borderRadius: "2px",
                    backgroundColor: "#213547"
                }}/>
                <div
                    style = {{
                        height: "118px",

                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }}
                >
                    <PercBar
                        // perc = { progPerc.hr }
                        perc = { progress.H_RISK }
                        mbc = "#FF4069"
                        sbc = "#FFB1C1"
                    />
                    <PercBar
                        perc = { progress.M_RISK }
                        mbc = "#FF9020"
                        sbc = "#FFCF9F"
                    />
                    <PercBar
                        perc = { progress.L_RISK }
                        mbc = "#059BFF"
                        sbc = "#9AD0F5"
                    />
                </div>
            </div>
        </div>
    </div>
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

            // console.log( roadmap )

            let i = 0
            for( const e of roadmap.datasets[ 0 ].data ){
                if( e.x === interaction.interaction.inter_date ){
                    setSelRoadmapInter( { datasetIndex: 0, index: i } )
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
            backgroundColor: RiskLevelsParams[ interaction.client.risk_level ].tc
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
                { interaction.client.name + " " + interaction.client.lastname }
            </p>
            <Checker
                checked = { interaction.interaction.checked }
                handleCheckerClick = { handleCheckerClick }
            />
        </div>
    </div>
}


function InterBarCont( { interList, setInterList } ){
    const { mTimespan, setMetrics } = useContext( Ctx )

    const handleCheckerClick = ( i ) => {
        const client_vid = interList[ i ].client.vid
        // const milestone_type = interList[ i ].interaction.milestone_type
        const inter_date = interList[ i ].interaction.inter_date

        const qArgs = `?client_vid=${client_vid}&inter_date=${inter_date}`

        axios.post( `${apiHostname}/interactions/checked/toogle${qArgs}` )
        .then( ( res ) => {
            setInterList( ( curr ) => {
                const aux = curr.slice()
                aux[ i ].interaction.checked = res.data.new_value
                
                return aux
            })

            let qArgs = `?year=${mTimespan.year}`
            if( mTimespan.month ){
                qArgs = qArgs.concat( `&month=${mTimespan.month}` )
                if( mTimespan.week ){
                    qArgs = qArgs.concat( `&week=${mTimespan.week}` )
                }
            }

            axios.get( `${apiHostname}/metrics${qArgs}` )
            .then( ( res ) => {
                setMetrics( res.data )
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
                interaction = { e }

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


function WhatsAppInfo( { ctyCode, phone } ){
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
            { '+' + ctyCode + ' ' + phone }
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
            ctyCode = { interaction.client.cty_code }
            phone = { interaction.client.phone_num }
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
    const [ mTimespan, setMTimespan ] = useState( { year: 2024, month: null, week: null, day: null } )
    const [ dTimespan, setDTimespan ] = useState( { year: 2024, month: null, week: null, day: null } )
    const [ metrics, setMetrics ] = useState({
        global: { counts: 0, progress: 0 },
        segments: {
            labels: [],
            counts: [],
            progress: []
        }
    })
    const [ segment, setSegment ] = useState( -1 )

    const [ interList, setInterList ] = useState( [] )
    const [ selInter, setSelInter ] = useState( -1 )
    const [ clientRoadmap, setClientRoadmap ] = useState( { labels: [], datasets: [] } )
    const [ selRoadmapInter, setSelRoadmapInter ] = useState( -1 )
    const [ createInter, setCreateInter ] = useState( false )

    useEffect(
        () => {
            axios.get( `${apiHostname}/metrics?year=2024` )
            .then( ( res ) => {
                setMetrics( res.data )
            })

            axios.get( `${apiHostname}/interactions?year=2024` )
            .then( ( res ) => {
                setInterList( res.data )
            })
        },
        []
    )

    return <Ctx.Provider
        value = {{
            mTimespan, setMTimespan,
            dTimespan, setDTimespan,
            metrics, setMetrics,
            segment, setSegment,
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