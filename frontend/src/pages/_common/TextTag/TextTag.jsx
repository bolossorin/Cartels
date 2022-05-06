import React from 'react'
import Text from '../Text/Text'

import './TextTag.scss'

function TextTag({ children }) {
    return (
        <div className={`text-tag`}>
            <Text italic body14>
                {children}
            </Text>
        </div>
    )
}

export default TextTag
