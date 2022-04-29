import React, { useState } from 'react'
import './Crews.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { PLAYER_ITEMS_QUERY } from '../left-panel/components/Inventory/InventoryGrid'
import CrewItem from './CrewItem'
import CrewsBackground from 'img/crew/image 13.png'
import { useHistory, useParams } from 'react-router'
import Back from 'img/icons/back.svg'
import { Link } from 'react-router-dom'
import Tabs from './Tabs'
import Bio from './Bio'
import Application from './Application'
import Hierarchy from './Hierarchy'
import Button from '../../_common/Button'
import { crewNameComplement } from './crewUtils'
import { Field, Form, Formik } from 'formik'
import Input from '../../_common/Input'
import Headquarters from 'img/../items/estate/headquarters/ISO_MANSION.png'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import CrewHeadquarters from './CrewHeadquarters'
import { useToast } from '../_common/Toast'
import { BANK_ACCOUNTS_LIST } from '../bank'
import CrewsHeader from './CrewsHeader'

const CREWS_QUERY = gql`
    query crews {
        crews {
            createAvailability
            maximumCrews
            crewsLimitCount
            initialHeadquarters {
                id
                name
                image
                price
                maxMembers
            }
            crews {
                id
                name
            }
        }
        viewer {
            player {
                id
                crew {
                    id
                    name
                    crewType
                }
                cash
            }
        }
    }
`

const CREATE_CREW = gql`
    mutation crewCreate($input: CrewCreateInput!) {
        crewCreate(input: $input) {
            name
            crewType
            id
        }
    }
`

const crewTypes = [
    {
        name: 'Corporation',
        description: 'lorem ipsum',
        image: null,
    },
    {
        name: 'Cartel',
        description: 'lorem ipsum',
        image: null,
    },
    {
        name: 'Gang',
        description: 'lorem ipsum',
        image: null,
    },
]

function CrewCreate() {
    const [selectedCrewType, setSelectedCrewType] = useState(null)
    const history = useHistory()
    const [
        mutateCreateCrew,
        { called, loading: mutationLoading },
    ] = useMutation(CREATE_CREW, { refetchQueries: [{ query: CREWS_QUERY }] })

    const { data } = useQuery(CREWS_QUERY)
    const sendFormMeta = useClickStreamFormMeta()
    const player = data?.viewer?.player
    const crewsList = data?.crews?.crews
    const playerIsInACrew = !!player?.crew
    const maximumCrews = data?.crews?.maximumCrews
    const crewsLimitCount = data?.crews?.crewsLimitCount
    const createAvailability =
        data?.crews?.createAvailability && crewsLimitCount < maximumCrews
    const toast = useToast()

    const headquarters = data?.crews?.initialHeadquarters
    const headquartersId = headquarters?.id

    const canCreateACrew = createAvailability && !playerIsInACrew

    async function handleCreateCrew(values, actions) {
        sendFormMeta('crew-application')

        const name = values.crewName

        const newCrew = await mutateCreateCrew({
            variables: {
                input: {
                    name,
                    crewType: selectedCrewType,
                    headquartersId,
                },
            },
        })

        const data = newCrew?.data?.crewCreate

        await toast.add(
            'success',
            `New Crew`,
            `You successfully created ${data.name}${crewNameComplement(
                data.crewType
            )}!`
        )
        history.push(`/my-crew`)
    }

    return (
        <CrewsHeader title="Create a crew">
            <div className="crew-create">
                {canCreateACrew && (
                    <>
                        <h4>Crew type</h4>
                        {crewTypes.map((crewType) => (
                            <div
                                className={`crew-type ${
                                    crewType.name === selectedCrewType
                                        ? 'crew-type--selected'
                                        : 'crew-type--not-selected'
                                }`}
                                onClick={() =>
                                    setSelectedCrewType(crewType.name)
                                }
                                key={crewType.name}
                            >
                                <div className="crew-type__image">
                                    {crewType.image && (
                                        <img
                                            src={crewType.image}
                                            alt={crewType.name}
                                        />
                                    )}
                                </div>
                                <div className="crew-type__text">
                                    <h5>{crewType.name}</h5>
                                    <p>{crewType.description}</p>
                                </div>
                            </div>
                        ))}
                        {!!selectedCrewType && (
                            <div className="crew-create__form">
                                <Formik
                                    initialValues={{
                                        content: '',
                                    }}
                                    onSubmit={handleCreateCrew}
                                >
                                    <Form name="crew-create">
                                        <label htmlFor="crew-name">
                                            <h4>Crew name</h4>
                                        </label>
                                        <Field
                                            name="crewName"
                                            placeholder="Enter crew name"
                                            component={Input}
                                        />
                                        <p className="crew-create__form__name-complement">
                                            {crewNameComplement(
                                                selectedCrewType
                                            )}
                                        </p>
                                        <CrewHeadquarters
                                            headquarters={headquarters}
                                            crewType={selectedCrewType}
                                        />
                                        <p className="headquarters-notice">
                                            After you create your crew and
                                            gather influence, you will unlock
                                            new headquarters.
                                        </p>
                                        <div className="button-container">
                                            <Field
                                                component={Button}
                                                styleType="primary"
                                                color="blue"
                                                name="createCrew"
                                            >
                                                Start a new crew
                                            </Field>
                                        </div>
                                    </Form>
                                </Formik>
                            </div>
                        )}
                    </>
                )}
                {!createAvailability && (
                    <p>It is not possible to create a crew at this time</p>
                )}
                {playerIsInACrew && createAvailability && (
                    <p>
                        {`You already are in a crew. Leave ${
                            player?.crew.name
                        }${crewNameComplement(
                            player?.crew?.crewType
                        )} if you want to create your own crew.`}
                    </p>
                )}
            </div>
        </CrewsHeader>
    )
}

export default CrewCreate
