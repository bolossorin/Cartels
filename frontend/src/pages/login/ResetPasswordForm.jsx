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
    mutation ResetPasswordMutation($email: String!) {
        resetPassword(email: $email) {
            success
            message
        }
    }
`

function ResetPasswordForm() {
    const [mutateResetPassword, { data, called }] = useMutation(LOGIN_MUTATION)
    const sendFormMeta = useClickStreamFormMeta()

    async function handleResetPassword(values, actions) {
        sendFormMeta('reset-password')

        let result
        try {
            result = await mutateResetPassword({
                variables: {
                    email: values.email,
                },
            })
        } catch (e) {
            const errorMessage = e?.graphQLErrors?.[0]?.message

            actions.setErrors({
                email: errorMessage,
            })
        }

        return result
    }

    const success = data?.resetPassword?.success
    const message = data?.resetPassword?.message

    let color = 'blue'
    if (called) {
        color = success ? 'green' : 'red'
    }

    return (
        <div className="login__form">
            <div className={`login__form__guide login__form__guide__${color}`}>
                {message ? (
                    <p>{message}</p>
                ) : (
                    <p>
                        We'll have you back in the action in no time. Enter the
                        email you used to create your account below.
                    </p>
                )}
            </div>
            <Formik
                initialValues={{
                    email: '',
                }}
                onSubmit={handleResetPassword}
            >
                {(props) => (
                    <Form name="reset-password">
                        <Field
                            name="email"
                            placeholder="email@email.com"
                            image={User}
                            component={Input}
                        />
                        <Field
                            component={Button}
                            styleType="primary"
                            color="green"
                            name="loginButton"
                        >
                            Reset Password
                        </Field>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ResetPasswordForm
