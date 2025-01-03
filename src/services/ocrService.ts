import { createWorker } from "tesseract.js";

const worker = await createWorker({
  logger: (m) => console.log(m),
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
  lang: "tur", // Türkçe dil desteği
});
