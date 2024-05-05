export const BAR_STACKED_CLICKABLE = ( setMTs, setPTs, setMTsData, setPTsData, pTsDataIndex ) => ({
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

        if( !element.length ){ return }
        const { index } = element[ 0 ]

        if( index !== pTsDataIndex.current ){
            setMTsData( ( mTsData ) => {
                const labels = mTsData.datasets.map( ( e ) => e.label )
                const data = mTsData.datasets.map( ( e ) => e.data[ index ] )

                
                setMTs( ( mTs ) => {
                    if( mTs.week !== null || mTs.day !== null ){
                        setPTs( { ...mTs, day: index } )
                    }
                    else if( mTs.month && mTs.week === null ){
                        setPTs( { ...mTs, week: index } )
                    }
                    else if( mTs.month === null ){
                        setPTs( { ...mTs, month: index + 1 } )
                    }
                    else{
                        console.log( "Error: this condition should NEVER be true..." )
                    }

                    return mTs
                })

                setPTsData({
                    labels: labels,
                    datasets: [ { data: data } ]
                })

                pTsDataIndex.current = index

                return mTsData
            })
        }
    }
})


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
            max: 3.5
        }
    },

    plugins: {
        legend: {
            display: false
        }
    },
}


// const sum = curr.datasets.reduce( ( acum, e ) => ( acum + e.data[ index ] ), 0 )
// const nPDs = curr.datasets.map( ( e ) => ( { label: e.label, data: [ 100 * e.data[ index ] / sum ] } ) )