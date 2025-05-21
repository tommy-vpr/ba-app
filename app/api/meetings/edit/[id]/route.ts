import { getHubspotCredentials } from "@/lib/getHubspotCredentials";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // ✅ needed for dynamic route

export async function PUT(req: NextRequest) {
  // Extract the [id] from the pathname
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing ID in URL" }, { status: 400 });
  }

  const { title, body, outcome } = await req.json();

  const cookieStore = await cookies();
  const brand = (cookieStore.get("selected_brand")?.value ??
    "litto-cannabis") as "litto-cannabis" | "skwezed";

  const { baseUrl, token } = getHubspotCredentials(brand);

  try {
    const res = await fetch(`${baseUrl}/crm/v3/objects/meetings/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          hs_meeting_title: title,
          hs_meeting_body: body,
          hs_meeting_outcome: outcome,
        },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// import { getHubspotCredentials } from "@/lib/getHubspotCredentials";
// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic"; // ✅ required for dynamic API routes

// export async function PATCH(
//   req: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params; // ✅ await the promise
//   const { title, body, outcome } = await req.json();

//   const cookieStore = await cookies();
//   const brand = (cookieStore.get("selected_brand")?.value ?? "litto-cannabis") as
//     | "litto-cannabis"
//     | "skwezed";

//   const { baseUrl, token } = getHubspotCredentials(brand);

//   try {
//     const res = await fetch(`${baseUrl}/crm/v3/objects/meetings/${id}`, {
//       method: "PATCH",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         properties: {
//           hs_meeting_title: title,
//           hs_meeting_body: body,
//           hs_meeting_outcome: outcome,
//         },
//       }),
//     });

//     const result = await res.json();
//     if (!res.ok) {
//       return NextResponse.json(
//         { error: result.message },
//         { status: res.status }
//       );
//     }

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
