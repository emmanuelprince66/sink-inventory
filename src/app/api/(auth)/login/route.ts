import { NextResponse } from "next/server";
import { BaseUrl } from "@/constants/base-url";

export async function POST(request: Request) {
  const url = `${BaseUrl}auth/login/`;
  const requestData = await request.json();

  console.log("Request data:", requestData);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      // Try to get the error details from response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }

      console.error("API Error Response:", errorData);

      // Return the actual error from the API
      return NextResponse.json(
        {
          error: "Login failed",
          details: errorData,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API Success Response:", data);

    const authData = {
      user: data,
      token: "dummy-jwt-token",
      expiresIn: 3600,
    };

    return NextResponse.json(authData);
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: "Failed to process login",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
