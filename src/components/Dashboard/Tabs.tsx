"use client";

import React from "react";

interface Props {
	items: string[];
	activeIndex: number;
	className?: string;
	setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const Tabs = ({ items, activeIndex, setActiveIndex, className }: Props) => {
	return (
		<div className={`tab-group ${className}`}>
			{items.map((item, index) => (
				<button
					onClick={() => setActiveIndex(index)}
					key={index}
					className={`tab-button ${activeIndex === index ? "active" : ""}`}
					id={`tab-${index}`}
				>
					{item}
				</button>
			))}
		</div>
	);
};

export default Tabs;
