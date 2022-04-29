import React, { useState } from 'react'
import './../Crews.scss'
import NoPosterAvatar from 'img/default-avatar.png'
import ThumbDown from 'img/icons/thumb-down.svg'
import ThumbUp from 'img/icons/thumb-up.svg'
import NameTag from '../../_common/NameTag'
import Button from '../../../_common/Button'
import BalanceItem from '../../_common/BalanceItem'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { crewNameComplement } from '../crewUtils'
import { MY_CREW_QUERY } from './MyCrew'
import { useToast } from '../../_common/Toast'

const APPLICATION_VOTE = gql`
    mutation applicationVote($input: ApplicationVoteInput!) {
        applicationVote(input: $input) {
            id
            votes {
                yes {
                    id
                }
                no {
                    id
                }
            }
        }
    }
`

const APPLICATION_ACCEPT = gql`
    mutation applicationAccept($input: ApplicationAcceptInput!) {
        applicationAccept(input: $input) {
            id
        }
    }
`

const APPLICATION_DECLINE = gql`
    mutation applicationDecline($input: ApplicationDeclineInput!) {
        applicationDecline(input: $input) {
            id
        }
    }
`

function ApplicationItem({ application, isFull, canManage }) {
    const [expandedVotes, setExpandedVotes] = useState(false)
    const yesVotes = application?.votes?.yes
    const noVotes = application?.votes?.no
    const hasVotedYes = application?.votes?.hasVotedYes
    const hasVotedNo = application?.votes?.hasVotedNo
    const toast = useToast()

    const [mutateApplicationVote] = useMutation(APPLICATION_VOTE, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })

    const [mutateApplicationAccept] = useMutation(APPLICATION_ACCEPT, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })

    const [mutateApplicationDecline] = useMutation(APPLICATION_DECLINE, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })

    async function handleVote(vote) {
        const crew = await mutateApplicationVote({
            variables: {
                input: {
                    applicationId: application.id,
                    vote: vote,
                },
            },
        })

        const data = crew?.data
    }

    async function handleAccept() {
        const crew = await mutateApplicationAccept({
            variables: {
                input: {
                    applicationId: application.id,
                },
            },
        })

        const data = crew?.data

        await toast.add(
            'success',
            `Application`,
            `You accepted ${application?.applicant?.name}'s application!`
        )
    }

    async function handleDecline() {
        const crew = await mutateApplicationDecline({
            variables: {
                input: {
                    applicationId: application.id,
                },
            },
        })

        const data = crew?.data

        await toast.add(
            'success',
            `Application`,
            `You declined ${application?.applicant?.name}'s application!`
        )
    }

    return (
        <div className="crew-applications__application">
            <div className="crew-applications__application__applicant">
                <div className="crew-applications__application__applicant__avatar">
                    <img
                        src={NoPosterAvatar}
                        alt={application?.applicant?.name}
                    />
                </div>
                <div className="crew-applications__application__applicant__text">
                    <NameTag player={application?.applicant} />
                    <p className="crew-applications__application__applicant__text__rank">
                        {application?.applicant?.rank}
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
            <div className="crew-applications__application__answers">
                {application?.answers.map((answer) => (
                    <div
                        className="crew-applications__application__answers__answer"
                        key={application?.answers.question}
                    >
                        <h5>{answer.question}</h5>
                        <p>{answer.answer}</p>
                    </div>
                ))}
            </div>
            <div className="crew-applications__application__actions">
                <div
                    className={`crew-applications__application__actions__thumbs`}
                >
                    <div
                        className={`crew-applications__application__actions__thumbs__up ${
                            hasVotedYes
                                ? 'crew-applications__application__actions__thumbs__up--has-voted'
                                : ''
                        }`}
                    >
                        <img
                            src={ThumbUp}
                            alt="thumb up"
                            onClick={() => handleVote('yes')}
                        />
                        <span>
                            {yesVotes.length > 0 ? yesVotes.length : ''}
                        </span>
                    </div>
                    <div
                        className={`crew-applications__application__actions__thumbs__down ${
                            hasVotedNo
                                ? 'crew-applications__application__actions__thumbs__down--has-voted'
                                : ''
                        }`}
                    >
                        <img
                            src={ThumbDown}
                            alt="thumb down"
                            onClick={() => handleVote('no')}
                        />
                        <span>{noVotes.length > 0 ? noVotes.length : ''}</span>
                    </div>
                </div>
                {canManage && (
                    <div className="crew-applications__application__actions__buttons">
                        <Button color="red" onClick={() => handleDecline()}>
                            Decline
                        </Button>
                        <Button
                            disabled={isFull}
                            color="green"
                            onClick={() => handleAccept()}
                        >
                            Accept
                        </Button>
                    </div>
                )}
            </div>
            {(yesVotes.length > 0 || noVotes.length > 0) && (
                <div className="crew-applications__application__votes">
                    <h5 onClick={() => setExpandedVotes(!expandedVotes)}>
                        {expandedVotes ? 'Hide votes' : 'Expand votes'}
                    </h5>
                    {expandedVotes && (
                        <>
                            <h6>For:</h6>
                            {yesVotes.length > 0 && (
                                <p>
                                    {yesVotes.map((vote, k) => (
                                        <>
                                            <span>{vote.name}</span>
                                            {k + 1 < yesVotes.length
                                                ? ', '
                                                : ''}
                                        </>
                                    ))}
                                </p>
                            )}
                            {yesVotes.length === 0 && <p>No one</p>}
                            <h6>Against:</h6>
                            {noVotes.length > 0 && (
                                <p>
                                    {noVotes.map((vote, k) => (
                                        <>
                                            <span>{vote.name}</span>
                                            {k + 1 < noVotes.length ? ', ' : ''}
                                        </>
                                    ))}
                                </p>
                            )}
                            {noVotes.length === 0 && <p>No one</p>}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default ApplicationItem
