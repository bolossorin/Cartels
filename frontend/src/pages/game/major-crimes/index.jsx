import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import MajorCrimeItem from './MajorCrimeItem.jsx'

import MCBackground from 'img/major_crimes/background.png'
import Masthead from '../../_common/Masthead/Masthead'
import Button from '../../_common/Button'
import Content from '../../_common/Content/Content'

import './MajorCrimes.scss'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import PercentBar from '../_common/PercentBar'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import MajorCrimesList from './MajorCrimesList'
import MajorCrimesCreate from './MajorCrimeCreate'

const MAJOR_CRIMES = gql`
    query majorCrimes {
        majorCrimes {
            locationsList {
                id
                name
                image
                disabled
                respect {
                    currentRespect
                    maxRespect
                }
                positions {
                    position
                    recommendedCut
                }
            }
            majorCrimesList {
                id
                district
                location {
                    id
                    name
                }
                positions {
                    id
                    position
                    recommendedCut
                    selectedCut
                    player {
                        id
                        name
                        role
                    }
                }
            }
        }
    }
`

function MajorCrimes() {
    const { data, refetch } = useQuery(MAJOR_CRIMES)
    const [selectedLocation, setSelectedLocation] = useState()
    const { page } = useParams()

    const locations = data?.majorCrimes?.locationsList
    const majorCrimes = data?.majorCrimes?.majorCrimesList

    const filteredMajorCrimes = majorCrimes?.filter(
        (majorCrime) => majorCrime.location.id === selectedLocation?.id
    )

    return (
        <Content color="game" className="major-crimes">
            <img
                className="background"
                src={MCBackground}
                alt="Major Crimes Board"
            />
            <Masthead fullWidth>Major Crimes</Masthead>
            <div className="major-crimes__locations">
                {locations ? (
                    locations.map((location) => (
                        <div
                            className={`major-crimes__location 
                        ${
                            location.disabled
                                ? 'major-crimes__location--disabled'
                                : ''
                        }
                        ${
                            location.id === selectedLocation?.id
                                ? 'major-crimes__location--selected'
                                : ''
                        }`}
                            style={{
                                backgroundImage: `url(${location.image})`,
                            }}
                            key={location.id}
                            onClick={() => setSelectedLocation(location)}
                        >
                            <h3>{location.name}</h3>
                        </div>
                    ))
                ) : (
                    <IntegratedLoader />
                )}
            </div>
            <div className="major-crimes__respect">
                {selectedLocation ? (
                    <PercentBar
                        value={selectedLocation.respect.currentRespect}
                        maxValue={selectedLocation.respect.maxRespect}
                        color="green"
                        showMaxValue
                        unit="Respect"
                    />
                ) : (
                    <p>Please select a location</p>
                )}
            </div>
            {selectedLocation && (
                <div className="major-crimes__content">
                    {!page && (
                        <MajorCrimesList
                            majorCrimes={filteredMajorCrimes}
                            selectedLocation={selectedLocation}
                        />
                    )}
                    {page === 'create' && (
                        <MajorCrimesCreate
                            selectedLocation={selectedLocation}
                        />
                    )}
                </div>
            )}
        </Content>
    )
}

export default MajorCrimes
