import React, { useEffect, useState } from 'react'
import BankBackground from 'img/bank/bank-background.png'

import './Bank.scss'
import Masthead from '../../_common/Masthead/Masthead'
import Content from '../../_common/Content/Content'
import BankAccount from './BankAccount'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import useEvent from '../../../hooks/useEvent'
import PercentBar from '../_common/PercentBar'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'

const SAVINGS_NULL = {
    status: null,
    type: 'savings',
}

const INVESTMENT_NULL = {
    status: null,
    type: 'investment',
}

export const BANK_ACCOUNTS_LIST = gql`
    query BankAccounts {
        bankAccounts {
            id
            type
            riskiness
            amount
            result
            status
            dateExpires
            dateCreated
        }
    }
`

function Bank() {
    const triggerEvent = useEvent()
    const [savingsInfo, setSavingsInfo] = useState(false)
    const [investmentInfo, setInvestmentInfo] = useState(false)

    const { data, refetch } = useQuery(BANK_ACCOUNTS_LIST, {
        fetchPolicy: 'cache-and-network',
    })

    const savingsAccounts = data?.bankAccounts?.filter(
        (account) => account.type === 'savings'
    )
    const displayedSavings =
        savingsAccounts?.filter(
            (account) => account.status !== 'redeemed'
        )?.[0] ?? SAVINGS_NULL
    const investmentAccounts = data?.bankAccounts?.filter(
        (account) => account.type === 'investment'
    )
    const displayedInvestment =
        investmentAccounts?.filter(
            (account) => account.status !== 'redeemed'
        )?.[0] ?? INVESTMENT_NULL

    const handleToggleSavings = (event) => {
        event.preventDefault()
        setSavingsInfo(!savingsInfo)

        triggerEvent({
            name: 'BANK_TOGGLE_MORE_DETAILS',
            details: {
                account: 'savings',
            },
        })
    }

    const handleToggleInvestments = (event) => {
        event.preventDefault()
        setInvestmentInfo(!investmentInfo)

        triggerEvent({
            name: 'BANK_TOGGLE_MORE_DETAILS',
            details: {
                account: 'investments',
            },
        })
    }

    return (
        <Content className="bank" color="game">
            <Masthead fullWidth>Bank</Masthead>
            <img className="background" src={BankBackground} alt="Bank" />
            <div className="bank__account bank__account--savings">
                {displayedSavings ? (
                    <>
                        <h3>{`Savings account ${
                            savingsAccounts?.status === 'completed'
                                ? '(matured)'
                                : ''
                        }`}</h3>
                        <div
                            className="more-details"
                            onClick={handleToggleSavings}
                        >
                            More details
                        </div>
                        <BankAccount
                            accountState={displayedSavings}
                            handleRefresh={() => setTimeout(() => refetch(), 0)}
                        />
                        <p
                            className={`bank__account__details ${
                                savingsInfo
                                    ? ''
                                    : 'bank__account__details--hidden'
                            }`}
                        >
                            <br />
                            A Savings Account provides a risk-free way for your
                            money to work for you.
                            <br />
                            <br />
                            A deposit takes 23 hours to mature at which point
                            you will be paid 2.5% in interest.
                            <br />
                            <br />
                            Withdrawing early attracts a bank fee of 1% of your
                            deposit. You cannot withdraw within 5 minutes of
                            maturation.
                            <br />
                            <br />
                            The maximum deposit amount is $25M, the minimum is
                            $100.
                        </p>
                    </>
                ) : (
                    <IntegratedLoader />
                )}
            </div>
            <div className="bank__account bank__account--investment">
                {displayedInvestment ? (
                    <>
                        <h3>{`Investment account ${
                            displayedInvestment?.status === 'completed'
                                ? '(matured)'
                                : ''
                        }`}</h3>
                        <div
                            className="more-details"
                            onClick={handleToggleInvestments}
                        >
                            More details
                        </div>
                        <BankAccount
                            accountState={displayedInvestment}
                            handleRefresh={() => setTimeout(() => refetch(), 0)}
                        />
                        <p
                            className={`bank__account__details ${
                                investmentInfo
                                    ? ''
                                    : 'bank__account__details--hidden'
                            }`}
                        >
                            <br />
                            An Investment Account provides exposure to turbulent
                            markets for your ill-gotten gains. Given the nature
                            of markets, it's possible to lose big and win big.
                            <br />
                            <br />
                            A deposit takes 23 hours to mature at which point
                            you will be paid profits according to market
                            conditions. It's possible to lose up to 12% while
                            also being possible to profit up to 12%.
                            <br />
                            <br />
                            Withdrawing early attracts a bank fee of 1% of your
                            investment. You cannot withdraw within 5 minutes of
                            maturation.
                            <br />
                            <br />
                            The maximum investment amount is $25M, the minimum
                            is $100.
                        </p>
                    </>
                ) : (
                    <IntegratedLoader />
                )}
            </div>
        </Content>
    )
}

export default Bank
