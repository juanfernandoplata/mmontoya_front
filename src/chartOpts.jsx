import axios from "axios"

// export const BAR_STACKED_CLICKABLE = ( _setMTimespan, _setSegment, setDTimespan ) => ({
export const BAR_STACKED_CLICKABLE = ( disableHover, _setMTimespan, segmentRef, setSegment, setDTimespan ) => ({
    responsive: true,

    maintainAspectRatio: false,

    scales: {
        x: {
            stacked: true,
            grid: {
                display: false
            }
        },
        y: {
            stacked: true,
            ticks: {
                maxTicksLimit: 4
            }
        }
    },

    plugins: {
        legend: {
            display: false
        }
    },

    onHover: ( event, element ) => {
        event.native.target.style.cursor = element[ 0 ] ? 'pointer' : 'default'

        if( disableHover.current ){
            return
        }

        const segment = segmentRef.current

        if( !element.length ){
            // _setMTimespan( ( mTimespan ) => {
            //     setDTimespan( mTimespan )
            //     return mTimespan
            // })

            if( segment !== -1 ){
                _setMTimespan( ( mTimespan ) => {
                    setDTimespan( { ...mTimespan, day: null } )
                    return mTimespan
                })

                segmentRef.current = -1
                setSegment( -1 )
            }

            return
        }
    
        const { index } = element[ 0 ]

        if( segment !== index ){
            _setMTimespan( ( mTimespan ) => {
                let qParams = `year=${mTimespan.year}`

                if( mTimespan.week !== null || mTimespan.day !== null ){
                    setDTimespan( { ...mTimespan, day: index } )
                    qParams += `&month=${mTimespan.month}&week=${mTimespan.week}&day=${index}`
                }
                else if( mTimespan.month && mTimespan.week === null ){
                    setDTimespan( { ...mTimespan, week: index } )
                    qParams += `&month=${mTimespan.month}&week=${index}`
                }
                else if( mTimespan.month === null ){
                    setDTimespan( { ...mTimespan, month: index + 1 } )
                    qParams += `&month=${index + 1}`
                }
                else{
                    console.log( "Error: this condition should NEVER be true..." )
                }
    
                return mTimespan
            })

            segmentRef.current = index
            setSegment( index )
        }
    }
})

//     onHover: ( event, element ) => {
//         event.native.target.style.cursor = element[ 0 ] ? 'pointer' : 'default'

//         _setSegment( ( segment ) => {
//             if( !element.length ){
//                 _setMTimespan( ( mTimespan ) => {
//                     setDTimespan( mTimespan )
//                     return mTimespan
//                 })
//                 return -1
//             }
    
//             const { index } = element[ 0 ]
    
//             if( segment !== index ){
//                 _setMTimespan( ( mTimespan ) => {
//                     let qParams = `year=${mTimespan.year}`
    
//                     if( mTimespan.week !== null || mTimespan.day !== null ){
//                         setDTimespan( { ...mTimespan, day: index } )
//                         qParams += `&month=${mTimespan.month}&week=${mTimespan.week}&day=${index}`
//                     }
//                     else if( mTimespan.month && mTimespan.week === null ){
//                         setDTimespan( { ...mTimespan, week: index } )
//                         qParams += `&month=${mTimespan.month}&week=${index}`
//                     }
//                     else if( mTimespan.month === null ){
//                         setDTimespan( { ...mTimespan, month: index + 1 } )
//                         qParams += `&month=${index + 1}`
//                     }
//                     else{
//                         console.log( "Error: this condition should NEVER be true..." )
//                     }
        
//                     return mTimespan
//                 })
//             }

//             return index
//         })
//     }
// })


export const LINE = {
    responsive: true,

    maintainAspectRatio: false,

    scales: {
        x: {
            ticks: {
                autoSkip: false
            }
        },
        y: {
            display: false,
            min: 0,
            max: 2
        }
    },

    plugins: {
        legend: {
            display: false
        }
    },
}