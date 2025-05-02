import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminAuth } from "@/lib/firebase/firebase-admin";
// Initialize Firebase Admin (singleton)
initAdmin();

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken in request body" },
        { status: 400 }
      );
    }

    const auth =getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 2 weeks
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies(); // ✅ FIX: call once
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session creation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return NextResponse.json(
          { error: "Firebase ID token has expired. Please reauthenticate." },
          { status: 401 }
        );
      }
      if (error.message.includes("invalid signature")) {
        return NextResponse.json(
          { error: "Invalid token signature. Please reauthenticate." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = cookies(); // ✅ FIX
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const auth = getAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: decodedClaims.role || "user",
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
