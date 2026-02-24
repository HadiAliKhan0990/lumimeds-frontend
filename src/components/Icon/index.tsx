import React from "react";

const Icon = ({
	width,
	height,
	children,
	...props
}: React.SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			{children}
		</svg>
	);
};

export default Icon;
