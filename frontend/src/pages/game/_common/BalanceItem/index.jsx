import React, { useEffect } from 'react'
import Numerals from 'numeral'
import { useCountUp } from 'react-countup'

import IcoDollars from 'img/icons/dollar.svg'
import IcoGold from 'img/icons/gold.svg'

import IcoCrypto from 'img/icons/crypto.svg'
import './BalanceItem.scss'

function BalanceItem({
    value,
    currency,
    type,
    showFull,
    inlineBalance,
    showFullInfo,
    countDuration,
}) {
    const intValue = parseInt(`${value}`)
    const val = isNaN(intValue) ? 0 : intValue
    const { countUp, update } = useCountUp({
        start: val,
        end: val,
        duration: countDuration,
    })

    useEffect(() => {
        if (!isNaN(val)) {
            update(val)
        }
    }, [val, update])

    function formatValue(value) {
        if (value < 1000) {
            return value
        }

        return Numerals(value).format('0.0 a', Math.floor)
    }

    return (
        <>
            {inlineBalance && (
                <span className="inline-balance">{`${
                    type === 'money' ? '$' : ''
                }${Numerals(countUp).format('0,0', Math.floor)}${
                    type !== 'money' ? type : ''
                }`}</span>
            )}
            {!inlineBalance && (
                <div
                    className={`balance balance__${currency} balance__${type} ${
                        showFullInfo ? 'balance__show-full-info' : ''
                    }`}
                >
                    {currency === 'money' && <img src={IcoDollars} alt="" />}
                    {currency === 'cash' && <img src={IcoDollars} alt="" />}
                    {currency === 'gold' && <img src={IcoGold} alt="" />}
                    {currency === 'crypto' && <img src={IcoCrypto} alt="" />}
                    <div className="text">
                        {showFullInfo && <h3>{currency}</h3>}
                        <p>
                            {showFull
                                ? Numerals(countUp).format('0,0', Math.floor)
                                : formatValue(countUp)}
                        </p>
                    </div>
                    {!showFull && (
                        <div className="full-balance">
                            {currency === 'money' && (
                                <img src={IcoDollars} alt="" />
                            )}
                            {currency === 'cash' && (
                                <img src={IcoDollars} alt="" />
                            )}
                            {currency === 'gold' && (
                                <img src={IcoGold} alt="" />
                            )}
                            {currency === 'crypto' && (
                                <img src={IcoCrypto} alt="" />
                            )}
                            {Numerals(countUp).format('0,0')}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

BalanceItem.defaultProps = {
    type: 'balance',
}

export default BalanceItem
