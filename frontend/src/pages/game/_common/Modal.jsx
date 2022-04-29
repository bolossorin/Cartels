import React from 'react'
import PropTypes from 'prop-types'
import ReactModal from 'react-modal'
import './Modal.scss'

function Modal({ isOpen, title, children, className, noFullScreen }) {
    return (
        <ReactModal
            isOpen={isOpen}
            closeTimeoutMS={420}
            overlayClassName={`modal-overlay ${
                noFullScreen ? 'modal-overlay--no-fullscreen' : ''
            }`}
            className={`modal ${className ?? 'modal-jumbo'}`}
            appElement={document.getElementById('root')}
        >
            <div className="modal-inner">
                {title && <h1>{title ?? 'Name your character'}</h1>}
                {children}
            </div>
        </ReactModal>
    )
}

export default Modal
