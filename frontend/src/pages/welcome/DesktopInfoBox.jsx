import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'

import './NewLoginForm.scss'

function DesktopInfoBox({ infoBoxInfos }) {
    const [infoHover, setInfoHover] = useState(false)
    const [infoSelect, setInfoSelect] = useState(0)
    let infoBoxTimer
    useEffect(() => {
        startInfoBoxTimer()
    }, [infoSelect, infoHover])

    function incrementSelect(selectItem = null) {
        if (infoHover && selectItem === null) {
            return
        }

        if (selectItem === null && infoSelect === infoBoxInfos.length - 1) {
            return setInfoSelect(0)
        }

        return setInfoSelect(selectItem ?? infoSelect + 1)
    }

    function startInfoBoxTimer() {
        infoBoxTimer = setTimeout(incrementSelect, 12000)
    }

    function infoBoxMouseEnter() {
        setInfoHover(true)
        clearTimeout(infoBoxTimer)
    }

    function infoBoxMouseLeave() {
        setInfoHover(false)
        startInfoBoxTimer()
    }

    return (
        <div
            className="information"
            onMouseEnter={infoBoxMouseEnter}
            onMouseLeave={infoBoxMouseLeave}
        >
            <div className="image">
                <img
                    src={infoBoxInfos[infoSelect].image}
                    alt={infoBoxInfos[infoSelect].title}
                />
                <div className="squares">
                    {Array.from({ length: infoBoxInfos.length }, (_, k) => (
                        <div
                            key={k}
                            onClick={() => incrementSelect(k)}
                            className={`square ${
                                k === infoSelect ? 'square__active' : ''
                            }`}
                        />
                    ))}
                </div>
            </div>
            <div className="text">
                <h3>{infoBoxInfos[infoSelect].title}</h3>
                <p>{infoBoxInfos[infoSelect].text}</p>
                {infoBoxInfos[infoSelect]?.button && (
                    <a
                        href={infoBoxInfos[infoSelect]?.button?.link}
                        target="_blank"
                    >
                        <button>
                            {infoBoxInfos[infoSelect]?.button?.text}
                        </button>
                    </a>
                )}
            </div>
        </div>
    )
}

DesktopInfoBox.propTypes = {
    infoBoxInfos: PropTypes.instanceOf(Array).isRequired,
}

export default DesktopInfoBox
