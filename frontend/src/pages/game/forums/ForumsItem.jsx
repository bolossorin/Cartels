import React from 'react'
import { Link } from 'react-router-dom'

import './Forums.scss'
import Content from '../../_common/Content/Content'
import ForumsSpecials from './ForumSpecials'
import { prettyDate } from '../../../utils/prettyDate'

function ForumsItem({
    url,
    name,
    dateCreated,
    dateUpdated,
    thread,
    newMessages,
    stat,
    description,
    dateReplied,
}) {
    return (
        <Link
            to={url}
            className={`forums-item ${
                newMessages ? 'forums-item--new-messages' : ''
            }`}
        >
            <div className="forums-item__top">
                <h3>{name}</h3>
                <div className="messages">{stat ?? ''}</div>
            </div>
            <div className="forums-item__bottom">
                {description ? (
                    <p>{description}</p>
                ) : (
                    <>
                        {dateCreated && (
                            <p>
                                Created {prettyDate(dateCreated)}{' '}
                                {dateCreated !== dateUpdated && (
                                    <>(last reply {prettyDate(dateReplied)})</>
                                )}
                            </p>
                        )}
                    </>
                )}
                {thread && <ForumsSpecials thread={thread} />}
            </div>
        </Link>
    )
}

export default ForumsItem
