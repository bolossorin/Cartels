import React from 'react'
import PropTypes from 'prop-types'

import './Rules.scss'

function RulesItems({ rulesList }) {
    return rulesList.map(
        ({ number, name, text, image, type }) => (
            <div key={number} className={`rule rule--${type}`}>
                <div 
                    className="rule-image"
                    style={{
                        background: `url(${image})`,
                    }}
                ></div>
                <div className="rule-text">
                    <h3>{number} {name}</h3>
                    <p>{text}</p>    
                </div>
            </div>
        )
    )
}

RulesItems.propTypes = {
    rulesList: PropTypes.instanceOf(Array).isRequired,
}

export default RulesItems
