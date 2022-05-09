import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BulletFactory.scss'
import { Field, Form, Formik } from 'formik'

import Content from '../../_common/Content/Content'
import BulletFactoryImage from 'img/bullet-factory/bullet-factory.png'
import Bullets from 'img/bullet-factory/ammo.png'
import NameTag from '../_common/NameTag'
import Input from '../../_common/Input'
import Button from '../../_common/Button'
import Checkbox from '../../_common/Checkbox'
import TextPill from '../_common/TextPill'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                district
            }
        }
    }
`

const bulletFactory = [
    {
        owner: {
            name: 'Robin Bad',
            crew: 'Grim Reapers',
            role: 'player',
        },
        stock: 0,
        time: '01:02:22',
        location: 'Valencia Hills',
    },
    {
        owner: {
            name: 'Robin Bad',
            crew: 'Grim Reapers',
            role: 'player',
        },
        stock: 200,
        time: '01:02:22',
        location: 'Sol Furioso',
    },
    {
        owner: {
            name: 'Robin Bad',
            crew: 'Grim Reapers',
            role: 'player',
        },
        stock: 20000,
        time: '01:02:22',
        location: 'Marshall City',
    },
    {
        owner: {
            name: 'Robin Bad',
            crew: 'Grim Reapers',
            role: 'player',
        },
        stock: 0,
        time: '01:02:22',
        location: 'Park City',
    },
    {
        owner: {
            name: 'Robin Bad',
            crew: 'Grim Reapers',
            role: 'player',
        },
        stock: 0,
        time: '01:02:22',
        location: 'Dirtlands',
    },
]

function BulletFactory() {
    const { loading, error, data, refetch } = useQuery(VIEWER_QUERY)
    const player = data?.viewer?.player
    const district = player?.district

    const currentDistrict = district ?? `No Man's Land`

    const selectedFactory = bulletFactory.filter(
        (factory) => factory.location === currentDistrict
    )[0]

    return (
        <Content color="game" className="bullet-factory">
            <h2>Bullet Factory</h2>
            <img
                className="background"
                src={BulletFactoryImage}
                alt="bullet factory"
            />
            <div className="bullet-factory__owner">
                <p>
                    Owner: <NameTag player={selectedFactory?.owner} />{' '}
                </p>
                <p>
                    Crew: <span>{selectedFactory?.owner.crew}</span>
                </p>
            </div>
            <div className="bullet-factory__info">
                <p className="bullet-factory__info__time">
                    Next release: <span>{selectedFactory?.time}</span>
                </p>
                <h3
                    className={`bullet-factory__info__stock ${
                        selectedFactory?.stock === 0
                            ? 'bullet-factory__info__stock--empty'
                            : ''
                    }`}
                >
                    {`${
                        selectedFactory?.stock === 0
                            ? 'OUT OF STOCK'
                            : `${selectedFactory?.stock} bullets`
                    }`}
                </h3>
                <p className="bullet-factory__info__cost">Cost: 1$ / bullet</p>
                <p className="bullet-factory__info__rate">
                    Maximum 200 bullets per 30 seconds
                </p>
                <div className="bullet-factory__info__purchase-form">
                    <Formik>
                        {(props) => (
                            <Form name="login">
                                <Field
                                    name="bullets"
                                    placeholder="Amount"
                                    image={Bullets}
                                    component={Input}
                                    disabled={false}
                                />
                                <Field
                                    component={Button}
                                    styleType="primary"
                                    color="blue"
                                    name="loginButton"
                                    disabled={false}
                                >
                                    Purchase
                                </Field>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
            <table className="bullet-factory__factories">
                <thead>
                    <tr className="bullet-factory__factories__header">
                        <th>Owner</th>
                        <th>Location</th>
                        <th>Released</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {bulletFactory?.map((factory) => (
                        <tr
                            className={`bullet-factory__factories__factory ${
                                factory.location === currentDistrict
                                    ? 'bullet-factory__factories__factory--selected'
                                    : ''
                            }`}
                        >
                            <td>
                                <NameTag player={factory.owner} />
                            </td>
                            <td>{factory.location}</td>
                            <td>{factory.time}</td>
                            <td
                                className={`${
                                    factory.stock === 0 ? 'out-of-stock' : ''
                                }`}
                            >
                                {`${
                                    factory.stock === 0
                                        ? 'Out of stock'
                                        : `${factory.stock} bullets`
                                }`}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Content>
    )
}

export default BulletFactory
