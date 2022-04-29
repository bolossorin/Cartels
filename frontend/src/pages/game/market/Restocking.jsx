import React from 'react'
import Image from '../../_common/Image/Image'

import EmptyCrate from 'assets/images/empty-crate.png'

import './Restocking.scss'
import Text from '../../_common/Text/Text'

function Restocking() {
    return (
        <div className={`market-restocking`}>
            <Image src={EmptyCrate} alt={`Empty crate`} />
            <Text accentedHeader24>No items to display!</Text>
            <Text title16 annotationGrey>
                Check back soon for restocking!
            </Text>
        </div>
    )
}

export default Restocking
