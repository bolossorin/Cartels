import { Field, Form, Formik } from 'formik'
import Button from '../../../_common/Button'
import React, { useEffect, useState } from 'react'
import DollarForm from 'img/icons/dollar-form.svg'
import Input from '../../../_common/Input'
import Numerals from 'numeral'
import BalanceItem from '../../_common/BalanceItem'
import { gql } from 'apollo-boost'
import { useMutation } from '@apollo/react-hooks'
import { MY_CREW_QUERY } from './MyCrew'
import { useToast } from '../../_common/Toast'

const CREW_VAULT_DEPOSIT = gql`
    mutation crewVaultDeposit($input: CrewVaultDepositInput!) {
        crewVaultDeposit(input: $input) {
            player {
                id
                cash
            }
            message
        }
    }
`

const CREW_VAULT_WITHDRAW = gql`
    mutation crewVaultWithdraw($input: CrewVaultWithdrawInput!) {
        crewVaultWithdraw(input: $input) {
            player {
                id
                cash
            }
            message
        }
    }
`

function Vault({ canWithdrawVault, vault }) {
    const [mutateDeposit, { loading: depositLoading }] = useMutation(
        CREW_VAULT_DEPOSIT,
        {
            refetchQueries: [{ query: MY_CREW_QUERY }],
        }
    )
    const [mutateWithdraw, { loading: withdrawLoading }] = useMutation(
        CREW_VAULT_WITHDRAW,
        {
            refetchQueries: [{ query: MY_CREW_QUERY }],
        }
    )
    const toast = useToast()

    async function handleDeposit(input) {
        const { data } = await mutateDeposit({
            variables: {
                input: {
                    amount: parseInt(input.amount),
                },
            },
        })

        const { message } = data.crewVaultDeposit

        toast.add('success', `Vault deposit`, message)
    }

    async function handleWithdraw(input) {
        const { data } = await mutateWithdraw({
            variables: {
                input: {
                    amount: parseInt(input.amount),
                },
            },
        })

        const { message } = data.crewVaultWithdraw

        toast.add('success', `Vault withdrawal`, message)
    }

    return (
        <>
            <div className="crew-vault__amount">
                <h2>Balance</h2>
                <BalanceItem currency="money" showFull value={vault} />
            </div>
            <div className="crew-vault content-padding">
                <div className="crew-vault__operation">
                    <h3>Deposit</h3>
                    <Formik
                        onSubmit={(input) => handleDeposit(input)}
                        initialValues={{ amount: '' }}
                    >
                        {(props) => (
                            <Form
                                name="deposit"
                                className="crew-vault__operation__form"
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
                                    color="green"
                                    name="saveAmount"
                                    loading={depositLoading}
                                >
                                    Deposit
                                </Field>
                            </Form>
                        )}
                    </Formik>
                </div>
                {canWithdrawVault && (
                    <div className="crew-vault__operation">
                        <h3>Withdraw</h3>
                        <span>All withdraws are logged</span>
                        <Formik
                            onSubmit={(input) => handleWithdraw(input)}
                            initialValues={{ amount: '' }}
                        >
                            {(props) => (
                                <Form
                                    name="withdraw"
                                    className="crew-vault__operation__form"
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
                                        color="red"
                                        name="saveAmount"
                                        loading={withdrawLoading}
                                    >
                                        Withdraw
                                    </Field>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
            </div>
        </>
    )
}

export default Vault
