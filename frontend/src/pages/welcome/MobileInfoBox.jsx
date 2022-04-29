import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import Arrow from 'img/login/arrow.svg'
import { motion, AnimatePresence } from 'framer-motion'

import './NewLoginForm.scss'

const animateStart = { translateY: '-50%', scaleY: 0, opacity: 0 }
const animateEnd = { translateY: '0px', scaleY: 1, opacity: 1 }

function MobileInfoBox({ infoBoxInfos }) {
    const [toggleMobileInfo, setToggleMobileInfo] = useState(false)
    const [infoHover, setInfoHover] = useState(false)
    const [infoSelect, setInfoSelect] = useState(0)
    let infoBoxTimer
    useEffect(() => {
        startInfoBoxTimer()
    }, [infoSelect, infoHover])

    function handleMobileInfoClick() {
        return setToggleMobileInfo(!toggleMobileInfo)
    }

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

    return (
        <div
            className={`mobile-info ${
                toggleMobileInfo ? 'mobile-info__open' : 'mobile-info__closed'
            }`}
        >
            <div className="mobile-info-wrapper">
                <div
                    className="mobile-info-header"
                    onClick={handleMobileInfoClick}
                >
                    <div className="image-container">
                        <img
                            src={infoBoxInfos[infoSelect].image}
                            alt="News logo"
                        />
                    </div>
                    <div className="title-container">
                        <h3>{infoBoxInfos[infoSelect].title}</h3>
                        <img src={Arrow} alt="Collapse news" />
                    </div>
                </div>
                <AnimatePresence>
                    {toggleMobileInfo && (
                        <motion.div
                            initial={animateStart}
                            animate={animateEnd}
                            exit={animateStart}
                            className={`text-container ${
                                toggleMobileInfo ? 'text-container__open' : ''
                            }`}
                        >
                            <p>{infoBoxInfos[infoSelect].text}</p>
                            {infoBoxInfos[infoSelect]?.button && (
                                <a
                                    href={
                                        infoBoxInfos[infoSelect]?.button?.link
                                    }
                                    target="_blank"
                                >
                                    <button>
                                        {infoBoxInfos[infoSelect]?.button?.text}
                                    </button>
                                </a>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

MobileInfoBox.propTypes = {
    infoBoxInfos: PropTypes.instanceOf(Array).isRequired,
}

export default MobileInfoBox
