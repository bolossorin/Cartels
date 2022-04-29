import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'

import './InfoBox.scss'
import Content from "../_common/Content/Content";

function InfoBox({ infoBoxInfos }) {
    const [infoHover, setInfoHover] = useState(false)
    const [infoSelect, setInfoSelect] = useState(0)
    let infoBoxTimer
    useEffect(() => {
        startInfoBoxTimer()
    }, [infoSelect, infoHover])

    function incrementSelect(selectItem = null) {
        clearTimeout(infoBoxTimer)

        if (infoHover && selectItem === null) {
            return
        }

        if (selectItem === null && infoSelect === infoBoxInfos.length - 1) {
            return setInfoSelect(0)
        }

        return setInfoSelect(selectItem ?? infoSelect + 1)
    }

    function startInfoBoxTimer() {
        infoBoxTimer = setTimeout(incrementSelect, 6000)
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
        <Content
            color="game"
            className="infobox"
        >
            <h3>{infoBoxInfos[infoSelect].title}</h3>
            <div className="infobox__images">
                {Array.from({ length: infoBoxInfos.length }, (_, k) => (
                    <img
                        key={k}
                        src={infoBoxInfos[k].image}
                        onClick={() => incrementSelect(k)}
                        className={`infobox__images__image ${
                            k === infoSelect ? 'infobox__images__image--active' : ''
                        }`}
                    />
                ))}
            </div>
            <p
                onMouseEnter={infoBoxMouseEnter}
                onMouseLeave={infoBoxMouseLeave}
                className="infobox__text"
            >
                {infoBoxInfos[infoSelect].text}
            </p>
        </Content>
    )
}


export default InfoBox
