import Swal from 'sweetalert2';

// ✅ แจ้งเตือน Success

export const showSuccess = (message: string, timer: number = 1500) => {
  Swal.fire({
    icon: 'success',
    title: 'สำเร็จ!',
    text: message,
    confirmButtonColor: '#d4af37', // สีทองแบบ luxury
    timer: timer,                   // 🟢 ปรับเวลาตรงนี้ (ms)
    timerProgressBar: true,         // ✅ แถบเวลาขึ้นโชว์
    showConfirmButton: false        // ❌ ไม่ต้องให้กดปุ่ม ถ้าอยากให้ปิดเอง
  });
};


// ❌ แจ้งเตือน Error
export const showError = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด!',
    text: message,
    confirmButtonColor: '#d33',
  });
};

// ⚠️ แจ้งเตือน Warning + Confirm
export const showConfirm = async (message: string) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยืนยันการทำรายการ?',
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#d4af37',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
  });
  return result.isConfirmed;
};
