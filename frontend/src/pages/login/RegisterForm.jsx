import React from 'react'
import { Field, Form, Formik } from 'formik'
import User from 'img/login/user.svg'
import Input from '../_common/Input'
import Password from 'img/login/password.svg'
import Button from '../_common/Button'
import useClickStreamFormMeta from '../../hooks/useClickStreamFormMeta'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { setToken } from '../../utils/auth'
import { useHistory } from 'react-router'
import TextPill from '../game/_common/TextPill'

const SIGNUP_MUTATION = gql`
    mutation SignupMutation($email: String!, $password: String!) {
        register(email: $email, password: $password) {
            token
        }
    }
`

const SIGNUP_STATUS_QUERY = gql`
    query SignupStatus {
        gameStatus {
            isRegisterEligible
        }
    }
`

function RegisterForm() {
    const history = useHistory()
    const [mutateRegister] = useMutation(SIGNUP_MUTATION)
    const { data, error } = useQuery(SIGNUP_STATUS_QUERY)
    const sendFormMeta = useClickStreamFormMeta()

    const isNotEligible =
        data?.gameStatus?.isRegisterEligible === false || error !== undefined

    async function handleRegister(values, actions) {
        sendFormMeta('register')

        let result
        try {
            result = await mutateRegister({
                variables: {
                    email: values.email,
                    password: values.password,
                },
            })

            const token = result?.data?.register?.token

            setToken(token)
            setTimeout(() => {
                document.location = '/home'
            }, 300)
        } catch (e) {
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                email: errorMessage,
            })
        }

        return result
    }

    return (
        <div className="login__form">
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                }}
                onSubmit={handleRegister}
            >
                {(props) => (
                    <Form name="register">
                        <Field
                            name="email"
                            placeholder="Email address"
                            image={User}
                            component={Input}
                            disabled={isNotEligible}
                        />
                        <Field
                            name="password"
                            placeholder="Desired Password"
                            image={Password}
                            type="password"
                            component={Input}
                            disabled={isNotEligible}
                        />
                        <Field
                            component={Button}
                            styleType="primary"
                            color="white"
                            name="registerButton"
                            disabled={isNotEligible}
                        >
                            Create free account
                        </Field>
                        {isNotEligible && (
                            <TextPill style="error">
                                Register is currently offline.
                            </TextPill>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default RegisterForm
