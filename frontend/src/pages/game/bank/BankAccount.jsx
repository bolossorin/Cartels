import React, { useState } from 'react'
import { Field, Form, Formik } from 'formik'
import DollarForm from 'img/icons/dollar-form.svg'
import SpinningDollar from 'img/bank/spinning-dollar.gif'
import OneArrow from 'img/bank/one-arrow.svg'
import TwoArrow from 'img/bank/two-arrows.svg'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'

import Button from '../../_common/Button'
import Input from '../../_common/Input'
import Numerals from 'numeral'
import TickManager from '../_common/TickManager'
import { BANK_ACCOUNTS_LIST } from './index'
import { useToast } from '../../game/_common/Toast'

import './Bank.scss'

const INVESTMENT_STRATEGIES = [
    {
        payoutMin: -12,
        payoutMax: 12,
        name: 'mainstream',
    },
    {
        payoutMin: -12,
        payoutMax: 12,
        name: 'risky',
    },
    {
        payoutMin: -12,
        payoutMax: 12,
        name: 'uncharted',
    },
]

const CREATE_ACCOUNT_MUTATION = gql`
    mutation createBankAccount($input: StartBankAccountInput!) {
        startBankAccount(input: $input) {
            id
            cash
        }
    }
`
const WITHDRAW_EARLY_MUTATION = gql`
    mutation withdrawBankAccountEarly($input: withdrawBankAccountEarlyInput!) {
        withdrawBankAccountEarly(input: $input) {
            player {
                id
                cash
            }
            status
            message
        }
    }
`

const CASHOUT_MUTATION = gql`
    mutation cashOutBankAccount($input: cashOutBankAccountInput!) {
        cashOutBankAccount(input: $input) {
            player {
                id
                cash
            }
            status
            message
        }
    }
`

const ROLLOVER_MUTATION = gql`
    mutation rollOverBankAccount($input: rollOverBankAccountInput!) {
        rollOverBankAccount(input: $input) {
            player {
                id
                cash
            }
            status
            message
        }
    }
`

const determineMarket = (amount, result) => {
    const change = (amount + result) / amount
    if (change <= 0.89) {
        return ['Bear Sell-Off', 'very-negative', TwoArrow]
    }
    if (change <= 0.99) {
        return ['Bear Market', 'negative', OneArrow]
    }
    if (change <= 1.01) {
        return ['Flat Market', 'flat', OneArrow]
    }
    if (change <= 1.1) {
        return ['Bull Market', 'positive', OneArrow]
    }

    return ['Raging Bull', 'very-positive', TwoArrow]
}

function BankAccountMarketIndicator({ amount, result }) {
    const [marketName, marketClass, marketImage] = determineMarket(
        amount,
        result
    )

    return (
        <>
            <div
                className={`bank__account__market bank__account__market__${marketClass}`}
            >
                <img src={marketImage} alt={marketName} />
                {marketName}
            </div>
        </>
    )
}

function BankAccount({ accountState, handleRefresh }) {
    const toast = useToast()
    const [selectedStrategy, setSelectedStrategy] = useState(0)
    const [mutateCreate] = useMutation(CREATE_ACCOUNT_MUTATION, {
        refetchQueries: [{ query: BANK_ACCOUNTS_LIST }],
    })
    const [mutateWithdrawEarly] = useMutation(WITHDRAW_EARLY_MUTATION, {
        refetchQueries: [{ query: BANK_ACCOUNTS_LIST }],
    })
    const [mutateCashOut] = useMutation(CASHOUT_MUTATION, {
        refetchQueries: [{ query: BANK_ACCOUNTS_LIST }],
    })
    const [mutateRollOver] = useMutation(ROLLOVER_MUTATION, {
        refetchQueries: [{ query: BANK_ACCOUNTS_LIST }],
    })
    async function handleCreate(input, id) {
        const { data } = await mutateCreate({
            variables: {
                input: {
                    amount: parseInt(input.amount),
                    type: accountState.type,
                    riskiness: INVESTMENT_STRATEGIES[selectedStrategy].name,
                },
            },
            awaitRefetchQueries: true,
        })

        toast.add(
            'success',
            `Bank account`,
            `
You ${
                accountState.type === 'investment' ? 'invested' : 'deposited'
            } $${Numerals(input.amount).format(
                '0,0',
                Math.floor
            )}. It will mature in 23 hours.`
        )
    }
    async function handleWithdrawEarly(id) {
        const { data } = await mutateWithdrawEarly({
            variables: {
                input: {
                    id: id,
                },
            },
            awaitRefetchQueries: true,
        })

        const { message, player, status } = data.withdrawBankAccountEarly

        toast.add(status, `Bank account`, message)
    }

    async function handleCashOut(id) {
        const { data } = await mutateCashOut({
            variables: {
                input: {
                    id: id,
                },
            },
            awaitRefetchQueries: true,
        })

        const { message, player, status } = data.cashOutBankAccount

        toast.add(status, `Bank account`, message)
    }

    async function handleRollOver(id) {
        const { data } = await mutateRollOver({
            variables: {
                input: {
                    id: id,
                },
            },
            awaitRefetchQueries: true,
        })

        const { message, player, status } = data.rollOverBankAccount

        toast.add(status, `Bank account`, message)
    }

    return (
        <>
            {!accountState?.status && (
                <>
                    {accountState?.type === 'investment' && (
                        <div className="investment-strategies">
                            {INVESTMENT_STRATEGIES.map(({ name }, k) => (
                                <Button
                                    styleType="tertiary"
                                    color="blue"
                                    key={k}
                                    className={`strategy strategy--${name} ${
                                        k === selectedStrategy
                                            ? 'strategy--selected'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedStrategy(k)}
                                >
                                    <div />
                                    {name}
                                </Button>
                            ))}
                        </div>
                    )}
                    <span>{`Matures in 23 hours, paying ${
                        accountState?.type === 'investment'
                            ? 'or losing up to 12%'
                            : '2.5%'
                    }`}</span>
                    <div className="bank__account__form">
                        <Formik
                            onSubmit={(input) =>
                                handleCreate(input, accountState?.type)
                            }
                            initialValues={{ amount: '' }}
                        >
                            {(props) => (
                                <Form
                                    name={
                                        accountState?.type === 'investment'
                                            ? 'investment'
                                            : 'savings'
                                    }
                                >
                                    <Field
                                        name="amount"
                                        placeholder="Amount"
                                        image={DollarForm}
                                        component={Input}
                                    />
                                    <Field
                                        component={Button}
                                        styleType="primary"
                                        color={
                                            accountState?.type === 'investment'
                                                ? 'blue'
                                                : 'green'
                                        }
                                        name="saveAmount"
                                    >
                                        {accountState?.type === 'investment'
                                            ? 'Invest'
                                            : 'Save'}
                                    </Field>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </>
            )}
            <>
                {accountState?.status === 'in_progress' && (
                    <>
                        <div className="bank-in-progress">
                            <img
                                src={SpinningDollar}
                                alt="spinning dollar sign"
                                className={
                                    accountState?.type === 'investment'
                                        ? 'blue'
                                        : 'green'
                                }
                            />
                            <div className="bank-in-progress__text">
                                {accountState?.type === 'investment' && (
                                    <div
                                        className={`bank__account__category bank__account__category--${accountState?.riskiness}`}
                                    >
                                        <div />
                                        <p>{accountState?.riskiness}</p>
                                    </div>
                                )}
                                <span className="bank__account__amount">{`$${Numerals(
                                    accountState?.amount
                                ).format('0,0', Math.floor)}`}</span>
                                <p className="bank__account__time">
                                    <TickManager
                                        dateStart={accountState?.dateCreated}
                                        dateEnd={accountState?.dateExpires}
                                        onExpiry={handleRefresh}
                                    >
                                        {({ pretty }) => <>{pretty}</>}
                                    </TickManager>
                                    {` remaining`}
                                </p>
                            </div>
                        </div>
                        <div className="bank__account__form bank__account__form--in-progress">
                            <Formik
                                onSubmit={(input) =>
                                    handleWithdrawEarly(accountState?.id)
                                }
                                initialValues={{}}
                            >
                                {(props) => (
                                    <Form name="withdrawEarly">
                                        <Field
                                            component={Button}
                                            styleType="secondary"
                                            color={
                                                accountState?.type ===
                                                'investment'
                                                    ? 'blue'
                                                    : 'green'
                                            }
                                            name="withdrawEarly"
                                        >
                                            Withdraw early
                                        </Field>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </>
                )}
                {accountState?.status === 'completed' && (
                    <>
                        {accountState?.type === 'investment' && (
                            <div
                                className={`bank__account__category bank__account__category--${accountState?.riskiness}`}
                            >
                                <div />
                                <p>{accountState?.riskiness}</p>
                            </div>
                        )}
                        <span className="bank__account__amount">{`$${Numerals(
                            accountState?.amount
                        ).format('0,0', Math.floor)}`}</span>
                        <p
                            className={`bank__account__result bank__account__result--${
                                accountState?.result <= 0
                                    ? 'negative'
                                    : 'positive'
                            }`}
                        >
                            {`${
                                accountState?.result <= 0 ? '-' : '+'
                            } $${Numerals(
                                Math.abs(accountState?.result)
                            ).format('0,0', Math.floor)} ${
                                accountState?.result <= 0 ? 'loss' : 'profit'
                            } (${
                                Math.round(
                                    (accountState?.result /
                                        accountState?.amount) *
                                        10000
                                ) / 100
                            }%)`}
                        </p>
                        {accountState?.type === 'investment' && (
                            <BankAccountMarketIndicator
                                amount={accountState.amount}
                                result={accountState.result}
                            />
                        )}
                        <div className="bank__account__form bank__account__form--in-progress">
                            <Formik
                                onSubmit={async (input) =>
                                    handleRollOver(accountState?.id)
                                }
                                initialValues={{}}
                            >
                                {(props) => (
                                    <Form name="rollOver">
                                        <Field
                                            component={Button}
                                            styleType="secondary"
                                            color="white"
                                            name="rollOver"
                                        >
                                            Rollover
                                        </Field>
                                    </Form>
                                )}
                            </Formik>
                            <Formik
                                onSubmit={async (input) =>
                                    handleCashOut(accountState?.id)
                                }
                                initialValues={{}}
                            >
                                {(props) => (
                                    <Form name="cashOut">
                                        <Field
                                            component={Button}
                                            styleType="primary"
                                            color={
                                                accountState?.type ===
                                                'investment'
                                                    ? 'blue'
                                                    : 'green'
                                            }
                                            name="cashOut"
                                        >
                                            Cash Out
                                        </Field>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </>
                )}
            </>
        </>
    )
}

export default BankAccount
