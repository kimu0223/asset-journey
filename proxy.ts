import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const password = process.env.APP_PASSWORD ?? "asset2024";

  if (authHeader?.startsWith("Basic ")) {
    // Edge Runtime では Buffer 非対応のため atob() を使用
    const decoded = atob(authHeader.slice(6));
    const colonIdx = decoded.indexOf(":");
    const pwd = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : "";
    if (pwd === password) return NextResponse.next();
  }

  return new NextResponse(null, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Asset Journey - 家族の資産ダッシュボード"',
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
