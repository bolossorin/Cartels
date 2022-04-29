import React from 'react'
import './Crews.scss'
import Content from '../../_common/Content/Content'
import Masthead from '../../_common/Masthead/Masthead'
import CrewsBackground from 'img/crew/image 13.png'
import { Link } from 'react-router-dom'
import Button from '../../_common/Button'

function CrewsHeader({ children, linkTo, title, linkButton }) {
    return (
        <Content color="game" className="crews">
            <img className="background" src={CrewsBackground} alt="Crews" />
            <Masthead fullWidth>
                {!linkTo && title}
                {!!linkTo && <Link to={linkTo}>{title}</Link>}
                {linkButton && (
                    <Link to={linkButton?.url}>
                        <Button color="blue" styleType="secondary">
                            {linkButton?.text}
                        </Button>
                    </Link>
                )}
            </Masthead>
            {children}
        </Content>
    )
}

export default CrewsHeader
