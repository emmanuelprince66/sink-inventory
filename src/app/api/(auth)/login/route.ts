import { BaseUrl } from "@/constants/base-url";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = `${BaseUrl}auth/login/`;
  const requestData = await request.json();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();

    // Return JSON response instead of redirect
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Set-Cookie": [
          `accessToken=${
            data.tokens.access
          }; Path=/; HttpOnly; SameSite=Strict; Max-Age=432000${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
          }`, // 5 days in seconds (5 * 24 * 60 * 60 = 432000)
          `refreshToken=${
            data.tokens.refresh
          }; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
          }`, // 7 days remains unchanged
          `user=${JSON.stringify(
            data
          )}; Path=/; SameSite=Strict; Max-Age=604800${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
          }`,
        ].join(", "),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}
