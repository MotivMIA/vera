import { createFrontendApiProxyHandlers } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export const { GET, POST, PUT, PATCH, DELETE } = createFrontendApiProxyHandlers();
