import { NextResponse } from "next/server";
import { BaseUrl } from "@/constants/base-url";

export async function POST(request: Request) {
  const url = `${BaseUrl}auth/signup/`;

  try {
    const requestData = await request.json();
    console.log("Registration request data:", requestData);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    console.log("response", response);

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Registration failed - Server response:", responseData);
      // Return the exact error from the server with original status code
      return NextResponse.json(
        responseData, // Return the server's exact error response
        { status: response.status } // Maintain original status code
      );
    }

    console.log("Registration successful:", responseData);

    // Return success response exactly as received from server
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Registration processing error:", error);

    // Return detailed error information
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
