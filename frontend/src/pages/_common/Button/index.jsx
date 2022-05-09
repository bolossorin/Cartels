import React, { useRef, useState, useEffect } from 'react'

import './Button.scss'
import Text from '../Text/Text'

function Button({ field, form, meta, className, linkTag, ...props }) {
    const inputElement = useRef(null)
    const [inputMeta, setInputMeta] = useState(null)

    const disabled = props?.disabled || form?.isSubmitting || props?.loading

    function handleSubmit(e) {
        e.preventDefault()

        const offsetTop = e.target.offsetTop
        const offsetLeft = e.target.offsetLeft
        const width = e.target.offsetWidth
        const height = e.target.offsetHeight

        const relativeX = e.pageX - offsetLeft
        const relativeY = e.pageY - offsetTop

        const formName = inputElement?.current?.form?.name
        if (formName) {
            const meta = {
                ...(inputMeta ?? {}),
                clicked: new Date(),
                w: width,
                h: height,
                x: relativeX,
                y: relativeY,
                trC: e.isTrusted,
            }

            setInputMeta(meta)
        }

        form.submitForm()
    }

    function handleFocus(e) {
        const formName = inputElement?.current?.form?.name
        if (formName) {
            const meta = {
                ...(inputMeta ?? {}),
                focus: new Date(),
                trF: e.isTrusted,
            }

            setInputMeta(meta)
        }
    }

    const encoded = inputMeta ? JSON.stringify(inputMeta) : ''

    let buttonText = props.children
    if (props?.loadingText && (props.loading || form?.isSubmitting)) {
        buttonText = props?.loadingText
    }

    return (
        <>
            {!linkTag && (
                <button
                    ref={inputElement}
                    className={`rounded-button rounded-button__${
                        props.styleType ? props.styleType : 'primary'
                    }-${props.color ? props.color : 'blue'} ${
                        props.loading || form?.isSubmitting
                            ? `rounded-button__loading`
                            : ''
                    } ${className ?? ''}`}
                    disabled={disabled}
                    type={props?.type}
                    data-performance-meta={encoded}
                    onClick={
                        props?.onClick ? props.onClick : () => handleSubmit
                    }
                    onFocus={handleFocus}
                    name={props.name ?? undefined}
                >
                    {buttonText}
                </button>
            )}
            {linkTag && (
                <a
                    ref={inputElement}
                    className={`rounded-button rounded-button__${
                        props.styleType
                    }-${props.color} ${
                        props.loading || form?.isSubmitting
                            ? `rounded-button__loading`
                            : ''
                    } ${className ?? ''}`}
                    disabled={disabled}
                    data-performance-meta={encoded}
                    onClick={
                        props?.onClick ? props.onClick : () => handleSubmit
                    }
                    onFocus={handleFocus}
                    name={props.name ?? undefined}
                >
                    {buttonText}
                </a>
            )}
        </>
    )
}

export default Button
