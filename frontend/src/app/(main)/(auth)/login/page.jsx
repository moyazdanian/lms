import { redirect } from "next/dist/server/api-utils";
import Login from "./Login";
import { getUser } from "@/lib/api/authApi";

export default async function LoginPage() {
  
  return <Login />;
}
