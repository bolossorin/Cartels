import IcoJobs from './assets/images/icons/JOBS.svg'
import IcoCrew from './assets/images/icons/CREW.svg'
import IcoBank from './assets/images/icons/BANK.svg'
import IcoTrade from './assets/images/icons/TRADE.svg'
import IcoMinor from './assets/images/icons/CRIMES.svg'
import IcoMajor from './assets/images/icons/MAJOR.svg'
import IcoCars from './assets/images/icons/CARS.svg'
import IcoRace from './assets/images/icons/RACE.svg'
import IcoFight from './assets/images/icons/FIGHT.svg'
import IcoLab from './assets/images/icons/THE LAB.svg'
import IcoMarket from './assets/images/icons/MARKET.svg'
import IcoArmory from './assets/images/icons/ARMORY.svg'
import IcoKill from './assets/images/icons/KILL.svg'
import IcoGamble from './assets/images/icons/GAMBLE.svg'
import IcoEstate from './assets/images/icons/ESTATE.svg'
import IcoStory from './assets/images/icons/STORY.svg'

export const WS_BASE_URL = 'ws://localhost:8080/api/graphql'
export const AUTH_TOKEN = 'auth-token'
export const LIGHTSPEED_MODE = 'lightspeed'

export const NavItems = [
    {
        key: 0,
        name: 'jobs',
        icon: IcoJobs,
        link: '/jobs',
        disabled: true,
    },
    {
        key: 1,
        name: 'crew',
        icon: IcoCrew,
        link: '/crew',
        disabled: false,
    },
    {
        key: 2,
        name: 'bank',
        icon: IcoBank,
        link: '/bank',
    },
    {
        key: 3,
        name: 'trade',
        icon: IcoTrade,
        link: '/trade',
        disabled: true,
    },
    {
        key: 4,
        name: 'crimes',
        icon: IcoMinor,
        link: '/crimes',
    },
    {
        key: 5,
        name: 'major',
        icon: IcoMajor,
        link: '/majorcrimes',
        disabled: true,
    },
    {
        key: 6,
        name: 'car theft',
        icon: IcoCars,
        link: '/car-theft',
        disabled: false,
    },
    {
        key: 7,
        name: 'race',
        icon: IcoRace,
        link: '/race',
        disabled: true,
    },
    {
        key: 8,
        name: 'fight',
        icon: IcoFight,
        link: '/fight',
        disabled: true,
    },
    {
        key: 9,
        name: 'the lab',
        icon: IcoLab,
        link: '/lab',
        disabled: false,
    },
    {
        key: 10,
        name: 'market',
        icon: IcoMarket,
        link: '/market',
        disabled: false,
    },
    {
        key: 11,
        name: 'armory',
        icon: IcoArmory,
        link: '/armory',
        disabled: true,
    },
    {
        key: 12,
        name: 'kill',
        icon: IcoKill,
        link: '/kill',
        disabled: true,
    },
    {
        key: 13,
        name: 'casino',
        icon: IcoGamble,
        link: '/casino',
        disabled: false,
    },
    {
        key: 14,
        name: 'estate',
        icon: IcoEstate,
        link: '/estate',
        disabled: true,
    },
    {
        key: 15,
        name: 'story',
        icon: IcoStory,
        link: '/story',
        disabled: true,
    },
]
