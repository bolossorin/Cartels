import React, { useState } from 'react'

import './ChangelogRow.scss'
import Image from '../../../_common/Image/Image'

function summarizeContent(content) {
    return content.substr(0, 120) + '...'
}

function addNewLines(bio) {
    return bio.replace(/(\r\n|\r|\n)/gm, '<br>')
}

function createMarkup(bio) {
    return {
        __html: addNewLines(bio),
    }
}

function ChangelogRow({ changelog, initialExpansion }) {
    const [expanded, setExpanded] = useState(initialExpansion ?? false)

    function toggleExpansion() {
        setExpanded(!expanded)
    }

    const date = new Date()
    date.setTime(changelog.dateCreated)

    return (
        <>
            <div
                className={`changelog-row changelog-row__${
                    expanded ? 'expanded' : 'condensed'
                }`}
            >
                <div
                    className={`changelog-row__picture`}
                    onClick={toggleExpansion}
                >
                    <Image src={changelog.imageSrc} />
                </div>
                <div className={`changelog-row__content`}>
                    <h3 onClick={toggleExpansion}>{changelog.title}</h3>
                    <div className={`changelog-row__content__meta`}>
                        <div
                            className={`changelog-row__content__meta__type`}
                            style={{
                                backgroundColor: changelog.variantColor,
                            }}
                        >
                            {changelog.variant}
                        </div>
                        <div className={`changelog-row__content__meta__date`}>
                            {date.toLocaleDateString()}
                        </div>
                    </div>
                    <div className={`changelog-row__content__text`}>
                        {expanded ? (
                            <div
                                dangerouslySetInnerHTML={createMarkup(
                                    changelog.content
                                )}
                            />
                        ) : (
                            summarizeContent(changelog.content)
                        )}
                        <button onClick={toggleExpansion}>Read more...</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangelogRow
