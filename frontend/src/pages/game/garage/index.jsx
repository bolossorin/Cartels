import React, { useEffect, useState } from 'react'
import Masthead from '../../_common/Masthead/Masthead'
import Content from '../../_common/Content/Content'
import './Garage.scss'
import Hamburger from '../../../assets/images/icons/hamburger.svg'
import List from '../../../assets/images/icons/list.svg'
import MagGlass from '../../../assets/images/icons/mag-glass.svg'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import IntegratedLoader from '../_common/Loading/IntegratedLoader'
import GarageItemView from './GarageItemView'

const GARAGE_QUERY = gql`
    query GaragePage($input: GarageInput!) {
        garage(input: $input) {
            vehiclesCount
            vehicles {
                id
                plate
                name
                damage
                heat
                image
                shipping
            }
        }
        viewer {
            player {
                id
                district
            }
        }
    }
`

function Garage() {
    const [vehicleState, setVehicleState] = useState([]);
    const [searchFieldValue, setSearchFieldValue] = useState('');
    const [isGridOrList, setIsGridOrList] = useState("grid");

    const { data, loading } = useQuery(GARAGE_QUERY, {
        fetchPolicy: 'cache-and-network',
        variables: {
            input: {
                _: 'stub',
            },
        },
    })

    const vehicles = data?.garage?.vehicles;
    const location = data?.viewer?.player?.district;

    useEffect(() => {
        setVehicleState(data?.garage?.vehicles);
    }, [vehicles]);

    const handleSearchChange = (e) => {
        const value = e.target.value;

        if (value === '') {
            setVehicleState(vehicles);
        } else {
            const filterVehicles = vehicles.filter(vehicle => {
                const vehicleName = vehicle.name.toLowerCase();
                const vehiclePlate = vehicle.plate.toLowerCase();

                return vehicleName.search(value.toLowerCase()) !== -1 || vehiclePlate.search(value.toLowerCase()) !== -1;
            });
            setVehicleState(filterVehicles);
        }
        setSearchFieldValue(value);
    }

    const handleMenuClick = () => {
        const otherValue = isGridOrList !== 'grid' ? 'grid' : 'list';
        setIsGridOrList(otherValue);
    }
    return (
        <Content color="game">
            <div className="garage__header">
                <Masthead fullWidth>Garage</Masthead>
                <div className="search-input">
                    <input
                        type="text"
                        className="input__search-bar"
                        placeholder="Search"
                        onChange={handleSearchChange}
                        value={searchFieldValue}
                    />

                    <img src={MagGlass} alt="search icon" className="__search-icon" />
                </div>

                <div className="icon">
                    <img src={isGridOrList === 'grid' ? Hamburger : List} alt="menu icon" onClick={handleMenuClick} />
                </div>
            </div>

            <div className="garage__location">
                <p>{location}</p>
            </div>
            
            {loading ? (
                <IntegratedLoader />
            ) : (
                <GarageItemView vehicleState={vehicleState} isGridOrList={isGridOrList} />
            ) ?? (
                <ul className={`inventory-page__grid`}>
                    <li className={`inventory-page__grid__empty-item`}>
                        No cars available in this location.
                    </li>
                </ul>
            )}
        </Content>
    )
}

export default Garage
