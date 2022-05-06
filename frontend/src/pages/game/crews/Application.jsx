import React from 'react'
import './Crews.scss'
import { Link } from 'react-router-dom'
import { crewNameComplement } from './crewUtils'
import Button from '../../_common/Button'
import { Field, Form, Formik } from 'formik'
import Locked from 'img/forums/locked.svg'
import Textarea from '../../_common/Textarea'
import SendMessage from 'img/forums/send-message.svg'
import Input from '../../_common/Input'
import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import useClickStreamFormMeta from '../../../hooks/useClickStreamFormMeta'
import { useToast } from '../_common/Toast'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                crew {
                    id
                }
            }
        }
    }
`

const POST_APPLICATION = gql`
    mutation postApplication($input: PostApplicationInput!) {
        postApplication(input: $input) {
            id
            name
            applications
            applicationQuestions
            selfApplication
        }
    }
`

function Application({ crew }) {
    const { data, loading } = useQuery(VIEWER_QUERY)
    const player = data?.viewer?.player
    const sendFormMeta = useClickStreamFormMeta()
    const [
        mutatePostApplication,
        { called, loading: mutationLoading },
    ] = useMutation(POST_APPLICATION)
    const toast = useToast()

    const isInThisCrew = crew?.id === player?.crew?.id && !!player?.crew?.id
    const isInCrew = !!player?.crew?.id
    const canSubmitApplications =
        crew?.applications && !isInCrew && !crew?.selfApplication

    const recentlyApplied = called && !mutationLoading

    async function handlePostApplication(values, actions) {
        sendFormMeta('crew-application')

        const replies = values

        const questionsWithReplies = crew?.applicationQuestions.map(
            (question, k) => ({
                question: question,
                answer: replies?.[`question_${k}`],
            })
        )

        const crewId = crew?.id
        const playerId = player?.id
        const answers = questionsWithReplies

        await mutatePostApplication({
            variables: {
                input: {
                    crewId,
                    answers,
                },
            },
        })

        await toast.add(
            'success',
            `Application`,
            `You successfully applied to ${crew?.name}${crewNameComplement(
                crew?.crewType
            )}!`
        )
    }

    return (
        <div className="crew-application">
            {!crew?.applications && (
                <span>Applications are not accepted at this time</span>
            )}
            {isInThisCrew && <span>You already are in this crew</span>}
            {crew?.selfApplication && !recentlyApplied && (
                <span>
                    Your application is being considered by crew recruiters.
                </span>
            )}
            {recentlyApplied && (
                <span>
                    Your application has been sent and you will be notified of
                    the result.
                </span>
            )}
            {isInCrew && !isInThisCrew && (
                <span>
                    You are already in another crew. Leave your current crew to
                    apply
                </span>
            )}
            {canSubmitApplications && (
                <Formik
                    initialValues={{
                        content: '',
                    }}
                    onSubmit={handlePostApplication}
                >
                    {(props) => (
                        <Form name="crew-application">
                            {crew?.applicationQuestions.map((question, k) => (
                                <div className="question" key={k}>
                                    <label htmlFor={`question_${k}`}>
                                        {question}
                                    </label>
                                    <Field
                                        name={`question_${k}`}
                                        placeholder="Your answer"
                                        component={Input}
                                    />
                                </div>
                            ))}
                            <div className="button-container">
                                <Field
                                    component={Button}
                                    styleType="primary"
                                    color="white"
                                    name="postApplication"
                                >
                                    Submit Application
                                </Field>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
    )
}

export default Application
