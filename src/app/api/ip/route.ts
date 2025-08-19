import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  const cfIp = req.headers.get("cf-connecting-ip");

  let ip =
    forwardedFor?.split(",")[0] ||
    realIp ||
    vercelIp ||
    cfIp ||
    "8.8.8.8";

  if (ip === "::1" || ip === "127.0.0.1") {
    console.log("Detected localhost, trying to get public IP...");

    try {

      const publicIpResponse = await axios.get(
        "https://api.ipify.org?format=json",
        { timeout: 5000 }
      );
      const publicIp = publicIpResponse.data.ip;
      console.log(`Public IP found: ${publicIp}`);
      ip = publicIp;
    } catch (error) {
      console.warn("Could not fetch public IP, falling back to default NYC coords");
      return NextResponse.json({
        ip: "::1",
        lat: 40.7128,
        lon: -74.006,
        city: "New York",
        country: "United States",
        regionName: "New York",
        zip: "10001",
        status: "success",
        isp: "localhost",
        org: "localhost",
        isLocalhost: true,
      });
    }
  }


  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 10000,
      params: {
        fields:
          "status,message,country,regionName,city,zip,lat,lon,query,isp,org",
      },
    });
   console.log("response",response.data)

    return NextResponse.json({
      ip,
     location: response.data,

    });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not fetch geolocation" },
      { status: 500 }
    );
  }
}
