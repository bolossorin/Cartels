import React, { useState } from 'react'
import './../Crews.scss'
import NoPosterAvatar from 'img/default-avatar.png'
import NameTag from '../../_common/NameTag'
import Button from '../../../_common/Button'
import BalanceItem from '../../_common/BalanceItem'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { crewMemberTieredDesignation, crewNameComplement } from '../crewUtils'
import { MY_CREW_QUERY } from './MyCrew'
import { useToast } from '../../_common/Toast'
import Modal from '../../_common/Modal'
import { useHistory } from 'react-router'

const KICK_MEMBER = gql`
    mutation crewKick($input: CrewKickInput!) {
        crewKick(input: $input) {
            crew {
                id
                name
                crewType
                hierarchy {
                    tier1 {
                        id
                        name
                    }
                }
                members {
                    id
                    name
                    role
                }
            }
            playerName
        }
    }
`

const LEAVE_CREW = gql`
    mutation crewLeave {
        crewLeave {
            player {
                id
                crew {
                    id
                    name
                }
            }
            crewName
            crewType
        }
    }
`

function MemberItem({ canBeKicked, member, tier, crewType, isSelf, canLeave }) {
    const [leaveModal, setLeaveModal] = useState(false)
    const [kickModal, setKickModal] = useState(false)
    const [mutateLeave, { loading: loadingLeave }] = useMutation(LEAVE_CREW)
    const [mutateKick, { loading: loadingKick }] = useMutation(KICK_MEMBER, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })
    const toast = useToast()
    const history = useHistory()

    async function handleLeave() {
        const { data } = await mutateLeave()

        toast.add(
            'success',
            `Left crew`,
            `You successfully left ${
                data.crewLeave.crewName
            }${crewNameComplement(data.crewLeave.crewType)}`
        )
        setLeaveModal(false)
        history.push(`/crews-list`)
    }

    async function handleKick() {
        const { data } = await mutateKick({
            variables: {
                input: {
                    playerId: member?.id,
                },
            },
        })

        toast.add(
            'success',
            `Kicked member`,
            `You successfully kicked ${data.crewKick.playerName}`
        )
        setKickModal(false)
    }

    return (
        <div
            className={`crew-members__member ${
                isSelf ? 'crew-members__member--self' : ''
            }`}
        >
            {canBeKicked && (
                <Modal
                    isOpen={kickModal}
                    noFullScreen
                    className="kick-leave-modal"
                >
                    <p>{`Are you sure you want to kick ${member?.name}?`}</p>
                    <div className="kick-leave-modal__buttons">
                        <Button
                            color="black"
                            styleType="secondary"
                            onClick={() => setKickModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            styleType="primary"
                            onClick={() => handleKick()}
                        >
                            Kick
                        </Button>
                    </div>
                </Modal>
            )}
            {canLeave && isSelf && (
                <Modal
                    isOpen={leaveModal}
                    noFullScreen
                    className="kick-leave-modal"
                >
                    <p>{`Are you sure you want to leave your crew?`}</p>
                    <div className="kick-leave-modal__buttons">
                        <Button
                            color="black"
                            styleType="secondary"
                            onClick={() => setLeaveModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            styleType="primary"
                            onClick={() => handleLeave()}
                        >
                            Leave
                        </Button>
                    </div>
                </Modal>
            )}
            <div className="crew-members__member__profile">
                <div className="crew-members__member__profile__avatar">
                    <img src={NoPosterAvatar} alt={member?.name} />
                </div>
                <div className="crew-members__member__profile__text">
                    <NameTag player={member} />
                    <p className="crew-members__member__profile__text__rank">
                        {member?.rank}
                    </p>
                    <p className="crew-members__member__profile__text__tier">
                        {crewMemberTieredDesignation(crewType, tier)}
                    </p>
                </div>
                {/*{canManage && (*/}
                {/*    <div className="crew-applications__application__applicant__stats">*/}
                {/*        <BalanceItem value={456} currency={'money'} showFull />*/}
                {/*        <p className="crew-applications__application__applicant__stats__damage">*/}
                {/*            30 DMG*/}
                {/*        </p>*/}
                {/*        <p className="crew-applications__application__applicant__stats__defense">*/}
                {/*            30 DEF*/}
                {/*        </p>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>

            <div className="crew-members__member__actions">
                {canBeKicked && (
                    <div className="crew-members__member__actions__buttons">
                        <Button color="red" onClick={() => setKickModal(true)}>
                            Kick
                        </Button>
                    </div>
                )}
                {canLeave && isSelf && (
                    <div className="crew-members__member__actions__buttons">
                        <Button color="red" onClick={() => setLeaveModal(true)}>
                            Leave
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MemberItem
