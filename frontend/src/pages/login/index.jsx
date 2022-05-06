import React, { useState } from 'react'
import LogoSvg from 'img/CodeOrder_LOGO.svg'
import CartelsLogo from 'img/Cartels-logo-login.png'
import Alpha from 'img/login/ALPHASEASON.png'
import IcoJobs from 'img/icons/JOBS.svg'
import IcoCrew from 'img/icons/CREW.svg'
import IcoBank from 'img/icons/BANK.svg'
import IcoTrade from 'img/icons/TRADE.svg'
import IcoMinor from 'img/icons/CRIMES.svg'
import IcoMajor from 'img/icons/MAJOR.svg'
import IcoCars from 'img/icons/CARS.svg'
import IcoRace from 'img/icons/RACE.svg'
import IcoFight from 'img/icons/FIGHT.svg'
import IcoLab from 'img/icons/THE LAB.svg'
import IcoMarket from 'img/icons/MARKET.svg'
import IcoArmory from 'img/icons/ARMORY.svg'
import IcoKill from 'img/icons/KILL.svg'
import IcoGamble from 'img/icons/GAMBLE.svg'
import IcoEstate from 'img/icons/ESTATE.svg'
import IcoStory from 'img/icons/STORY.svg'
import './Login.scss'
import Content from '../_common/Content/Content'
import Button from '../_common/Button'
import Tabs from '../_common/Tabs/Tabs'
import Tab from '../_common/Tabs/Tab'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import Chart from './Chart'
import ParentSize from '@visx/responsive/lib/components/ParentSize'
import Image from '../_common/Image/Image'
import Marker from 'img/marker.png'
import Footer from '../_common/Footer/Footer'
import InfoBox from './InfoBox'
import ResetPasswordForm from './ResetPasswordForm'

const INFO_LIST = [
    {
        title: 'Jobs',
        text:
            'The city streets are full of unscrupulous characters looking for dirty work done at a reasonable price.',
        image: IcoJobs,
    },
    {
        title: 'Bank',
        text:
            "City banks operate on a need-to-know basis, meaning they don't need to know where that duffel bag full of cash came from as long as you're paying fees.",
        image: IcoBank,
    },
    {
        title: 'Trade',
        text:
            "You won't find a place more of a pure embrace of unchecked capitalism than Cartels. Practically everything is for sale, assuming discretion.",
        image: IcoTrade,
    },
    {
        title: 'Major Crimes',
        text:
            "With a plethora of big business, corner stores and bank vaults available for the taking it's no wonder Cartels is notorious for minting the pockets of the countless shady characters.",
        image: IcoMajor,
    },
    {
        title: 'Cars',
        text:
            "Fast, slow, large, safe and mundane. There's a car with your name on it, if you're willing to take what you deserve.",
        image: IcoCars,
    },
    {
        title: 'Race',
        text:
            "Illegal street racing is where reputations are made and ruined, with multiple tracks around the streets and dunes of Cartels there's no shortage of opportunity for you to prove your tuning ability and sheer driving aptitude.",
        image: IcoRace,
    },
    {
        title: 'Fight',
        text:
            'Underground fight clubs operate underneath the glitzy surface of Cartels, where cash can be made and you might not make it out in one piece.',
        image: IcoFight,
    },
    {
        title: 'Lab',
        text:
            'The proliferation of illegal street drugs has been a gold mine for bathtub chemists and professional operations alike. Build your own distribution and manufacturing to own the market.',
        image: IcoLab,
    },
    {
        title: 'Market',
        text:
            'Weapons, protection and items are available from the black market to help bolster your fledgling empire.',
        image: IcoMarket,
    },
    {
        title: 'Armory',
        text:
            'When the government rolls in and out war, surplus ammunition often make it into the hand of "grey area" distributors who don\'t seem to notice ammo crates falling off their trucks.',
        image: IcoArmory,
    },
    {
        title: 'Estate',
        text:
            'If your goal is total domination, a sprawling estate is a necessity to store your wares and build out your operational capabilities.',
        image: IcoEstate,
    },
    {
        title: 'Story',
        text:
            "At the intersection of three deadly syndicates, you'll need to navigate your way through and emerge a major power broker in the inevitable war.",
        image: IcoStory,
    },
]

function Login() {
    const [forgot, setForgot] = useState(false)

    function handleForgot(state) {
        setForgot(state)
    }

    return (
        <div className="login">
            <div className="content-container">
                <div className="header">
                    <img
                        className="header__season"
                        src={Alpha}
                        alt="Alpha Season"
                    />
                    <div className="header__logo">
                        <img
                            src={CartelsLogo}
                            alt="Cartels, formerly Downtown Mafia"
                        />
                        <div className="header__logo__gradient" />
                    </div>
                </div>
                <div className="boxes-container">
                    <div className="first-column">
                        <div className="row">
                            <Content color="black">
                                {forgot ? (
                                    <>
                                        <ResetPasswordForm />
                                        <a
                                            className="forgot-password"
                                            onClick={() => handleForgot(false)}
                                        >
                                            Back to login
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <Tabs>
                                            <Tab name="Login">
                                                <LoginForm />
                                            </Tab>
                                            <Tab name="Sign up">
                                                <RegisterForm />
                                            </Tab>
                                        </Tabs>
                                        <a
                                            className="forgot-password"
                                            onClick={() => handleForgot(true)}
                                        >
                                            Forgot password?
                                        </a>
                                        {/*<Button styleType="secondary" color="white">*/}
                                        {/*    Continue with Google*/}
                                        {/*</Button>*/}
                                    </>
                                )}
                            </Content>
                        </div>
                        <div className="row">
                            <Content color="blue">
                                <>
                                    <h3>Server Status</h3>
                                    <div className={`status-indicator`}>
                                        <div className="ring-container">
                                            <div
                                                className={`ringring ringring__green`}
                                            />
                                            <div
                                                className={`circle circle__green`}
                                            />
                                            <div className="status-text">
                                                Operational (
                                                {window.ESCOBAR.serverPing *
                                                    1000}
                                                ms ping)
                                            </div>
                                        </div>
                                    </div>
                                </>
                            </Content>
                        </div>
                    </div>
                    <div className="second-column">
                        <div className="row">
                            <Content color="black" className={`test-map`}>
                                <>
                                    <span className={`factoid-title`}>
                                        New weapons & equipment
                                    </span>
                                    <span className={`learn-more`}>
                                        Learn more
                                    </span>
                                </>
                            </Content>
                            <Content color="red" className={`chart-content`}>
                                <Chart width={`400`} height={`150`} />
                            </Content>
                        </div>
                        <div className="row">
                            <InfoBox infoBoxInfos={INFO_LIST} />
                        </div>
                        <div className="row">
                            <Content color="blue" className={`discord-box`}>
                                <h3>Discord community</h3>
                                <p>
                                    Updates and discussions are posted on the
                                    Cartels Community Discord server. Everyone
                                    is welcome to ask questions and make
                                    friends.
                                </p>
                                <a
                                    href="https://discord.gg/5Xe845M"
                                    target="_blank"
                                    className="link-button-wrapper"
                                >
                                    <Button styleType="secondary" color="blue">
                                        Open Discord
                                    </Button>
                                </a>
                            </Content>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default Login
