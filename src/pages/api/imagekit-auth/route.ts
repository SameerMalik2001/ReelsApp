import ImageKit from "imagekit"
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL!,
});

export async function GET() {
  try {
    const authParams = imagekit.getAuthenticationParameters()
    return NextResponse.json(authParams)
  } catch (error) {
    return NextResponse.json(
      {
        error: "image kit auth fail"
      },
      {
        status: 500
      }
    )
  }
}