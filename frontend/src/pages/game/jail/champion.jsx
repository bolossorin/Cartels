import React from 'react'
import NameTag from '../_common/NameTag'


const BUST_CHAMPION = {
    player: {
        name: "Robinbad",
        id: 1,
    },
    busts: 26546,
}

function JailChampion() {

    return (
        <div className="jail__champion">
            <NameTag player={BUST_CHAMPION.player} />
            <p className="jail__champion__busts">
                {`${BUST_CHAMPION.busts} Busts`}
            </p>
        </div>
    )
}



export default JailChampion
