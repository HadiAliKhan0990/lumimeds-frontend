"use client";

import React from "react";
import { IntercomProvider } from "react-use-intercom";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
	return <IntercomProvider appId="kikuq2qk">{children}</IntercomProvider>;
};

export default BaseLayout;
