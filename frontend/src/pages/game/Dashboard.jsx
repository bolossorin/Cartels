import React, { Suspense } from 'react'
import gql from 'graphql-tag'
import { Redirect, Route, Switch } from 'react-router-dom'
import { withRouter } from 'react-router'
import Header from './header'
import MobileHeader from './header/Mobile'
import LeftPanel from './left-panel'
import RightPanel from './right-panel'
import MobileLeftPanel from './left-panel/components/Mobile'
import MobileRightPanel from './right-panel/Mobile'
import FullScreenLoader from './_common/Loading/FullScreenLoader'
import IntegratedLoader from './_common/Loading/IntegratedLoader'
import CharacterCreateModal from './character-create'

import './Dashboard.scss'
import { useQuery } from '@apollo/react-hooks'
import FullScreenError from './_common/FullScreenError'

import BuildingSvg from '../../assets/images/building.svg'
import Footer from '../_common/Footer/Footer'

const Lottery = React.lazy(() => import('./lottery'))
const JailPage = React.lazy(() => import('./jail'))
const Forums = React.lazy(() => import('./forums/Categories'))
const Forum = React.lazy(() => import('./forums/Threads'))
const Thread = React.lazy(() => import('./forums/ForumThread'))
const PlayersOnline = React.lazy(() => import('./players-online'))
const MinorCrimes = React.lazy(() => import('./crimes'))
const MajorCrimes = React.lazy(() => import('./major-crimes'))
const Gamble = React.lazy(() => import('./gamble'))
const RaceTrack = React.lazy(() => import('./race-track'))
const Lab = React.lazy(() => import('./the-lab'))
const MainGameMap = React.lazy(() => import('./map'))
const Rules = React.lazy(() => import('./rules'))
const Bank = React.lazy(() => import('./bank'))
const Updates = React.lazy(() => import('./updates'))
const Profile = React.lazy(() => import('./profile'))
const LabMarket = React.lazy(() => import('./the-lab/market/Market'))
const Market = React.lazy(() => import('./market'))
const Theft = React.lazy(() => import('./theft'))
const BulletFactory = React.lazy(() => import('./bullet-factory'))
const HomePage = React.lazy(() => import('./home-page'))
const Garage = React.lazy(() => import('./garage'))
const GarageCar = React.lazy(() => import('./garage/GarageCar'))
const PerksRundown = React.lazy(() => import('./perks/PerksRundown'))
const Roulette = React.lazy(() => import('./roulette'))
const BlackJack = React.lazy(() => import('./blackjack'))
const Store = React.lazy(() => import('./store'))
const Estates = React.lazy(() => import('./estates'))
const Crews = React.lazy(() => import('./crews'))
const Crew = React.lazy(() => import('./crews/Crew'))
const CrewCreate = React.lazy(() => import('./crews/CrewCreate'))
const CrewsList = React.lazy(() => import('./crews/CrewsList'))
const MyCrew = React.lazy(() => import('./crews/MyCrew/MyCrew'))
const Easter = React.lazy(() => import('./easter'))

const VIEWER_QUERY = gql`
    query PlayerQuery {
        viewer {
            player {
                id
                name
                character
                rank
                district
                currencies {
                    name
                    amount
                }
                xp
                xpTarget
                hp
                isJailed
                role
                cash
                cooldowns {
                    name
                    startedAt
                    expiresAt
                }
            }
        }
        jail {
            inmatesCount
        }
        activePlayers {
            count
        }
    }
`

function Dashboard() {
    const { loading, error, data, refetch } = useQuery(VIEWER_QUERY)

    const characterCreateRequired =
        error?.graphQLErrors[0]?.message ===
        'You must have a player account to proceed.'

    if (loading) {
        return <FullScreenLoader />
    }
    if (error && !characterCreateRequired) {
        return <FullScreenError error={error} />
    }

    async function handleCreateInitialCharacter() {
        await refetch()
    }

    const player = data?.viewer?.player
    const role = data?.viewer?.player?.role
    const isStaff = role && role !== 'PLAYER'

    return (
        <div className="container">
            <CharacterCreateModal
                isOpen={characterCreateRequired}
                onCreateInitialCharacter={handleCreateInitialCharacter}
            />
            <Header />
            <MobileHeader />
            <div className="content">
                <LeftPanel player={player} isJailed={player?.isJailed} />
                <MobileLeftPanel player={player} />
                <main>
                    <Suspense
                        fallback={<IntegratedLoader text={`Loading...`} />}
                    >
                        <Switch>
                            <Route exact path="/home" component={HomePage} />
                            <Route
                                exact
                                path="/__uf/lottery"
                                component={Lottery}
                            />
                            <Route exact path="/jail" component={JailPage} />
                            <Route exact path="/forums" component={Forums} />
                            <Route
                                exact
                                path="/forums/:category"
                                component={Forum}
                            />
                            <Route
                                exact
                                path="/forums/:category/:threadId"
                                component={Thread}
                            />
                            <Route
                                exact
                                path="/online"
                                component={PlayersOnline}
                            />
                            <Route
                                exact
                                path="/bullet-factory"
                                component={BulletFactory}
                            />
                            <Route
                                exact
                                path="/crimes"
                                component={MinorCrimes}
                            />
                            <Route
                                exact
                                path="/__uf/majorcrimes"
                                component={MajorCrimes}
                            />
                            <Route
                                exact
                                path="/__uf/majorcrimes/:page"
                                component={MajorCrimes}
                            />
                            <Route exact path="/casino" component={Gamble} />
                            <Route exact path="/car-theft" component={Theft} />
                            <Route
                                exact
                                path="/casino/track"
                                component={RaceTrack}
                            />
                            {/*<Route*/}
                            {/*    exact*/}
                            {/*    path="/casino/track"*/}
                            {/*    render={(props) => (*/}
                            {/*        <RaceTrack {...props} player={player} />*/}
                            {/*    )}*/}
                            {/*/>*/}
                            <Route
                                exact
                                path="/casino/blackjack"
                                component={BlackJack}
                            />
                            <Route exact path="/lab" component={Lab} />
                            <Route
                                exact
                                path="/lab/market"
                                component={LabMarket}
                            />
                            <Route exact path="/market" component={Market} />
                            <Route exact path="/map" component={MainGameMap} />
                            <Route exact path="/rules" component={Rules} />
                            <Route
                                exact
                                path="/bank"
                                render={(props) => <Bank {...props} />}
                            />
                            <Route exact path="/news" component={Updates} />
                            <Route
                                exact
                                path="/p/:playerName"
                                component={Profile}
                            />
                            <Route
                                exact
                                path="/p/:playerName/:tab"
                                component={Profile}
                            />
                            <Route exact path="/garage" component={Garage} />
                            <Route
                                exact
                                path="/casino/roulette"
                                component={Roulette}
                            />
                            <Route
                                exact
                                path="/garage/:id"
                                component={GarageCar}
                            />
                            <Route
                                exact
                                path="/perks"
                                component={PerksRundown}
                            />
                            <Route
                                exact
                                path="/__uf/estate"
                                component={Estates}
                            />
                            <Route exact path="/crew" component={Crews} />
                            <Route
                                exact
                                path="/crew/:id/:tab"
                                component={Crew}
                            />
                            <Route
                                exact
                                path="/crew/create"
                                component={CrewCreate}
                            />
                            <Route
                                exact
                                path="/crews-list"
                                component={CrewsList}
                            />
                            <Route exact path="/my-crew" component={MyCrew} />
                            <Route
                                exact
                                path="/my-crew/:tab"
                                component={MyCrew}
                            />
                            <Route exact path="/crew/:id" component={Crew} />
                            <Route exact path="/store" component={Store} />
                            <Route
                                exact
                                path="/eggcombinator"
                                component={Easter}
                            />

                            <Redirect to="/home" />
                        </Switch>
                    </Suspense>
                </main>
                <RightPanel player={player} />
                <MobileRightPanel player={player} />
            </div>
            {isStaff && (
                <div className="overlord-control">
                    <button onClick={() => confirm('Soon...')}>
                        <img src={BuildingSvg} alt="Overlord" />
                        {role}
                    </button>
                </div>
            )}
            <Footer />
        </div>
    )
}

export default withRouter(Dashboard)
