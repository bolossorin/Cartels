import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Discord from 'img/discord.svg'

import './ForumsBox.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import StyleButton from '../../_common/StyleButton'

const MOTD_QUERY = gql`
    query GameMotd($clid: String, $state: String) {
        motd
        clientReport(clid: $clid, state: $state) {
            shouldRefresh
            suggestRefresh
        }
    }
`

function getClientInfo() {
    return {
        clid: window.ESCOBAR.clid,
        state: JSON.stringify({
            build: window.ESCOBAR?.build ?? 'unknown',
            perf: window?.performance?.timing,
            lang: window?.navigator?.language,
            plat: window?.navigator?.platform,
        }),
    }
}

function ForumsBox({ categories }) {
    const { clid, state } = getClientInfo()
    const { data } = useQuery(MOTD_QUERY, {
        pollInterval: 30000,
        fetchPolicy: 'network-only',
        variables: {
            clid,
            state,
        },
    })
    const motd = data?.motd
    const shouldRefresh = data?.clientReport?.shouldRefresh
    const suggestRefresh = data?.clientReport?.suggestRefresh

    return (
        <>
            {motd && (
                <div className="forums-box content-box">
                    <Link to="/updates" className="forums-box__header">
                        Message from staff
                    </Link>
                    <div className="announce-box-remove-after-forums">
                        {motd}
                    </div>
                    {suggestRefresh && (
                        <div>
                            <p>
                                <StyleButton
                                    text="Please refresh your game"
                                    disabled={false}
                                    loading={false}
                                    color="red"
                                    onClick={() => {
                                        window.location = `https://www.downtown-mafia.com/?c=${randomChar()}`
                                    }}
                                />
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="forums-box content-box">
                <Link to="/updates" className="forums-box__header">
                    Discord
                </Link>
                <div className="announce-box-remove-after-forums">
                    Join us for discussion on our Discord server. We're eager to
                    hear your feedback and learn about any bugs you may find.
                    <a href="https://discord.gg/5Xe845M" target="_blank">
                        <img src={Discord} alt="Join us on Discord!" />
                    </a>
                </div>
            </div>
        </>
    )

    // return (
    //     <div className="forums-box content-box">
    //         <Link to="/forums" className="forums-box__header">
    //             Forumsz
    //         </Link>
    //         <div className="forums-box__list">
    //             <ul>
    //                 {categories.map(({ key, link, title, unread, count }) => (
    //                     <li key={key}>
    //                         <Link to={link}>
    //                             <div>
    //                                 <span>{title}</span>
    //                                 {unread > 0 && (
    //                                     <span className="forum-new">
    //                                         +{unread} New
    //                                     </span>
    //                                 )}
    //                             </div>
    //                             <span className="forum-count">{count}</span>
    //                         </Link>
    //                     </li>
    //                 ))}
    //             </ul>
    //         </div>
    //     </div>
    // )
}

ForumsBox.propTypes = {
    categories: PropTypes.instanceOf(Array).isRequired,
}

export default React.memo(ForumsBox)
