import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	containerStyles?: React.CSSProperties | undefined;
}

const Select = ({
	children,
	style,
	className,
	containerStyles,
	...props
}: SelectProps) => {
	return (
		<div className={`select-wrapper ${className}`} style={containerStyles}>
			<select style={{ color: "black", margin: 0, ...style }} {...props}>
				{children}
			</select>
		</div>
	);
};

export default Select;
