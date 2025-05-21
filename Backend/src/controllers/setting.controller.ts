import { Request, Response } from "express";
import { SiteContent } from "../Models_GPT/SiteContent";

// ✅ GET Homepage Content สำหรับฝั่งลูกค้า/Frontend
export const getHomepageContent = async (req: Request, res: Response) => {
  try {
    const content = await SiteContent.findOne();
    if (!content) {
      res.status(404).json({
        success: false,
        message: "ยังไม่มีข้อมูล Homepage",
      });
      return;
    }

    const homepage = content.pages.find((page) => page.name === "homepage");

    if (!homepage) {
        res.status(404).json({
        success: false,
        message: "ยังไม่มีหน้า homepage ในระบบ",
      });
      return 
    }

    res.status(200).json({ success: true, homepage: homepage.fields });
  } catch (err) {
    console.error("Error fetching homepage content:", err);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด", error: err });
  }
};

// ✅ UPDATE Homepage Content สำหรับฝั่ง Admin/Dashboard
export const updateHomepageContent = async (req: Request, res: Response) => {
  try {
    const { bannerTitle, bannerSubtitle, bannerDescription } = req.body;
    const bannerImage = req.file?.path;

    // ✅ เตรียม object ของ fields ใหม่
    const newFields: any = {};
    if (bannerTitle) newFields.bannerTitle = bannerTitle;
    if (bannerSubtitle) newFields.bannerSubtitle = bannerSubtitle;
    if (bannerDescription) newFields.bannerDescription = bannerDescription;
    if (bannerImage) newFields.bannerImage = bannerImage;

    const content = await SiteContent.findOne();

    if (!content) {
      // ถ้ายังไม่มี document ให้สร้างใหม่
      const created = await SiteContent.create({
        pages: [
          {
            name: "homepage",
            fields: newFields,
          },
        ],
      });

      res.status(200).json({ success: true, homepage: newFields });
      return 
    }

    // ถ้ามีอยู่แล้วให้เช็คว่ามีหน้า homepage อยู่หรือยัง
    const homepageIndex = content.pages.findIndex((p) => p.name === "homepage");

    if (homepageIndex !== -1) {
      // ✅ มีอยู่แล้ว → update
      content.pages[homepageIndex].fields = {
        ...content.pages[homepageIndex].fields,
        ...newFields,
      };
    } else {
      // ❌ ไม่มี → เพิ่มใหม่
      content.pages.push({ name: "homepage", fields: newFields });
    }

    await content.save();

    res.status(200).json({ success: true, homepage: newFields });
  } catch (err) {
    console.error("Error updating homepage:", err);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด", error: err });
  }
};
