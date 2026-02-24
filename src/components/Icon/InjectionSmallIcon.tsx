import React from "react";
import Icon from ".";

const InjectionSmallIcon = ({
	color,
	width,
	height,
	fill,
	...props
}: React.SVGProps<SVGSVGElement>) => {
	return (
		<Icon
			style={{ transform: "translateY(5px)" }}
			width={width}
			height={height}
			fill={fill ?? "none"}
			{...props}
		>
			<path
				d="M12.0108 4.76316L14.6896 7.44197C14.9975 7.74988 14.9975 8.27332 14.6896 8.61202L7.02269 16.279L3.17383 12.4301L10.8716 4.76316C11.1795 4.45525 11.7029 4.45525 12.0108 4.76316Z"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.3809 5.10165L14.0436 3.43894C14.3515 3.13103 14.8749 3.13103 15.2136 3.43894L16.045 4.27029C16.3529 4.5782 16.3529 5.10165 16.045 5.44035L14.3823 7.10306"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.10189 17.3568L2.09766 11.3525"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M4.56103 13.8164L3.02148 15.356L4.12996 16.4644L5.6695 14.9249"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M0.999847 15.3866L4.11328 18.5L5.13658 17.4767L2.02314 14.3633L0.999847 15.3866Z"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.6152 3.84011L17.9553 1.5"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13.9211 9.38155L10.0723 5.56348"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.02357 14.3097L7.85352 13.1396"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M10.256 13.0465L9.08594 11.9072"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.4576 11.8458L10.3184 10.6758"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.7189 10.6134L11.5488 9.44336"
				stroke={color ?? "white"}
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Icon>
	);
};

export default InjectionSmallIcon;
