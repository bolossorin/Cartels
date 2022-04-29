import React, { useEffect, useState } from 'react'
import './../Crews.scss'
import ApplicationItem from './ApplicationItem'
import Button from '../../../_common/Button'
import Textarea from '../../../_common/Textarea'
import { Field, Form, Formik } from 'formik'
import Locked from 'img/forums/locked.svg'
import SendMessage from 'img/forums/send-message.svg'
import { gql } from 'apollo-boost'
import { crewNameComplement } from '../crewUtils'
import useClickStreamFormMeta from '../../../../hooks/useClickStreamFormMeta'
import { useToast } from '../../_common/Toast'
import { useMutation } from '@apollo/react-hooks'
import Input from '../../../_common/Input'
import { MY_CREW_QUERY } from './MyCrew'
import SlideCheck from '../../../_common/SlideCheck'

const EDIT_BIO = gql`
    mutation crewBioEdit($input: CrewBioEditInput!) {
        crewBioEdit(input: $input) {
            id
            bio
        }
    }
`

const EDIT_QUESTIONS = gql`
    mutation crewQuestionsEdit($input: CrewQuestionsEditInput!) {
        crewQuestionsEdit(input: $input) {
            id
            applicationQuestions
        }
    }
`

const SWITCH_APPLICATIONS = gql`
    mutation crewApplicationsSwitch($input: CrewApplicationsSwitchInput!) {
        crewApplicationsSwitch(input: $input) {
            id
            applications
        }
    }
`

function CrewSettings({ canManageSettings, isFull, crew }) {
    const sendFormMeta = useClickStreamFormMeta()
    const toast = useToast()
    const [mutateEditBio] = useMutation(EDIT_BIO)
    const [mutateEditQuestions] = useMutation(EDIT_QUESTIONS, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })
    const [mutateApplicationsSwitch] = useMutation(SWITCH_APPLICATIONS, {
        refetchQueries: [{ query: MY_CREW_QUERY }],
    })
    const [questions, setQuestions] = useState(crew?.applicationQuestions)
    const [applicationsSwitch, setApplicationsSwitch] = useState(
        crew?.applications
    )
    const addDisabled = questions?.length >= 5

    useEffect(() => {
        setQuestions(crew?.applicationQuestions)
        if (crew?.applicationQuestions?.length < 1) {
            setQuestions([...crew?.applicationQuestions, ''])
        }
    }, [crew?.applicationQuestions])

    useEffect(() => {
        setApplicationsSwitch(crew?.applications)
    }, [crew])

    function handleAddQuestion(event) {
        setQuestions([...questions, ''])
        event.preventDefault()
    }

    async function handleEditBio(values, actions) {
        sendFormMeta('crewBio')

        const bio = values?.content

        await mutateEditBio({
            variables: {
                input: {
                    bio,
                },
            },
        })

        await toast.add(
            'success',
            `Crew bio`,
            `You successfully edit your Crew's bio.`
        )
    }

    async function handleEditQuestions(values) {
        sendFormMeta('applicationQuestions')

        const questionsInput = Object.values(values)

        const filteredQuestions = questionsInput.filter(Boolean)

        await mutateEditQuestions({
            variables: {
                input: {
                    questions: filteredQuestions,
                },
            },
        })

        await toast.add(
            'success',
            `Application questions`,
            `You successfully edited the application's questions.`
        )
    }

    async function handleApplicationsSwitch() {
        await mutateApplicationsSwitch({
            variables: {
                input: {
                    applicationsSwitch: !applicationsSwitch,
                },
            },
        })
    }

    console.log(isFull)

    return (
        <div className="crew-settings content-padding">
            <h4>Crew's bio</h4>
            <Formik
                initialValues={{
                    content: crew?.bio,
                }}
                onSubmit={handleEditBio}
            >
                {(props) => (
                    <Form name="crewBio" className="crew-settings__bio">
                        <Field
                            name="content"
                            placeholder={`Type the Crew's bio here`}
                            defaultValue={crew?.bio}
                            component={Textarea}
                            disabled={!canManageSettings}
                        />
                        <div className="button-container">
                            <Field
                                component={Button}
                                styleType="primary"
                                color="blue"
                                name="editCrewBio"
                                disabled={!canManageSettings}
                                type="submit"
                            >
                                Edit Bio
                            </Field>
                        </div>
                    </Form>
                )}
            </Formik>
            <SlideCheck
                className={`crew-settings__applications-switch`}
                disabled={!canManageSettings || isFull}
                label="Allow applications to crew"
                checked={applicationsSwitch}
                onChange={(e) => {
                    handleApplicationsSwitch()
                    e.stopPropagation()
                }}
                name={'applicationSwitch'}
            />
            <h4>Application questions</h4>
            <Formik
                initialValues={{
                    question_0: crew?.applicationQuestions?.[0],
                    question_1: crew?.applicationQuestions?.[1],
                    question_2: crew?.applicationQuestions?.[2],
                    question_3: crew?.applicationQuestions?.[3],
                    question_4: crew?.applicationQuestions?.[4],
                }}
                onSubmit={handleEditQuestions}
            >
                {(props) => (
                    <Form
                        name="applicationQuestions"
                        className="crew-settings__application-questions"
                    >
                        {questions?.map((question, k) => (
                            <div className="question" key={k}>
                                <label htmlFor={`question_${k}`}>
                                    {`Question ${k + 1}:`}
                                </label>
                                <Field
                                    name={`question_${k}`}
                                    placeholder="E.g. Why do you want to join?"
                                    component={Input}
                                    disabled={!canManageSettings}
                                />
                            </div>
                        ))}
                        <div className="button-container">
                            <Button
                                styleType="primary"
                                color="white"
                                disabled={addDisabled || !canManageSettings}
                                onClick={handleAddQuestion}
                                type="button"
                            >
                                Add a question
                            </Button>
                            <Field
                                component={Button}
                                styleType="primary"
                                color="green"
                                name="EditApplicationQuestions"
                                disabled={!canManageSettings}
                                type="submit"
                            >
                                Edit questions
                            </Field>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default CrewSettings
