import React from "react";
import Icon from ".";

const InjectionLargeIcon = ({
	color,
	width,
	height,
	fill,
	...props
}: React.SVGProps<SVGSVGElement>) => {
	return (
		<Icon
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			fill={fill ?? "none"}
			{...props}
		>
			<path
				d="M37.1004 12.4658L45.8004 21.1658C46.8004 22.1658 46.8004 23.8658 45.8004 24.9658L20.9004 49.8658L8.40039 37.3658L33.4004 12.4658C34.4004 11.4658 36.1004 11.4658 37.1004 12.4658Z"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M38.3008 13.566L43.7008 8.16602C44.7008 7.16602 46.4008 7.16602 47.5008 8.16602L50.2008 10.866C51.2008 11.866 51.2008 13.566 50.2008 14.666L44.8008 20.066"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M24.4004 53.3662L4.90039 33.8662"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.9004 41.8662L7.90039 46.8662L11.5004 50.4662L16.5004 45.4662"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M1.33964 46.9656L11.4512 57.0771L14.7745 53.7538L4.66301 43.6422L1.33964 46.9656Z"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M48.8008 9.46621L56.4008 1.86621"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M43.3008 27.4664L30.8008 15.0664"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M27.4016 43.466L23.6016 39.666"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M31.4016 39.366L27.6016 35.666"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M35.3016 35.466L31.6016 31.666"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M39.4016 31.466L35.6016 27.666"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M60.7016 20.966C60.7016 23.366 58.8016 25.266 56.4016 25.266C54.0016 25.266 52.1016 23.366 52.1016 20.966C52.1016 18.566 56.4016 12.666 56.4016 12.666C56.4016 12.666 60.7016 18.566 60.7016 20.966Z"
				stroke={color ?? "white"}
				strokeWidth="2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Icon>
	);
};

export default InjectionLargeIcon;
