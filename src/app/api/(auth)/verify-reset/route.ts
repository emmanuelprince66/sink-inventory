import { BaseUrl } from "@/constants/base-url";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = `${BaseUrl}auth/verify_reset_code/`;
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

    // Return the successful response to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json(
      { error: "Failed to verify reset code" },
      { status: 500 }
    );
  }
}
