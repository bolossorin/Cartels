import React from 'react'
import ProductPills from 'img/inventory/ecstasy.png'
import ProductCoke from 'img/inventory/coke-new.png'
import ProductAcid from 'img/inventory/lsd.png'
import ProductMeth from 'img/inventory/meth.png'
import './LabMarket.scss'
import { Field, Formik } from 'formik'
import NumberInput from '../../_common/TextInput/NumberInput'
import BalanceItem from '../../_common/BalanceItem'
import QuickModify from './QuickModify'


function DrugMarketItem({item}) {


    return (
        <div className="lab-market-item">
            <img
                src={item.image}
                alt={item.name}
            />
            <div className="lab-market-item__control">
                <h3>
                    {item.quantity ?? '0'}
                    x {item.name}{' '}
                    {item.price && (
                        <BalanceItem
                            currency="money"
                            value={
                                item.price
                            }
                            showFull
                            countDuration={0.6}
                        />
                    )}
                </h3>
                <Field
                    name={`${item.name.toLowerCase()}Amount`}
                    placeholder="Amount"
                    hasModifiers={true}
                    component={NumberInput}
                />
                <QuickModify
                    fieldName={`${item.name.toLowerCase()}Amount`}
                    quantity={
                        item.quantity ?? 0
                    }
                />
            </div>
        </div>
    )
}

export default DrugMarketItem
