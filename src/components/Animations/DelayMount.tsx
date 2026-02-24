"use client"
import React from 'react'
import { useEffect, useState } from 'react'


export interface DelayMountProps extends React.ComponentPropsWithoutRef<'div'> {
    delayTime?: number
}
export const DelayMount = ({ children, delayTime = 200 }: DelayMountProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setMounted(true)
        }, delayTime)

        return () => clearTimeout(timeout)
    }, [])

    if (!mounted) return null
    return children
}
