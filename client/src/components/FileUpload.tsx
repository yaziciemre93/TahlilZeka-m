import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Fade,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaFileUpload,
  FaRobot,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaSearch,
  FaBrain,
} from "react-icons/fa";
import { BsFiletypeJpg, BsFiletypePdf, BsFiletypePng } from "react-icons/bs";

const FileUpload = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "processing" | "analyzing" | "complete"
  >("idle");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // İşlem adımlarını tanımlayalım
  const steps = [
    { label: "Dosya Yükleniyor", status: "uploading" },
    { label: "OCR İşlemi", status: "processing" },
    { label: "AI Analizi", status: "analyzing" },
    { label: "Tamamlandı", status: "complete" },
  ];

  // Aktif adımı belirleyelim
  const getActiveStep = () => {
    switch (uploadStatus) {
      case "uploading":
        return 0;
      case "processing":
        return 1;
      case "analyzing":
        return 2;
      case "complete":
        return 3;
      default:
        return -1;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.size > MAX_FILE_SIZE) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      setFile(file);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setUploadStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/upload/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.loaded === progressEvent.total) {
              setUploadStatus("processing");
            }
          },
        }
      );

      setUploadStatus("analyzing");

      if (response.data.success) {
        setAnalysis(response.data.data.analysis);
        setUploadStatus("complete");
      } else {
        setError(response.data.error || "Beklenmeyen bir hata oluştu");
        setUploadStatus("idle");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Dosya yükleme sırasında bir hata oluştu"
      );
      setUploadStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const testAI = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      setUploadStatus("uploading");

      // Upload simülasyonu (2 saniye)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploadStatus("processing");

      // OCR simülasyonu (3 saniye)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setUploadStatus("analyzing");

      const response = await fetch("http://localhost:5001/api/upload/test-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setUploadStatus("complete");
      } else {
        setError(data.error || "AI analizi sırasında bir hata oluştu");
        setUploadStatus("idle");
      }
    } catch (error) {
      console.error("Test isteği hatası:", error);
      setError("Test isteği sırasında bir hata oluştu");
      setUploadStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const AnalysisResult = ({ analysis }: { analysis: string }) => {
    const sections = analysis.split(/\d+\./); // Numaralı bölümleri ayır

    return (
      <Box sx={{ mt: 3, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Analiz Sonucu
        </Typography>
        {sections.map(
          (section, index) =>
            section.trim() && (
              <Typography
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                {index}. {section.trim()}
              </Typography>
            )
        )}
      </Box>
    );
  };

  const StepAnimation = ({ status }: { status: string }) => {
    const icons = {
      uploading: FaCloudUploadAlt,
      processing: FaSearch,
      analyzing: FaBrain,
      complete: FaCheckCircle,
    };

    const Icon = icons[status as keyof typeof icons];
    const isComplete = status === "complete";

    return (
      <Box
        sx={{
          width: 60,
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.paper",
          borderRadius: "50%",
          boxShadow: 1,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            rotate: status === "analyzing" ? 360 : 0,
          }}
          transition={{
            duration: status === "analyzing" ? 2 : 0.3,
            repeat: status === "analyzing" ? Infinity : 0,
            ease: "linear",
          }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: isComplete ? "#4caf50" : "#2196f3",
          }}
        >
          <Icon size={32} />
        </motion.div>
      </Box>
    );
  };

  const FileTypeIcon = ({ fileName }: { fileName: string }) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {ext === "pdf" ? (
          <BsFiletypePdf size={24} color="#ff4444" />
        ) : ext === "jpg" || ext === "jpeg" ? (
          <BsFiletypeJpg size={24} color="#4444ff" />
        ) : (
          <BsFiletypePng size={24} color="#44aa44" />
        )}
      </motion.div>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 3,
          border: "2px dashed",
          borderColor: "primary.main",
          borderRadius: 2,
          backgroundColor: "background.default",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
      >
        <input
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            disabled={loading}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            Tahlil Dosyası Seç
          </Button>
        </label>
        {file && (
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <FileTypeIcon fileName={file.name} />
              <Typography sx={{ color: "text.secondary" }}>
                {file.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading}
              sx={{
                py: 1,
                px: 4,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Yükle ve Analiz Et"}
            </Button>
          </Box>
        )}
      </Box>

      {/* Yükleme durumu stepper'ı */}
      <Fade in={uploadStatus !== "idle"} timeout={500}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ width: "100%", mt: 4 }}
        >
          <Stepper activeStep={getActiveStep()} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: index * 0.2,
                      }}
                    >
                      {getActiveStep() === index ? (
                        <StepAnimation status={step.status} />
                      ) : getActiveStep() > index ? (
                        <FaCheckCircle color="#4caf50" size={24} />
                      ) : (
                        <Box sx={{ width: 24, height: 24 }} />
                      )}
                    </motion.div>
                  }
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {step.label}
                  </motion.div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {analysis && <AnalysisResult analysis={analysis} />}

      <Button
        onClick={testAI}
        variant="contained"
        color="secondary"
        disabled={loading}
        sx={{
          mt: 2,
          py: 1,
          px: 4,
          borderRadius: 2,
          textTransform: "none",
        }}
      >
        {loading ? <CircularProgress size={24} /> : "AI Bağlantısını Test Et"}
      </Button>
    </Box>
  );
};

export default FileUpload;
