import Button from '../../_common/Button'
import MajorCrimeItem from './MajorCrimeItem'
import React from 'react'
import { Link } from 'react-router-dom'

function MajorCrimesList({ selectedLocation, majorCrimes }) {
    return (
        <div className="major-crimes__jobs content-padding">
            <div className="major-crimes__jobs__header">
                <h3>{`${selectedLocation.name} jobs`}</h3>
                <Link to="majorcrimes/create">
                    <Button styleType="primary" color="blue">
                        Create new job
                    </Button>
                </Link>
            </div>

            <div className="major-crimes__jobs__list">
                {majorCrimes.length > 0 ? (
                    majorCrimes?.map((majorCrime) => (
                        <MajorCrimeItem
                            key={majorCrime.id}
                            majorCrime={majorCrime}
                        />
                    ))
                ) : (
                    <p>{`There is currently no ${selectedLocation.name} job available.`}</p>
                )}
            </div>
        </div>
    )
}

export default MajorCrimesList
