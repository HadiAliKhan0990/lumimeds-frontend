import React from "react";
import Icon from ".";

const MostEffectiveIcon = ({
	width,
	height,
	fill,
	...props
}: React.SVGProps<SVGSVGElement>) => {
	return (
		<Icon width={width} height={height} fill={fill ?? "none"} {...props}>
			<path
				d="M1.5 0.931641C2.95874 3.30209 5.00097 9.13703 1.5 13.5132"
				stroke="#FFEE00"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M17.1094 0.931641C15.6506 3.30209 13.6084 9.13703 17.1094 13.5132"
				stroke="#FFEE00"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M9.1582 9.68359V11.8717"
				stroke="#FFEE00"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</Icon>
	);
};

export default MostEffectiveIcon;
