// main.tsx
if (import.meta.env.DEV) {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === "string" &&
        (
          args[0].includes("React Router Future Flag Warning") ||
          args[0].includes("Relative route resolution within Splat routes is changing")
        )
      ) {
        return; // ✅ ปิดเฉพาะ React Router warning 2 ตัวนี้
      }
      originalWarn(...args); // ❗ ที่เหลือแสดงตามปกติ
    };
  }
  
  import { createRoot } from 'react-dom/client';
  import App from './App.tsx';
  import './index.css';
  
  createRoot(document.getElementById("root")!).render(<App />);
  