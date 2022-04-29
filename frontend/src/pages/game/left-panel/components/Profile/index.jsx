/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import PercentBar from '../../../_common/PercentBar'
import NoPosterAvatar from 'img/default-avatar.png'

import './Profile.scss'
import NameTag from '../../../_common/NameTag'
import Egg from 'assets/images/easter/egg_1.png'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import CrewTag from '../../../crews/CrewTag'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                name
                character
                rank
                xp
                xpTarget
                hp
                isJailed
                role
                cash
                crew {
                    id
                    name
                    crewType
                }
            }
        }
    }
`

function Profile() {
    const { data } = useQuery(VIEWER_QUERY)
    const player = data?.viewer?.player

    return (
        <>
            <div className="profile-container">
                <Link to={`/p/${player?.name}`} className="avatar-container">
                    <img
                        src={NoPosterAvatar}
                        className="profile-picture"
                        alt={player?.name}
                    />
                </Link>
                <Link to={`/eggcombinator`} className="easter-container">
                    <img
                        src={Egg}
                        className="egg-combinator"
                        alt={`Easter event`}
                    />
                </Link>
                <div className="profile-info-container">
                    <div className="names">
                        <NameTag player={player} />
                        <CrewTag crew={player?.crew} linkToMyCrew />
                    </div>
                    <div className="bars">
                        <PercentBar
                            value={player?.hp ?? 100}
                            maxValue={100}
                            unit="HP"
                            color="red"
                        />
                        <PercentBar
                            value={player?.xp ?? 0}
                            maxValue={player?.xpTarget ?? 0}
                            showMaxValue
                            unit="XP"
                            color="blue"
                        />
                    </div>
                    <p className="rank">{player?.rank}</p>
                </div>
            </div>
        </>
    )
}

Profile.propTypes = {
    avatarImg: PropTypes.node,
    level: PropTypes.string,
    name: PropTypes.string,
    factionName: PropTypes.string,
}

Profile.defaultProps = {
    avatarImg: null,
    level: '',
    name: '',
    factionName: '',
}

export default Profile
