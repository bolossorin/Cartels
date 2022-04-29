import React, { useEffect, useState } from 'react'
import './../Crews.scss'
import './HierarchySelect.scss'
import { Link } from 'react-router-dom'
import { crewMemberTieredDesignation, crewNameComplement } from '../crewUtils'
import Button from '../../../_common/Button'
import Select from 'react-select'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MY_CREW_QUERY } from './MyCrew'
import { useToast } from '../../_common/Toast'

const SET_TIER_1 = gql`
    mutation crewEditTier1($input: CrewEditTier1Input!) {
        crewEditTier1(input: $input) {
            id
            name
            crewType
            hierarchy {
                tier1 {
                    id
                    name
                }
            }
        }
    }
`

const SET_TIER_2 = gql`
    mutation crewEditTier2($input: CrewEditTier2Input!) {
        crewEditTier2(input: $input) {
            id
            name
            crewType
            hierarchy {
                tier2 {
                    id
                    name
                }
            }
        }
    }
`

const SET_TIER_3 = gql`
    mutation crewEditTier3($input: CrewEditTier3Input!) {
        crewEditTier3(input: $input) {
            id
            name
            crewType
            hierarchy {
                tier3 {
                    id
                    name
                }
            }
        }
    }
`

function HierarchyForms({
    allMembers,
    hierarchy,
    crewType,
    canSetTier1,
    canSetTier2,
    canSetTier3,
}) {
    const [tier1, setTier1] = useState({
        value: hierarchy?.tier1,
        label: hierarchy?.tier1?.name,
    })
    const [tier2, setTier2] = useState([
        {
            value: hierarchy?.tier2,
            label: hierarchy?.tier2?.name,
        },
    ])
    const [tier3, setTier3] = useState(
        hierarchy?.tier3?.filter(Boolean).map((member) => ({
            value: member,
            label: member?.name,
        }))
    )
    const toast = useToast()

    useEffect(() => {
        setTier1({ value: hierarchy?.tier1, label: hierarchy?.tier1?.name })
        setTier3(
            hierarchy?.tier3?.filter(Boolean).map((member) => ({
                value: member,
                label: member?.name,
            }))
        )
    }, [hierarchy?.tier1, hierarchy?.tier3])

    useEffect(() => {
        setTier2(
            hierarchy?.tier2?.length > 0 || hierarchy?.tier2 !== null
                ? [{ value: hierarchy?.tier2, label: hierarchy?.tier2?.name }]
                : null
        )
    }, [hierarchy?.tier2])

    const [mutateSetTier1, { loading: loadingTier1 }] = useMutation(
        SET_TIER_1,
        {
            refetchQueries: [{ query: MY_CREW_QUERY }],
        }
    )

    const [mutateSetTier2, { loading: loadingTier2 }] = useMutation(
        SET_TIER_2,
        {
            refetchQueries: [{ query: MY_CREW_QUERY }],
        }
    )

    const [mutateSetTier3, { loading: loadingTier3 }] = useMutation(
        SET_TIER_3,
        {
            refetchQueries: [{ query: MY_CREW_QUERY }],
        }
    )

    const index = allMembers
        ?.map((member) => member.id)
        .indexOf(tier1?.value?.id)
    if (index > -1) {
        allMembers?.splice(index, 1)
    }

    const options = allMembers?.map((member) => ({
        value: member,
        label: member?.name,
    }))

    async function handleSetTier1() {
        const crew = await mutateSetTier1({
            variables: {
                input: {
                    playerId: tier1.value.id,
                },
            },
        })

        const data = crew?.data?.crewEditTier1

        await toast.add(
            'success',
            `Leadership Change`,
            `You successfully changed ${data.name}${crewNameComplement(
                data.crewType
            )}'s ${crewMemberTieredDesignation(data.crewType, 1)} to ${
                data.hierarchy.tier1 ? data.hierarchy.tier1.name : 'none'
            }!`
        )
    }

    async function handleSetTier2() {
        const playerId = tier2.length > 0 ? tier2[0].value.id : null
        const crew = await mutateSetTier2({
            variables: {
                input: {
                    playerId: playerId,
                },
            },
        })

        const data = crew?.data?.crewEditTier2

        await toast.add(
            'success',
            `Leadership Change`,
            `You successfully changed ${data.name}${crewNameComplement(
                data.crewType
            )}'s ${crewMemberTieredDesignation(data.crewType, 2)} to ${
                data.hierarchy.tier2 ? data.hierarchy.tier2.name : 'none'
            }!`
        )
    }

    async function handleSetTier3() {
        const playersId = tier3.map((playerTier3) => playerTier3.value.id)
        const crew = await mutateSetTier3({
            variables: {
                input: {
                    playersId: playersId,
                },
            },
        })

        const data = crew?.data?.crewEditTier3

        const newLeaders = await data.hierarchy.tier3.filter(Boolean)

        const leadersString = await newLeaders.map(
            (newLeader) => ` ${newLeader.name}`
        )

        await toast.add(
            'success',
            `Leadership Change`,
            `You successfully changed ${data.name}${crewNameComplement(
                data.crewType
            )}'s ${crewMemberTieredDesignation(data.crewType, 3)}${
                newLeaders.length > 1 ? 's' : ''
            } to${newLeaders.length > 0 ? leadersString : ' none'}!`
        )
    }

    return (
        <div className={`crew-hierarchy__forms`}>
            {canSetTier1 && (
                <div className="crew-hierarchy__forms__tier" key="tier1">
                    <h4>{crewMemberTieredDesignation(crewType, 1)}</h4>
                    <div className="crew-hierarchy__forms__tier__select">
                        <Select
                            className="crew-hierarchy-select-container"
                            classNamePrefix="crew-hierarchy-select"
                            options={options}
                            value={tier1}
                            onChange={(v) => setTier1(v)}
                        />
                    </div>
                    <div className="crew-hierarchy__forms__tier__button">
                        <Button
                            styleType="primary"
                            color="white"
                            onClick={() => handleSetTier1()}
                            loading={loadingTier1}
                        >
                            {`Set ${crewMemberTieredDesignation(crewType, 1)}`}
                        </Button>
                    </div>
                </div>
            )}
            {canSetTier2 && (
                <div className="crew-hierarchy__forms__tier" key="tier2">
                    <h4>{crewMemberTieredDesignation(crewType, 2)}</h4>
                    <div className="crew-hierarchy__forms__tier__select">
                        <Select
                            className="crew-hierarchy-select-container"
                            classNamePrefix="crew-hierarchy-select"
                            options={options}
                            value={tier2}
                            isMulti
                            onChange={(v) =>
                                v.length < 2 ? setTier2(v) : null
                            }
                        />
                    </div>
                    <div className="crew-hierarchy__forms__tier__button">
                        <Button
                            styleType="primary"
                            color="white"
                            onClick={() => handleSetTier2()}
                            loading={loadingTier2}
                        >
                            {`Set ${crewMemberTieredDesignation(crewType, 2)}`}
                        </Button>
                    </div>
                </div>
            )}
            {canSetTier3 && (
                <div className="crew-hierarchy__forms__tier" key="tier3">
                    <h4>{crewMemberTieredDesignation(crewType, 3)}</h4>
                    <div className="crew-hierarchy__forms__tier__select">
                        <Select
                            isMulti
                            className="crew-hierarchy-select-container"
                            classNamePrefix="crew-hierarchy-select"
                            options={options}
                            value={tier3}
                            onChange={(v) =>
                                v.length < 4 ? setTier3(v) : null
                            }
                        />
                    </div>
                    <div className="crew-hierarchy__forms__tier__button">
                        <Button
                            styleType="primary"
                            color="white"
                            onClick={() => handleSetTier3()}
                            loading={loadingTier3}
                        >
                            {`Set ${crewMemberTieredDesignation(crewType, 3)}`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HierarchyForms
