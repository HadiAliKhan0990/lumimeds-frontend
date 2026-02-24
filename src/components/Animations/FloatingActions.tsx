'use client';

import React, { useState } from 'react';

export type FloatingActionPosition =
    | 'top-center'
    | 'top-right'
    | 'top-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'center';

export type SlideFromDirection = 'top' | 'bottom' | 'right' | 'left';

interface FloatingActionsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
    children: React.ReactNode;
    actions: React.ReactNode;
    position?: FloatingActionPosition;
    showOnHover?: boolean;
    blurBg?: boolean;
    slideFrom?: SlideFromDirection;
    offset?: number;
    actionsContainerClassName?: string;
}

export const FloatingActions = ({
    children,
    actions,
    position = 'top-center',
    showOnHover = true,
    blurBg = false,
    slideFrom,
    offset = 8,
    className = '',
    style,
    actionsContainerClassName = '',
    ...props
}: FloatingActionsProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const getPositionAndTransform = (): { positionClasses: string; transformStyle: React.CSSProperties } => {
        const baseClasses = `tw-absolute tw-z-10 tw-transition-all tw-duration-300 tw-ease-in-out ${showOnHover
            ? isHovered
                ? 'tw-opacity-100 tw-pointer-events-auto'
                : 'tw-opacity-0 tw-pointer-events-none'
            : 'tw-opacity-100 tw-pointer-events-auto'
            }`;


        let slideTransform = '';

        // Get slide transform
        if (slideFrom && showOnHover && !isHovered) {
            switch (slideFrom) {
                case 'top':
                    slideTransform = 'translateY(-100%)';
                    break;
                case 'bottom':
                    slideTransform = 'translateY(100%)';
                    break;
                case 'left':
                    slideTransform = 'translateX(-100%)';
                    break;
                case 'right':
                    slideTransform = 'translateX(100%)';
                    break;
                default:
                    slideTransform = 'translate(0, 0)';
                    break;
            }
        }

        // Get position-based classes and transforms
        let positionClasses = baseClasses;
        let transformStyle: React.CSSProperties = {};

        switch (position) {
            case 'top-center':
                positionClasses += ` tw-top-0 tw-left-1/2`;
                transformStyle = {
                    marginTop: `${offset}px`,
                    transform: `translateX(-50%) ${slideTransform}`,
                };
                break;
            case 'top-right':
                positionClasses += ` tw-top-0 tw-right-0`;
                transformStyle = {
                    marginTop: `${offset}px`,
                    marginRight: `${offset}px`,
                    transform: slideTransform || (showOnHover && !isHovered ? 'scale(0.95)' : 'scale(1)'),
                };
                break;
            case 'top-left':
                positionClasses += ` tw-top-0 tw-left-0`;
                transformStyle = {
                    marginTop: `${offset}px`,
                    marginLeft: `${offset}px`,
                    transform: slideTransform || (showOnHover && !isHovered ? 'scale(0.95)' : 'scale(1)'),
                };
                break;
            case 'bottom-center':
                positionClasses += ` tw-bottom-0 tw-left-1/2`;
                transformStyle = {
                    marginBottom: `${offset}px`,
                    transform: `translateX(-50%) ${slideTransform}`,
                };
                break;
            case 'bottom-right':
                positionClasses += ` tw-bottom-0 tw-right-0`;
                transformStyle = {
                    marginBottom: `${offset}px`,
                    marginRight: `${offset}px`,
                    transform: slideTransform || (showOnHover && !isHovered ? 'scale(0.95)' : 'scale(1)'),
                };
                break;
            case 'bottom-left':
                positionClasses += ` tw-bottom-0 tw-left-0`;
                transformStyle = {
                    marginBottom: `${offset}px`,
                    marginLeft: `${offset}px`,
                    transform: slideTransform || (showOnHover && !isHovered ? 'scale(0.95)' : 'scale(1)'),
                };
                break;
            case 'center':
                positionClasses += ` tw-top-1/2 tw-left-1/2`;
                transformStyle = {
                    transform: `translate(-50%, -50%) ${slideTransform}`,
                };
                break;
        }

        return { positionClasses, transformStyle };
    };

    const { positionClasses, transformStyle } = getPositionAndTransform();

    return (
        <div
            className={`tw-relative ${className}`}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            <div
                className={`tw-transition-all tw-duration-300 ${blurBg && isHovered ? 'tw-blur-sm ' : ''}`}
            >
                {children}
            </div>
            <div className={`${positionClasses} ${actionsContainerClassName}`} style={transformStyle}>
                {actions}
            </div>
        </div>
    );
};

