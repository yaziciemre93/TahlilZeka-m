import express from "express";
import multer from "multer";
import path from "path";
import { processImage } from "../services/ocrService";
import { analyzeResults } from "../services/aiService";

const router = express.Router();

// Dosya yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya PDF yükleyin."
        )
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("file");

router.post("/analyze", (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: "Dosya yükleme hatası: " + err.message,
      });
    } else if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Lütfen bir dosya seçin",
      });
    }

    try {
      // OCR işlemi
      console.log("OCR işlemi başlıyor...");
      const extractedText = await processImage(req.file.path);
      console.log("Çıkarılan metin:", extractedText);

      // AI analizi
      console.log("AI analizi başlıyor...");
      const analysis = await analyzeResults(extractedText);
      console.log("Analiz sonucu:", analysis);

      res.json({
        success: true,
        data: {
          analysis,
          message: "Tahlil sonuçlarınız başarıyla analiz edildi.",
        },
      });
    } catch (error: any) {
      console.error("İşlem hatası:", error);
      res.status(500).json({
        error:
          "Analiz sırasında bir hata oluştu: " +
          (error.message || "Bilinmeyen hata"),
      });
    }
  });
});

// Test endpoint'i ekleyelim
router.post("/test-ai", async (req, res) => {
  try {
    const sampleText = `
      Hemoglobin: 14.2 g/dL
      Glukoz: 95 mg/dL
      Kolesterol: 180 mg/dL
      Vitamin D: 25 ng/mL
    `;

    const analysis = await analyzeResults(sampleText);
    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error("AI Test Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "AI analizi sırasında bir hata oluştu",
    });
  }
});

export default router;
