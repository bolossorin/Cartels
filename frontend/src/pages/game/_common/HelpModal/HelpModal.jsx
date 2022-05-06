import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button/Button'
import HelpIcon from '../../../../assets/images/help.svg';
import './HelpModal.scss';

function HelpModal({ title, openByDefault, children, size }) {
    const [visible, setVisible] = useState(openByDefault ?? false);

    function toggleVisible() {
        setVisible(!visible);
    }

    function dismiss() {
        setVisible(false);
    }

    return (
        <>
            <div className="help-icon" onClick={toggleVisible} style={{ width: `${size}px`, height: `${size}px` }}>
                <img src={HelpIcon} alt={`Help with ${title ?? 'context'}`} />
            </div>
            <Modal title={title ?? 'Help'} isOpen={visible} className="help-modal">
                <article className="help-modal__content">
                    {children}
                </article>
                <article className="help-modal__cta">
                    <Button onClick={dismiss}>Exit</Button>
                </article>
            </Modal>
        </>
    );
}

export default HelpModal;