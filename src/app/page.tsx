
import { redirect } from "next/navigation";

export default function Home() {
   // Redirect ไปยังหน้าลงทะเบียนทันที
  redirect("/auth/login");
  return (
    <h3  className="text-xl font-bold mb-2 text-left">1. การเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล</h3>
  );
}
