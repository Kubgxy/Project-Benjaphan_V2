import { Request, Response } from "express";
// import Article from "../Models/Article";
import Article from "../Models_GPT/Article"; // Model
import slugify from "slugify";


// 🟢 ดึงบทความทั้งหมด (เฉพาะ published)
export const getAllArticles = async (req: Request, res: Response) => {
  try {
    const { search, tag, category, page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const query: any = {}; // 🟢 ไม่ใช้ isPublished แล้ว

    if (search) {
      query.title = { $regex: search, $options: "i" }; // 🔎 ค้นหา title (case-insensitive)
    }

    if (tag) {
      query.tags = tag; // 🔖 filter จาก tag
    }

    if (category) {
      query.category = category; // 🗂️ filter จาก category
    }

    // 🟡 จัดการ sort
    let sortOptions: any = {};
    if (sortBy === "views") {
      sortOptions = { views: -1 }; // 🔥 เรียงตาม views มาก → น้อย
    } else {
      sortOptions = { createdAt: -1 }; // 🕒 default → ใหม่สุดก่อน
    }

    const articles = await Article.find(query)
      .populate("author", "firstName lastName")
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Article.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      sortBy,
      articles,
    });
  } catch (error) {
    console.error("❌ Error fetching articles:", error);
    res.status(500).json({ message: "ไม่สามารถดึงบทความได้", error });
  }
};

// 🟠 ดึงบทความเดี่ยวด้วย slug
export const getArticleBySlug = async (req: Request, res: Response) => {
    try {
      const rawSlug = req.params.slug;
      const decodedSlug = decodeURIComponent(rawSlug);

      const article = await Article.findOne({ slug: decodedSlug, isPublished: true })
      .populate("author", "firstName lastName");
  
      if (!article) {
        res.status(404).json({ message: "ไม่พบบทความนี้" });
        return
      }
      res.status(200).json({ article });
    } catch (error) {
      console.error("❌ Error fetching article by slug:", error);
      res.status(500).json({ message: "ไม่สามารถดึงบทความได้", error });
    }
  };

export const increaseViewBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const decodedSlug = decodeURIComponent(slug);

    const article = await Article.findOne({ slug: decodedSlug });
    if (!article) {
      res.status(404).json({ message: "ไม่พบบทความ" });
      return;
    }

    article.views += 1;
    await article.save();

    res.status(200).json({ message: "เพิ่ม view สำเร็จ" });
  } catch (error) {
    console.error("❌ Error increasing view:", error);
    res.status(500).json({ message: "เพิ่ม view ล้มเหลว", error });
  }
};
  
// 🟢 สร้างบทความ
export const createArticle = async (req: Request, res: Response) => {
  try {
    const {
      title,
      excerpt,
      content,
      tags,
      category,
      metaDescription,
      isPublished,
    } = req.body;

    const authorId = req.user?.userId;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const thumbnail = files?.["thumbnail"]?.[0]?.path || "";
    const contentImages = (files?.["contentImages"] || []).map((file) => file.path);

    // ✅ แปลง title เป็น slug
    const slug = slugify(title, {
      lower: true,
      strict: true,
      locale: "th",
    });

    // ✅ แปลง tags ให้เป็น array
    let parsedTags: string[] = [];
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((tag: string) => tag.trim()).filter((tag) => tag !== "");
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    const newArticle = new Article({
      title,
      slug, // ✅ ใส่ slug ตรงนี้เลย
      excerpt,
      content,
      thumbnail,
      contentImages,
      tags: parsedTags,
      category,
      metaDescription,
      isPublished: isPublished === "true",
      author: authorId,
    });

    await newArticle.save();

    res.status(201).json({
      message: "📖 บทความถูกสร้างเรียบร้อยแล้ว",
      article: newArticle,
    });
  } catch (error) {
    console.error("❌ Error creating article:", error);
    res.status(500).json({ message: "ไม่สามารถสร้างบทความได้", error });
  }
};

// 🟠 อัปเดตบทความ
export const updateArticle = async (req: Request, res: Response) => {
  try {
    const articleId = req.params.id;
    const {
      title,
      excerpt,
      content,
      tags,
      category,
      metaDescription,
      isPublished,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const thumbnail = files?.["thumbnail"]?.[0]?.path; // optional
    const contentImages = (files?.["contentImages"] || []).map((f) => f.path);

    // ✅ Parse tags เหมือน create
    let parsedTags: string[] = [];
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((t: string) => t.trim()).filter((t) => t !== "");
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    // ✅ Convert isPublished to boolean
    const published = isPublished === "true" || isPublished === true;

    // ✅ Build update object dynamically
    const updateFields: any = {
      title,
      excerpt,
      content,
      category,
      tags: parsedTags,
      metaDescription,
      isPublished: published,
    };

    if (thumbnail) updateFields.thumbnail = thumbnail;
    if (contentImages.length > 0) updateFields.contentImages = contentImages;

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      res.status(404).json({ message: "ไม่พบบทความนี้" });
      return;
    }

    res.status(200).json({
      message: "📝 แก้ไขบทความเรียบร้อยแล้ว",
      article: updatedArticle,
    });
  } catch (error) {
    console.error("❌ Error updating article:", error);
    res.status(500).json({ message: "ไม่สามารถแก้ไขบทความได้", error });
  }
};

// 🟠 ลบบทความ
export const deleteArticle = async (req: Request, res: Response) => {
    try {
      const articleId = req.params.id;
  
      const deletedArticle = await Article.findByIdAndDelete(articleId);
  
      if (!deletedArticle) {
        res.status(404).json({ message: "ไม่พบบทความที่จะลบ" });
        return
      }
  
      res.status(200).json({ message: "🗑️ ลบบทความเรียบร้อยแล้ว" });
    } catch (error) {
      console.error("❌ Error deleting article:", error);
      res.status(500).json({ message: "ไม่สามารถลบบทความได้", error });
    }
  };