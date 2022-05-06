import React, { useState } from 'react'

import './MajorCrimes.scss'
import Arrow from 'img/icons/down-arrow.svg'
import ApplicationItem from '../crews/MyCrew/ApplicationItem'
import PlayerCard from '../players-online/PlayerCard'
import Button from '../../_common/Button'

function MajorCrimeItem({ majorCrime }) {
    const [openParticipants, setOpenParticipants] = useState(false)

    const participants = majorCrime?.positions
    const participantsPlayers = participants
        .map((participant) => participant.player)
        .filter(Boolean)

    console.log({ participantsPlayers })

    return (
        <div className="major-crime">
            <div
                className="major-crime__main"
                onClick={() => setOpenParticipants(!openParticipants)}
            >
                <div className="major-crime__main__side">
                    <h3>{majorCrime.district}</h3>
                </div>
                <div className="major-crime__main__side">
                    <p>
                        {`${participantsPlayers.length}/${participants.length} players`}
                    </p>
                    <img
                        src={Arrow}
                        alt="Down arrow"
                        className={openParticipants ? 'open' : 'closed'}
                    />
                </div>
            </div>
            <div className="major-crime__list">
                {openParticipants && (
                    <>
                        {participants?.map((participant) => (
                            <div
                                className="major-crime__participant"
                                key={participant.id}
                            >
                                <div className="major-crime__participant__position">
                                    <h4>{participant.position}</h4>
                                    <p>{`${participant.selectedCut}%`}</p>
                                </div>
                                {!!participant.player && (
                                    <PlayerCard
                                        playerOnline={participant.player}
                                    />
                                )}
                                {!participant.player && (
                                    <div className="major-crime__participant__button">
                                        <Button
                                            styleType="primary"
                                            color="white"
                                        >
                                            Join
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default MajorCrimeItem
