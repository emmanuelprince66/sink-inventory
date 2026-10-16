import { proxyToApi } from "@/lib/apiProxy";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

const getApiPath = async ({ params }: RouteContext) => {
  const { path } = await params;
  return `service/${path.map(encodeURIComponent).join("/")}/`;
};

const queryParams = (request: NextRequest) =>
  Array.from(request.nextUrl.searchParams.keys());

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToApi(request, {
    path: await getApiPath(context),
    forwardParams: queryParams(request),
    label: "complete service request",
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToApi(request, {
    path: await getApiPath(context),
    method: "POST",
    label: "complete service request",
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyToApi(request, {
    path: await getApiPath(context),
    method: "PATCH",
    label: "complete service request",
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToApi(request, {
    path: await getApiPath(context),
    method: "PUT",
    label: "complete service request",
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToApi(request, {
    path: await getApiPath(context),
    method: "DELETE",
    forwardParams: queryParams(request),
    label: "complete service request",
  });
}
