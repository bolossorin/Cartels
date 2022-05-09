import React, { useEffect, useState, useRef } from 'react'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import RotateStar from 'img/login/rotating-star-centered-01.svg'
import TopWire from 'img/login/wire-top.svg'
import BehindWire from 'img/login/wire-behind.svg'
import LogoSvg from 'img/CodeOrder_LOGO.svg'
import Sleeve from 'img/login/sleeve.png'
import Thirty from 'img/login/30.svg'
import Tools from 'img/login/TOOLS.svg'
import Discord from 'img/discord.svg'
import Med from 'img/med.png'

import DesktopInfoBox from './DesktopInfoBox.jsx'
import MobileInfoBox from './MobileInfoBox.jsx'

import { getToken, setToken } from '../../utils/auth'

import './NewLoginForm.scss'
import TextPill from '../game/_common/TextPill'

const TEMPORARY_SIGN = {
    text: 'open beta',
}

const INFO_LIST = [
    {
        title: 'Registrations open!',
        text: 'The Open BETA is now open! Register an account to join.',
        image: RotateStar,
    },
    {
        title: 'Community on Discord',
        text:
            'Updates and discussions are posted on the DTM Community Discord server. Everyone is welcome to ask questions and make friends.',
        image: Discord,
        button: {
            link: 'https://discord.gg/5Xe845M',
            text: 'Open Discord',
        },
    },
]

const SIGNUP_MUTATION = gql`
    mutation SignupMutation(
        $email: String!
        $password: String!
        $accessCode: String!
    ) {
        register(email: $email, password: $password, accessCode: $accessCode) {
            token
        }
    }
`

const LOGIN_MUTATION = gql`
    mutation LoginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
        }
    }
`

const EMAIL_WHO_DIS_QUERY = gql`
    query EmailWhoDis($email: String!) {
        newEmailWhoDis(email: $email) {
            state
        }
    }
`

function NewLogin({ history }) {
    const [starEasterEgg, setStarEasterEgg] = useState(0)
    const [email, setEmail] = useState(null)
    const [accessCode, setAccessCode] = useState(null)
    const [infoHover, setInfoHover] = useState(false)
    const [infoSelect, setInfoSelect] = useState(0)
    const [loadWhoDis, { loading, error, data, called }] = useLazyQuery(
        EMAIL_WHO_DIS_QUERY
    )

    const [
        mutateLogin,
        { data: loginData, loading: loginLoading, error: loginError },
    ] = useMutation(LOGIN_MUTATION)

    const [
        mutateRegister,
        { data: registerData, loading: registerLoading, error: registerError },
    ] = useMutation(SIGNUP_MUTATION)

    const operationLoading = loading || loginLoading || registerLoading

    const authError = loginError?.graphQLErrors?.[0]?.message
    const registrationError = registerError?.graphQLErrors?.[0]?.message
    console.log({ authError, registrationError })

    useEffect(() => {
        const token = loginData?.login?.token

        if (token) {
            setToken(token)

            history.push(`/`)
        }
    }, [loginData])

    useEffect(() => {
        const token = registerData?.register?.token

        if (token) {
            setToken(token)

            history.push(`/`)
        }
    }, [registerData])

    useEffect(() => {
        if (typeof registerError === 'object') {
            setEmail(null)
            setAccessCode(null)
        }
    }, [registerError])

    function handleWhoDis(event) {
        const email = event.target[0].value
        const emailWhoDis = loadWhoDis({ variables: { email } })

        setEmail(email)
        setAccessCode('a7db91067f24a55204e4f367864d0e63')

        event.preventDefault()
    }

    function handleAccessCode(event) {
        const accessCode = event.target[0].value

        setAccessCode(accessCode)

        event.preventDefault()
    }

    function handleRegister(event) {
        const password = event.target[0].value

        mutateRegister({
            variables: {
                email,
                password,
                accessCode,
            },
        })

        event.preventDefault()
    }

    function handleLogin(event) {
        const password = event.target[0].value

        mutateLogin({
            variables: {
                email,
                password,
            },
        })

        event.preventDefault()
    }

    function handleStarClick() {
        if (starEasterEgg < 6) {
            setStarEasterEgg(starEasterEgg + 1)
        }
    }

    const emailStatus = data?.newEmailWhoDis?.state
    const isAccessCodeScreen =
        emailStatus === 'UNREGISTERED' && accessCode === null && email !== null
    const isRegisterScreen =
        emailStatus === 'UNREGISTERED' && accessCode !== null && email !== null

    return (
        <div className="new-login">
            <div className="login-header">
                <h1>
                    DownTown{' '}
                    <img
                        src={RotateStar}
                        alt="Spinning star"
                        onClick={handleStarClick}
                        className={`star_${starEasterEgg}`}
                    />{' '}
                    Mafia
                </h1>
                {TEMPORARY_SIGN.text !== '' && (
                    <div
                        className={`special-sign special-sign__${TEMPORARY_SIGN.text
                            .toLowerCase()
                            .trim()
                            .split(/\s+/)
                            .join('-')}`}
                    >
                        <img className="top" src={TopWire}></img>
                        <img className="behind" src={BehindWire}></img>
                        <div className="sign">
                            <p>
                                {starEasterEgg === 6
                                    ? 'Party BETA'
                                    : TEMPORARY_SIGN.text}
                            </p>
                        </div>
                    </div>
                )}
                <div className="shadow"></div>
                <MobileInfoBox infoBoxInfos={INFO_LIST} />
            </div>
            <div className="login-main">
                <DesktopInfoBox infoBoxInfos={INFO_LIST} />
                {(!called || loading || email === null) && (
                    <form onSubmit={handleWhoDis} className="login-form">
                        <div className="input-container">
                            <label htmlFor="email">Email address</label>
                            <input
                                name="email"
                                autoComplete="email"
                                id="email"
                            />
                            {registrationError && (
                                <TextPill style="error">
                                    {registrationError}
                                </TextPill>
                            )}
                        </div>

                        <button disabled={operationLoading}>Continue</button>
                    </form>
                )}
                {emailStatus === 'REGISTERED' && (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-container">
                            <label htmlFor="email">Password</label>
                            <input
                                type="password"
                                name="email"
                                autoComplete="email"
                                id="email"
                            />
                            {authError && (
                                <TextPill style="error">{authError}</TextPill>
                            )}
                        </div>
                        <button disabled={operationLoading}>Login</button>
                    </form>
                )}
                {isAccessCodeScreen && (
                    <form
                        onSubmit={
                            accessCode === null
                                ? handleAccessCode
                                : handleRegister
                        }
                        className="login-form"
                    >
                        <div className="input-container">
                            <label htmlFor="accessCode">
                                Please enter your Access Code
                            </label>
                            <input
                                type={accessCode === null ? 'text' : 'password'}
                                name="access-code"
                                autoComplete="off"
                                id="accessCode"
                            />
                        </div>
                        <button disabled={operationLoading}>Continue</button>
                    </form>
                )}
                {isRegisterScreen && (
                    <form onSubmit={handleRegister} className="login-form">
                        <div className="input-container">
                            <label htmlFor="password">Desired Password</label>
                            <input
                                type="password"
                                name="password"
                                autoComplete="password"
                                id="password"
                            />
                        </div>
                        <button disabled={operationLoading}>Register</button>
                    </form>
                )}
            </div>
            <footer>
                <img src={LogoSvg} height="45" alt="CodeOrder Pty Ltd" />
                <p>
                    Copyright &copy; {new Date().getFullYear()} CodeOrder Pty
                    Ltd.
                    <br />
                    All rights are reserved. ACN 612 016 412.
                </p>
            </footer>
        </div>
    )
}

export default NewLogin
