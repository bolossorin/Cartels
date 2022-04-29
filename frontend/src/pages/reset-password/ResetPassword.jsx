import React, { useEffect } from 'react'
import gql from 'graphql-tag'
import { useParams, Redirect } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/react-hooks'

import '../welcome/NewLoginForm.scss'

const RESET_PASSWORD_TOKEN_QUERY = gql`
    query ResetPasswordTokenQuery($id: ID!, $token: String!) {
        resetPasswordTokenValidity(id: $id, token: $token)
    }
`

const RESET_PASSWORD_TOKEN_MUTATION = gql`
    mutation ResetPasswordTokenMutation($id: ID!, $token: String!, $password: String!) {
        resetPasswordFromToken(id: $id, token: $token, password: $password)
    }
`

function ResetPassword() {
    const { id, token } = useParams();
    const { loading, error, data, refetch } = useQuery(RESET_PASSWORD_TOKEN_QUERY, {
        variables: {
            id,
            token
        }
    })
    const [mutateResetPassword, { data: resetPasswordData, loading: resetPasswordLoading, error: resetPasswordError, called }] = useMutation(
        RESET_PASSWORD_TOKEN_MUTATION
    )
    const validToken = data?.resetPasswordTokenValidity;
    const resetPasswordSuccess = resetPasswordData?.resetPasswordFromToken;
    useEffect(() => {
        if (!loading && (error || !validToken)) {
            alert('That reset password token is invalid. It may have already been used.')
        }
    }, [validToken, loading, error])
    useEffect(() => {
        if (called && !resetPasswordLoading && (resetPasswordError || !resetPasswordSuccess)) {
            alert('We could not reset your password because it appears your token is invalid.')
        }
    }, [resetPasswordData, resetPasswordLoading, resetPasswordError, called])

    function resetPassword(event) {
        const password = event.target[0].value;

        event.preventDefault();

        mutateResetPassword({
            variables: {
                id,
                token,
                password
            }
        })
    }

    if (resetPasswordSuccess) {
        alert('Your password has successfully been reset! You can now login with your new password.');

        return <Redirect to="/welcome" />
    }

    return (
        <>
            <div className="new-login">
                <div className="login-main">
                    <form className="login-form" onSubmit={resetPassword}>
                        <div className="input-container">
                            <label htmlFor="password">Desired Password</label>
                            <input
                                type="password"
                                name="password"
                                autoComplete="password"
                                id="password"
                            />
                        </div>
                        <button disabled={resetPasswordLoading}>Set new password</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ResetPassword;