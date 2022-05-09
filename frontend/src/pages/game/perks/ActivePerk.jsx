import React, { useState } from 'react'

import Global from 'assets/images/public/favicon/favicon512.png'
import Image from '../../_common/Image/Image'

import './ActivePerk.scss'
import TickManager from '../_common/TickManager'

function ActivePerk({ perk }) {
    return (
        <>
            <div className={`active-perk`}>
                <Image src={perk?.imageUrl ?? Global} />
                <p className={`active-perk__ticker`}>
                    <TickManager
                        dateStart={perk.startedAt}
                        dateEnd={perk.expiresAt}
                    >
                        {({ pretty }) => <>{pretty}</>}
                    </TickManager>
                </p>
            </div>
        </>
    )
}

export default ActivePerk
