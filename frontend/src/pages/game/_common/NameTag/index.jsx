import React from 'react'
import Admin from 'img/role/admin.svg'
import Mod from 'img/role/mod.svg'

import './NameTag.scss'
import { Link } from 'react-router-dom'

function NameTag({ player }) {
    return (
        <Link
            to={`/p/${player?.name ?? ''}`}
            className={`name-tag name-tag__${player?.role?.toLowerCase()}`}
        >
            {player?.role?.toLowerCase() === 'administrator' && (
                <img src={Admin} className="role-img" alt="administrator" />
            )}
            {player?.role?.toLowerCase() === 'moderator' && (
                <img src={Mod} className="role-img" alt="moderator" />
            )}
            <p>{player?.name ?? 'n/a'}</p>
        </Link>
    )
}

export default NameTag
