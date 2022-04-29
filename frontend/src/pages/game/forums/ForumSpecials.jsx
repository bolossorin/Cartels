import React from 'react'
import { Link } from 'react-router-dom'
import Pinned from 'img/forums/pinned.svg'
import Announcement from 'img/forums/announcement.svg'
import Favorite from 'img/forums/favorite.svg'
import Hidden from 'img/forums/hidden.svg'
import Locked from 'img/forums/locked.svg'

import './Forums.scss'
import Content from '../../_common/Content/Content'

function ForumsSpecials({ thread }) {
    return (
        <div className="forums-specials">
            {thread?.isHidden && <img src={Hidden} alt="hidden" />}
            {thread?.isFavorite && <img src={Favorite} alt="favourite" />}
            {thread?.isAnnouncement && (
                <img src={Announcement} alt="announcement" />
            )}
            {thread?.isLocked && <img src={Locked} alt="locked" />}
            {thread?.isPinned && <img src={Pinned} alt="pinned" />}
        </div>
    )
}

export default ForumsSpecials
