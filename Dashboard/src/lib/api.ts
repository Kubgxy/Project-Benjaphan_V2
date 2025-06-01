export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // 👉 ฝั่ง browser
    return ""; // ใช้ path สั้นเช่น /api/... ผ่าน NGINX ได้เลย
  } else {
    // 👉 ฝั่ง SSR หรือ Node
    return "http://backend:3000";
  }
}


// export function getBaseUrl() {
//   if (process.env.NODE_ENV === "development") {
//     return "http://localhost:3000";
//   }
//   return ""; // ใช้ path สั้น ๆ ใน Production ที่มี NGINX reverse proxy แล้ว
// }