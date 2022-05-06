import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import PercentBar from '../_common/PercentBar'

const JAIL_STATS_QUERY = gql`
    query InmatesQuery {
        viewer {
            player {
                id
                stats {
                    bustSuccess
                    bustFail
                    bustTotal
                    bustStreak
                    bustStreakMax
                    bustedSuccess
                    bustedFail
                }
            }
        }
        jail {
            progression {
                id
                level
                progress
                progressMin
                progressTarget
            }
        }
    }
`

function JailStats() {
    const { data } = useQuery(JAIL_STATS_QUERY, {
        fetchPolicy: 'cache-and-network',
    })

    const stats = data?.viewer?.player?.stats
    const progress = data?.jail?.progression

    return (
        <>
            {stats ? (
                <>
                    <PercentBar
                        value={progress?.progress}
                        maxValue={progress?.progressTarget}
                        showMaxValue
                        unit="XP"
                        color="blue"
                        label={`Level ${progress?.level}`}
                    />
                    <div className="jail__stats">
                        <div className="jail__stats__total">
                            <h4>TOTAL BUSTS</h4>
                            <p>{`${stats.bustTotal} Busts`}</p>
                        </div>
                        <div className="jail__stats__details">
                            <p>{`${stats.bustSuccess} Successful / ${stats.bustFail} Failed busts`}</p>
                            <p>{`${stats.bustStreak} busts in a row (${stats.bustStreakMax} best)`}</p>
                            <p>{`${stats.bustedSuccess} Times Busted`}</p>
                        </div>
                    </div>
                </>
            ) : (
                <IntegratedLoader />
            )}
        </>
    )
}

export default React.memo(JailStats)
