import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";

export const processImage = async (imagePath: string): Promise<string> => {
  const worker = await createWorker("tur"); // Türkçe dil desteği

  try {
    const {
      data: { text },
    } = await worker.recognize(imagePath);
    await worker.terminate();
    return text;
  } catch (error: any) {
    await worker.terminate();
    throw new Error(
      `OCR işlemi başarısız: ${error.message || "Bilinmeyen hata"}`
    );
  }
};
