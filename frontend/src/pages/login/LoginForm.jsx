import React, { useState } from 'react'
import { Field, Form, Formik } from 'formik'
import User from 'img/login/user.svg'
import Input from '../_common/Input'
import Password from 'img/login/password.svg'
import Checkbox from '../_common/Checkbox'
import Button from '../_common/Button'
import useClickStreamFormMeta from '../../hooks/useClickStreamFormMeta'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { setToken } from '../../utils/auth'
import TextPill from '../game/_common/TextPill'

const LOGIN_MUTATION = gql`
    mutation LoginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`

const LOGIN_STATUS_QUERY = gql`
    query LoginStatus {
        gameStatus {
            isLoginEligible
        }
    }
`

function LoginForm() {
    const [mutateLogin] = useMutation(LOGIN_MUTATION)
    const { data, error } = useQuery(LOGIN_STATUS_QUERY)
    const sendFormMeta = useClickStreamFormMeta()

    const isNotEligible =
        data?.gameStatus?.isLoginEligible === false || error !== undefined

    async function handleLogin(values, actions) {
        sendFormMeta('login')

        let result
        try {
            result = await mutateLogin({
                variables: {
                    email: values.email,
                    password: values.password,
                },
            })

            const token = result?.data?.login?.token

            setToken(token)
            setTimeout(() => {
                document.location = '/home'
            }, 300)
        } catch (e) {
            const isEmailError = e.message.includes('exist')
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                [isEmailError ? 'email' : 'password']: errorMessage,
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
                onSubmit={handleLogin}
            >
                {(props) => (
                    <Form name="login">
                        <Field
                            name="email"
                            placeholder="email@email.com"
                            image={User}
                            component={Input}
                            disabled={isNotEligible}
                        />
                        <Field
                            name="password"
                            placeholder="Password"
                            image={Password}
                            type="password"
                            component={Input}
                            disabled={isNotEligible}
                        />
                        <Field
                            name="rememberMe"
                            component={Checkbox}
                            disabled={isNotEligible}
                        >
                            Remember me
                        </Field>
                        <Field
                            component={Button}
                            styleType="primary"
                            color="blue"
                            name="loginButton"
                            disabled={isNotEligible}
                        >
                            Login to Cartels
                        </Field>
                        {isNotEligible && (
                            <TextPill style="error">
                                Login is currently offline.
                            </TextPill>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default LoginForm
