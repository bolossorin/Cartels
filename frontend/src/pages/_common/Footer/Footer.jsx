import React from 'react'
import LogoSvg from 'img/CodeOrder-new-logo.svg'
import Text from '../Text/Text'
import './Footer.scss'
import Content from '../Content/Content'

function Footer() {
    return (
        <footer className={`game-footer`}>
            <div className="codeorder">
                <img src={LogoSvg} height="46" alt="CodeOrder Pty Ltd" />
                CODEORDER PTY LTD.
            </div>
            <span>
                Copyright &copy; {new Date().getFullYear()}. All rights
                reserved.
            </span>
        </footer>
    )
}

export default Footer
