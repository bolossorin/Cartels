import React, { useState } from 'react'
import PropTypes from 'prop-types'
import HorseBg from 'img/gamble/horses.png'

import './RaceTrack.scss'

function Horses({ horseList, horse, setHorse }) {
    return horseList.map(({ winningRatio, number, name, color }) => (
        <div
            key={winningRatio}
            onClick={() => setHorse(winningRatio)}
            className="horse"
        >
            <div className="rectangle-number">
                <div
                    className="color-rectangle"
                    style={{ backgroundColor: color }}
                />
                <div
                    className="horse-number"
                    style={{
                        background: `linear-gradient(to right, ${color}50 0%, ${color}11 100%), url(${HorseBg})`,
                    }}
                >
                    <p>#{number}</p>
                </div>
            </div>
            <div className="names">
                <p className="horse-name">{name}</p>
            </div>
            <div className="ratio-button">
                <div className="winning-ratio">
                    <p className="text">Winnings ratio</p>
                    <p className="ratio">{winningRatio}:1</p>
                </div>
                <button
                    className={`select-button ${
                        horse === winningRatio ? 'select-button--selected' : ''
                    }`}
                >
                    {horse === winningRatio ? 'Selected' : 'Select'}
                </button>
            </div>
        </div>
    ))
}

Horses.propTypes = {
    horseList: PropTypes.instanceOf(Array).isRequired,
    horse: PropTypes.number,
    setHorse: PropTypes.func.isRequired,
}

export default Horses
