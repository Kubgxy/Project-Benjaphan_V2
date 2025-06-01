// export function getBaseUrl() {
//   if (typeof window !== "undefined") {
//     // 👉 ฝั่ง browser
//     return ""; // ใช้ path สั้นเช่น /api/... ผ่าน NGINX ได้เลย
//   } else {
//     // 👉 ฝั่ง SSR หรือ Node
//     return process.env.NEXT_PUBLIC_BACKEND_URL || "http://backend:3000";
//   }
// }


export function getBaseUrl() {
  if (import.meta.env.MODE === "development") {
    return import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  }
  return ""; // สำหรับ production จะปล่อยให้ nginx จัดการ
}
