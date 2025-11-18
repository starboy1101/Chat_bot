import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle, LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'size'> {
    name: string | keyof typeof LucideIcons;
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
}

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}: IconProps) {
    const formattedName = typeof name === 'string' ? name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
        : name;
    const IconComponent = LucideIcons[formattedName as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;

    if (!IconComponent) {
        return (
            <HelpCircle
                size={size}
                color="gray"
                strokeWidth={strokeWidth}
                className={className}
                {...props}
            />
        );
    }

    return (
        <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
            {...props}
        />
    );
}

export default Icon;