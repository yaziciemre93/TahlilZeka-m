import { Typography, Box, Paper } from "@mui/material";
import FileUpload from "../components/FileUpload";

const Home = () => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          color: "text.primary",
          mb: 2,
        }}
      >
        TahlilZeka'm
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "background.paper",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 2,
            fontWeight: 500,
          }}
        >
          Sağlık Tahlillerinizi Yapay Zeka ile Analiz Edin
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: "center",
            mb: 3,
          }}
        >
          Tahlil sonuçlarınızı yükleyin, yapay zeka destekli sistemimiz sizin
          için analiz etsin.
        </Typography>
        <FileUpload />
      </Paper>
    </Box>
  );
};

export default Home;
