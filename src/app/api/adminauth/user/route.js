import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const raw_token = cookieStore.get('authToken');  // Getting the cookie from the browser
  const authToken = raw_token?.value;

  if (authToken) {
    try {
      const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        console.log(decodedToken)
      return NextResponse.json({
        email: decodedToken.email,
        uid: decodedToken.userId,
        displayName: decodedToken.displayName,
      }, { status: 200 });
    } catch (error) {
      console.error("Invalid token", error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: 'No token found' }, { status: 401 });
  }
}
