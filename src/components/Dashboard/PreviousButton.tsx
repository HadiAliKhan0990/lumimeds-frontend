import React, { ButtonHTMLAttributes } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";

const PreviousButton = ({
	style,
	onClick,
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
	return (
		<button
			className="btn-transparent p-0"
			style={{
				background: "transparent",
				fontSize: "14px",
				display: "flex",
				color: "#3060FE",
				alignItems: "center",
				columnGap: "8px",
				...style,
			}}
			onClick={onClick}
			{...rest}
		>
			<MdKeyboardArrowLeft />
			<span style={{ fontSize: "14px" }}>Back</span>
		</button>
	);
};

export default PreviousButton;
