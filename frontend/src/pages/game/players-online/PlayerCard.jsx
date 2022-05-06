import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import NoPosterAvatar from 'img/default-avatar.png'
import NameTag from '../_common/NameTag'

import './playersOnline.scss'

function PlayerCard({ playerOnline }) {
    return (
        <div
            className={`player-card player-card--${playerOnline?.role?.toLowerCase()}`}
        >
            <Link to={`p/${playerOnline?.name}`} className="avatar-container">
                <img
                    src={
                        playerOnline?.avatar
                            ? playerOnline?.avatar
                            : NoPosterAvatar
                    }
                    alt={`${playerOnline?.name} avatar`}
                />
            </Link>
            <div className="player-card__name">
                <NameTag player={playerOnline} />
            </div>
        </div>
    )
}

export default PlayerCard
