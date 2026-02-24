import React from "react";
import Select from "@/components/Dashboard/Select";

interface SortOption {
	title: string;
	value: string;
}

export interface SummaryItem {
	title: string;
	value: number;
	sortOptions?: SortOption[];
}

const ClientSummary = ({ title, sortOptions, value }: SummaryItem) => {
	return (
		<div
			style={{
				flexGrow: "1",
				borderRadius: "8px",
				padding: "12px",
				background: "white",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<p className="m-0" style={{ fontSize: "16px" }}>
					{title}
				</p>
				{sortOptions && (
					<Select
						className="py-0"
						style={{ background: "transparent", border: 0 }}
					>
						{sortOptions.map(({ title, value }, i) => (
							<option key={i} value={value}>
								{title}
							</option>
						))}
					</Select>
				)}
			</div>
			<p className="m-0" style={{ fontSize: "18px", fontWeight: "700" }}>
				{value}
			</p>
		</div>
	);
};

export default ClientSummary;
