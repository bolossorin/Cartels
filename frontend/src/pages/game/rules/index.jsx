import React, { useState } from 'react'
import Duping from 'img/rules/1-duping.svg'
import Sharing from 'img/rules/1-sharing.svg'
import Automated from 'img/rules/1-automated.svg'
import Copyright from 'img/rules/1-copyright.svg'
import Exploits from 'img/rules/1-exploits.svg'
import Impersonation from 'img/rules/1-impersonation.svg'
import Laundering from 'img/rules/1-laundering.svg'
import MajorChanges from 'img/rules/1-major-changes.svg'
import Offensive from 'img/rules/1-offensive.svg'
import Revivals from 'img/rules/1-revival.svg'
import SafetyShooting from 'img/rules/1-safety-shooting.svg'
import Scamming from 'img/rules/1-scamming.svg'
import SupportAbuse from 'img/rules/1-support-abuse.svg'
import ValidDetails from 'img/rules/1-valid-details.svg'
import VolatileMessaging from 'img/rules/1-volatile-messaging.svg'
import Wardriving from 'img/rules/1-wardriving.svg'
import BanDiscussion from 'img/rules/2-ban-discussion.svg'
import English from 'img/rules/2-english.svg'
import Game from 'img/rules/2-game.svg'
import RuleExtension from 'img/rules/2-rule-extension.svg'
import Chargeback from 'img/rules/3-chargeback.svg'
import PointsProperty from 'img/rules/3-points-property.svg'
import Rollover from 'img/rules/3-rollover.svg'
import VerficationDelay from 'img/rules/3-verification-delay.svg'
import Abide from 'img/rules/4-abide.svg'
import Circumvention from 'img/rules/4-circumvention.svg'
import Detection from 'img/rules/4-detection.svg'
import PeriodicScans from 'img/rules/4-periodic-scans.svg'

import RulesItems from './rulesItem.jsx'

import './Rules.scss'

const TABS = {
    Rules: {
        level: 1,
    },
    PrivacyPolicy: {
        level: 2,
    },
}

const GENERAL_RULES = [
    {
        number: '1.0',
        name: 'Duping',
        text:
            'Each person is permitted to 1 alive account only at any given time. If additional alive accounts are discovered both (or all) accounts will be permanently banned.',
        image: Duping,
        type: 'general',
    },
    {
        number: '1.1',
        name: 'Account Sharing',
        text:
            'Each alive account may be played only by one person throughout the life of the accounts. Sharing accounts with friends or family is not permitted.',
        image: Sharing,
        type: 'general',
    },
    {
        number: '1.2',
        name: 'Scamming',
        text:
            'Scamming is not a bannable offense. The act of scamming through the use of exploits or other violations of this Terms of Service is not permitted.',
        image: Scamming,
        type: 'general',
    },
    {
        number: '1.3',
        name: 'Offensive Conduct',
        text:
            'Offensive content within the forums and other communication channels is not allowed in the context of directly targetting a single player or multiple players with racist, sexist or otherwise offensive content (including harassment), assuming the content was clearly unprovoked and well beyond satire or harmless jokes.',
        image: Offensive,
        type: 'general',
    },
    {
        number: '1.4',
        name: 'Safety Shooting',
        text:
            'Safety Shooting is not permitted. This is defined as shooting another player with the intention of protecting a player from being killed.',
        image: SafetyShooting,
        type: 'general',
    },
    {
        number: '1.5',
        name: 'Exploits',
        text:
            'Using any bug or exploit, even if known by staff, is not permitted. Depending on severity, permanent bans at the very least will be issued while more serious offenses can earn a place on the Ban-on-Sight list.',
        image: Exploits,
        type: 'general',
    },
    {
        number: '1.6',
        name: 'Major Changes',
        text:
            'We are under zero obligation to keep the website open. We reserve the right to discontinue individual features, pages or the entire website for any or no reason with or without notice. We reserve the right to make changes to these Terms of Service with new amendments taking immediate effect. It is your responsibility to know these rules and follow them on a day-to-day basis.',
        image: MajorChanges,
        type: 'general',
    },
    {
        number: '1.7',
        name: 'Valid details',
        text:
            'It is your responsibility to us to provide valid registration data. We will not provide support to players with fake details.',
        image: ValidDetails,
        type: 'general',
    },
    {
        number: '1.8',
        name: 'Copyright',
        text:
            'Any and all content you post or contribute to this website belongs to you. Upon posting such content you grant a non-transferrable license to DownTown-Mafia to modify, redistribute, delete, advertise and exhibit such content in any way we see fit unless such content is defined by us as "personal".',
        image: Copyright,
        type: 'general',
    },
    {
        number: '1.9',
        name: 'Abuse of Support',
        text:
            'We provide support systems such as the Help Desk and the forums to you at no cost. Abuse of these systems such as being offensive to staff or submitted false reports will result in permanent bans.',
        image: SupportAbuse,
        type: 'general',
    },
    {
        number: '1.10',
        name: 'Laundering',
        text:
            'Laundering, the act of attempting to clean dirty (defined as exploited for or gained by violation of these Terms of Service) money, points, bullets or any other monetary or non-monetary item relating to DownTown-Mafia will not be tolerated and is punishable by a minimum 3 day ban. Higher level sanctions will be considered if any or all of the item can not be retrieved.',
        image: Laundering,
        type: 'general',
    },
    {
        number: '1.11',
        name: 'Account Revivals',
        text:
            'Account revives will be undertaken by the investigating staff member if any of the following conditions are met; (a) the shooter of victim was found to be using duplicate accounts and they directly had an impact on the shooting of the victim, this includes holders, (b) the shooter of the victim was found to be abusing the Terms of Service in any other way not mentioned within this rule including (but not limited to) the use of automated scripts, exploits or selling in-game items for real currency.',
        image: Revivals,
        type: 'general',
    },
    {
        number: '1.12',
        name: 'Volatile Messaging',
        text:
            'All private messages sent and received are volatile and we make no guarantee to the availability to any private message. We routinely purge messages beyond a certain timeframe. Saved private messages are kept indefinitely.',
        image: VolatileMessaging,
        type: 'general',
    },
    {
        number: '1.13',
        name: 'Automated Gameplay',
        text:
            'Use of any tool that allows the game to be played without interaction of the account owner is not permitted. This includes software macros, automatic clickers or use of mouse or keyboard driver software to provide input without interaction.',
        image: Automated,
        type: 'general',
    },
    {
        number: '1.14',
        name: 'Impersonation',
        text:
            'Impersonating another player, person or staff member is not permitted. Only staff may use designated names "administrator", "operator" and "moderator". At no point should you label yourself any official staff title or assume any staff member\'s name in part or in full.',
        image: Impersonation,
        type: 'general',
    },
    {
        number: '1.15',
        name: 'Wardriving',
        text:
            'Intentionally attacking the servers behind DTM through the means of systematic attempts to break security to find loopholes, bugs or exploits is not allowed. However, this rule can be waived for players assuming they are under permission from Administrators or a majority of staff to do so, and will turn in any security holes found in the process.',
        image: Wardriving,
        type: 'general',
    },
]
const FORUM_RULES = [
    {
        number: '2.0',
        name: 'English only',
        text:
            'All content on the forums must be posted in English, unless in the designated topics in the Night Club forum.',
        image: English,
        type: 'forum',
    },
    {
        number: '2.1',
        name: 'Game related',
        text:
            'The Main Forum may be used for game-related topics and replies only, all other topics and replies must be posted in the Night Club forum.',
        image: Game,
        type: 'forum',
    },
    {
        number: '2.2',
        name: 'Ban discussion',
        text:
            'Although bans may be discussed on the forums, staff are under no obligation to enter into correspondence of the banning reasons.',
        image: BanDiscussion,
        type: 'forum',
    },
    {
        number: '2.3',
        name: 'Rule extension',
        text:
            'Forum rules may be extended or modified at any time by any staff member without prior notice.',
        image: RuleExtension,
        type: 'forum',
    },
]
const POINTS_GUIDELINES = [
    {
        number: '3.0',
        name: 'Verification Delay',
        text:
            'Generally we approve points purchases within 48 hours or less, but in the event of suspicious activity on your account or information relating to your payment we may withhold both points and money for up to 168 hours (7 days). After this point we will issue a full refund of the purchase amount.',
        image: VerficationDelay,
        type: 'points',
    },
    {
        number: '3.1',
        name: 'Chargebacks',
        text:
            'We take credit card chargebacks very, very seriously. We will NOT tolerate any credit card chargebacks and in the event of one for any reason will ban your account, bar you from ever making a points purchase again and possible place you on the Ban-on-Sight list for fraud.',
        image: Chargeback,
        type: 'points',
    },
    {
        number: '3.2',
        name: 'Points Property',
        text:
            'All points remain the property of DownTown-Mafia at all times. By purchasing points we are granting you a license to use up to the purchased amount of points for whichever purpose you see fit. We reserve the right to reclaim points under the event of a violation of these rules.',
        image: PointsProperty,
        type: 'points',
    },
    {
        number: '3.3',
        name: 'Points Rollover',
        text:
            'Points purchases may be partially or fully refundable in the event of a reset or rollback under our terms which will be made with the announcement of a reset or rollback.',
        image: Rollover,
        type: 'points',
    },
]
const FAMILY_ACCOUNT_RULES = [
    {
        number: '4.0',
        name: 'Detection',
        text:
            'We will use all measures necessary to link accounts to each other. This may involve (but is not limited to) IP scans, physical geolocation and browser fingerprint lookups. We use this data specifically for this service and the data is not shared and in most cases is not stored for extended periods of time.',
        image: Detection,
        type: 'family',
    },
    {
        number: '4.1',
        name: 'No circumvention',
        text:
            'We employ automated systems to detect, and stop interaction between Family Accounts. Circumvention of this technology is a violation of the Terms of Service.',
        image: Circumvention,
        type: 'family',
    },
    {
        number: '4.2',
        name: 'Periodic Scans',
        text:
            'We periodicially scan transactions that have occured in the previous day to ensure no Family Account interactions have been made. If they have, this is circumvention of our automated system and both accounts will be banned pending review.',
        image: PeriodicScans,
        type: 'family',
    },
    {
        number: '4.3',
        name: 'How to Abide',
        text:
            'Avoid playing in public places like university, school, public libraries or similar. Do not attempt to interact with accounts on this page.',
        image: Abide,
        type: 'family',
    },
]

function Rules() {
    const [tab, setTab] = useState(TABS.Rules)

    return (
        <section className="rules-container">
            <div className="rules-header">
                <h1>Rules / Privacy policy</h1>
            </div>
            <div className="rules-nav">
                {Object.entries(TABS).map(([tabName, tabConfig]) => (
                    <div
                        role="button"
                        onClick={() => setTab(tabConfig)}
                        className={`nav-item nav-item-${tabName} ${
                            tabConfig.level === tab.level
                                ? 'nav-item-active'
                                : ''
                        } `}
                        href=""
                    >
                        <div className={`rules-nav-info`}>
                            <p>
                                {tabName.match(/[A-Z][a-z]+|[0-9]+/g).join(' ')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rules-wrapper">
                <div className={`rules-page rules-page--${tab.level}`}>
                    <article className="rules">
                        <h2>1. General Rules</h2>
                        <RulesItems rulesList={GENERAL_RULES} />
                        <h2>2. Forum Rules</h2>
                        <RulesItems rulesList={FORUM_RULES} />
                        <h2>3. Points Guidelines</h2>
                        <RulesItems rulesList={POINTS_GUIDELINES} />
                        <h2>4. Family Account Rules</h2>
                        <RulesItems rulesList={FAMILY_ACCOUNT_RULES} />
                    </article>
                    <article className="privacy-policy">
                        <p>
                            <b>CodeOrder Pty Ltd</b> is committed to providing
                            quality services to you and this policy outlines our
                            ongoing obligations to you in respect of how we
                            manage your Personal Information.
                        </p>
                        <p>
                            We have adopted the Australian Privacy Principles
                            (APPs) contained in the Privacy Act 1988 (Cth) (the
                            Privacy Act). The NPPs govern the way in which we
                            collect, use, disclose, store, secure and dispose of
                            your Personal Information.
                        </p>
                        <p>
                            A copy of the Australian Privacy Principles may be
                            obtained from the website of The Office of the
                            Australian Information Commissioner at
                            www.aoic.gov.au.
                        </p>
                        <h3>
                            What is Personal Information and why do we collect
                            it?
                        </h3>
                        <p>
                            Personal Information is information or an opinion
                            that identifies an individual. Examples of Personal
                            Information we collect include: names, email
                            addresses, phone, IP addresses and browser
                            information.
                        </p>
                        <p>
                            This Personal Information is obtained in many ways
                            including by email, via our website www.cartels.com,
                            from cookies and from third parties. We don’t
                            guarantee website links or policy of authorised
                            third parties.
                        </p>
                        <p>
                            We collect your Personal Information for the primary
                            purpose of providing our services to you, providing
                            information to our clients and marketing. We may
                            also use your Personal Information for secondary
                            purposes closely related to the primary purpose, in
                            circumstances where you would reasonably expect such
                            use or disclosure. You may unsubscribe from our
                            mailing/marketing lists at any time by contacting us
                            in writing.
                        </p>
                        <p>
                            When we collect Personal Information we will, where
                            appropriate and where possible, explain to you why
                            we are collecting the information and how we plan to
                            use it.
                        </p>
                        <h3>Third parties</h3>
                        <p>
                            Where reasonable and practicable to do so, we will
                            collect your Personal Information only from you.
                            However, in some circumstances we may be provided
                            with information by third parties. In such a case we
                            will take reasonable steps to ensure that you are
                            made aware of the information provided to us by the
                            third party.
                        </p>
                        <h3>Disclosure of Personal Information</h3>
                        <p>
                            Your Personal Information may be disclosed in a
                            number of circumstances including the following:
                        </p>
                        <p>
                            - Third parties where you consent to the use or
                            disclosure; and
                        </p>
                        <p>- Where required or authorised by law</p>
                        <h3>Security of Personal Information</h3>
                        <p>
                            Your Personal Information is stored in a manner that
                            reasonably protects it from misuse and loss and from
                            unauthorized access, modification or disclosure.
                        </p>
                        <p>
                            When your Personal Information is no longer needed
                            for the purpose for which it was obtained, we will
                            take reasonable steps to destroy or permanently
                            de-identify your Personal Information. However, most
                            of the Personal Information is or will be stored in
                            client files which will be kept by us for a minimum
                            of 7 years.
                        </p>
                        <h3>Access to your Personal Information</h3>
                        <p>
                            You may access the Personal Information we hold
                            about you and to update and/or correct it, subject
                            to certain exceptions. If you wish to access your
                            Personal Information, please contact us in writing.
                        </p>
                        <p>
                            CodeOrder Pty Ltd will not charge any fee for your
                            access request, but may charge an administrative fee
                            for providing a copy of your Personal Information.
                        </p>
                        <p>
                            In order to protect your Personal Information we may
                            require identification from you before releasing the
                            requested information.
                        </p>
                        <h3>Policy Updates</h3>
                        <p>
                            This Policy may change from time to time and is
                            available on our website.
                        </p>
                        <h3>Complaints and Enquiries</h3>
                        <p>
                            If you have any queries or complaints about our
                            Privacy Policy please contact us at:
                        </p>
                        <p>support@codeorder.com</p>
                    </article>
                </div>
            </div>
        </section>
    )
}

export default Rules
