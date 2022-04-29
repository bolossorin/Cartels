import Button from '../../_common/Button'
import MajorCrimeItem from './MajorCrimeItem'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import Percent from 'img/icons/percent.svg'
import Input from '../../_common/Input'
import SlideCheck from '../../_common/SlideCheck'

function MajorCrimesCreate({ selectedLocation }) {
    const [advertisePubliclySwitch, setAdvertisePubliclySwitch] = useState(true)
    const validate = (
        values,
        props /* only available when using withFormik */
    ) => {
        const errors = {}

        const sumValues = (values) =>
            Object.values(values).reduce((a, b) => a + b)

        if (sumValues !== 100) {
        }

        return errors
    }

    return (
        <div className="major-crimes__create content-padding">
            <h3>{`Create a ${selectedLocation.name} job`}</h3>
            <Formik
                onSubmit={{}}
                initialValues={{ amount: '' }}
                validate={validate}
            >
                {(props) => (
                    <Form name="deposit" className="major-crimes__create__form">
                        <div className="major-crimes__create__box">
                            <h4>Loot</h4>

                            {selectedLocation.positions.map((position, k) => (
                                <div
                                    className="major-crimes__create__form__position"
                                    key={`${selectedLocation.name}Position${k}`}
                                >
                                    <label htmlFor={`position_${k}`}>
                                        <h4>{position.position}</h4>
                                        <p>{`${position.recommendedCut}%`}</p>
                                    </label>
                                    <Field
                                        name={`position_${k}`}
                                        placeholder={position.recommendedCut}
                                        image={Percent}
                                        component={Input}
                                    />
                                </div>
                            ))}
                            <div className="major-crimes__create__box__button-container">
                                <Field
                                    component={Button}
                                    styleType="secondary"
                                    color="white"
                                    name="saveAmount"
                                    type="button"
                                >
                                    Use recommended
                                </Field>
                            </div>
                        </div>
                        <div className="major-crimes__create__form__controls">
                            <SlideCheck
                                label="Advertise unfilled positions publicly"
                                checked={advertisePubliclySwitch}
                                onChange={() =>
                                    setAdvertisePubliclySwitch(
                                        !advertisePubliclySwitch
                                    )
                                }
                                className={`major-crimes__create__form__switch`}
                                name={'advertisePubliclySwitch'}
                            />
                            <Field
                                component={Button}
                                styleType="primary"
                                color="blue"
                                name="saveAmount"
                            >
                                Create
                            </Field>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default MajorCrimesCreate
