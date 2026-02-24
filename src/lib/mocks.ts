export const PATIENTS = [
	{
		firstName: "Yanina",
		lastName: "Katsov",
		email: "katsov.yanina@gmail.com",
		phone: "3124938165",
		dob: new Date(1987, 0, 27).toLocaleDateString("en-US"),
		address: {
			billingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
			shippingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
		},
		remarks: {
			orderNote:
				"Done placing order for 1st month (.25mg) Done placing order for 2nd month (.50mg)",
		},
	},
	{
		firstName: "John",
		lastName: "Doe",
		email: "johndoe@gmail.com",
		phone: "3124938166",
		dob: new Date(1985, 0, 27).toLocaleDateString("en-US"),
		address: {
			billingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
			shippingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
		},
		remarks: {
			orderNote:
				"Done placing order for 1st month (.25mg) Done placing order for 2nd month (.50mg)",
		},
	},
	{
		firstName: "Jane",
		lastName: "Doe",
		email: "janedoe@gmail.com",
		phone: "3124938167",
		dob: new Date(1988, 0, 27).toLocaleDateString("en-US"),
		address: {
			billingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
			shippingAddress: {
				street: "jhbgfcdxsfgyhui",
				city: "uiytrety",
				zip: "1234567",
				region: "United States",
			},
		},
		remarks: {
			orderNote:
				"Done placing order for 1st month (.25mg) Done placing order for 2nd month (.50mg)",
		},
	},
];

export const VIDEO_CALLS = [
	{
		patient: PATIENTS[0],
		date: new Date(1985, 0, 27).toLocaleDateString("en-US"),
		agent: "Hazel",
		leadsFrom: "FB - Gina",
		notes: "Left VM. Sent text message as well.",
		status: "No Show",
	},
	{
		patient: PATIENTS[1],
		date: new Date(1985, 0, 27).toLocaleDateString("en-US"),
		agent: "Hazel",
		leadsFrom: null,
		notes:
			"Tirzepatide 15mg last dose, wants 3month plan and all meds to be ship one time. Prefer Valiant and Olympia",
		status: "Show up",
	},
	{
		patient: PATIENTS[2],
		date: new Date(1985, 0, 27).toLocaleDateString("en-US"),
		agent: "Hazel",
		leadsFrom: "FB - Gina",
		notes: "Left VM. Sent text message as well.",
		status: "Resched",
	},
];

export const ORDERS = [
	{
		patient: PATIENTS[0],
		id: "535",
		dateOrdered: new Date(2023, 0, 27).toLocaleDateString("en-US"),
		dateReceived: new Date(2023, 3, 27).toLocaleDateString("en-US"),
		medication: "Tirzepatide",
		dosage: "2.4mg",
		plan: "Monthly",
		amount: 309,
		code: "lumifallinactive",
		pharmacy: "Beaker",
		status: "Pending",
		tracking: "1z80y13w0141434467",
	},
	{
		patient: PATIENTS[1],
		id: "536",
		dateOrdered: new Date(2023, 1, 27).toLocaleDateString("en-US"),
		dateReceived: new Date(2023, 3, 27).toLocaleDateString("en-US"),
		medication: "Tirzepatide",
		dosage: "2.4mg",
		plan: "Monthly",
		amount: 309,
		code: "lumifallinactive",
		pharmacy: "Beaker",
		status: "New",
		tracking: "1z80y13w0141434468",
	},
	{
		patient: PATIENTS[2],
		id: "537",
		dateOrdered: new Date(2023, 2, 27).toLocaleDateString("en-US"),
		dateReceived: new Date(2023, 3, 27).toLocaleDateString("en-US"),
		medication: "Tirzepatide",
		dosage: "2.4mg",
		plan: "Monthly",
		amount: 309,
		code: "lumifallinactive",
		pharmacy: "Beaker",
		status: "Delivered",
		tracking: "1z80y13w0141434469",
	},
];

export const SALES = [
	{
		patient: PATIENTS[0],
		agent: "Hazel",
		code: 30,
		commission: "(payment c/o Lisa Panah)",
	},
	{
		patient: PATIENTS[1],
		agent: "Hazel",
		code: 30,
		commission: null,
	},
	{
		patient: PATIENTS[2],
		agent: "Hazel",
		code: 30,
		commission: "textla message",
	},
];
