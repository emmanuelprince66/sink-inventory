import { BaseUrl } from "@/constants/base-url";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized - No access token provided" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      source_product_id,
      target_business_id,
      target_product_id,
      quantity,
      batch_id,
    } = body;

    if (!source_product_id || !target_business_id || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiUrl = new URL(`${BaseUrl}product/transfer/`);
    const payload = {
      source_product_id,
      target_business_id,
      quantity,
      ...(target_product_id ? { target_product_id } : {}),
      // Optional. Without it the backend picks the earliest-expiring batch.
      ...(batch_id ? { batch_id } : {}),
    };

    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Under `message` as well as `error`: the backend's refusals are worth
      // reading — "Only 5.00 units available in batch 'BATCH-A'" tells the
      // merchant exactly what to change, where "Failed to transfer product"
      // tells them nothing.
      const message = errorData.message || "Failed to transfer product";
      return NextResponse.json(
        { error: message, message, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data,
      message: "Product transferred successfully",
    });
  } catch (error) {
    console.error("Error transferring product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
