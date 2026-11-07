import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Drawer,
  Fab,
  IconButton,
  InputAdornment,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

import CourseSidebar from "./CourseSidebar";
import NoteDialog from "./NoteDialog";
import NoteList from "./NoteList";
import { loadInitialData } from "./data/api";
import { useStore } from "./store/useStore";

const DRAWER_WIDTH = 260;

export default function App() {
  const courses = useStore((s) => s.courses);
  const notes = useStore((s) => s.notes);
  const initialized = useStore((s) => s.initialized);
  const darkMode = useStore((s) => s.darkMode);
  const setInitialData = useStore((s) => s.setInitialData);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const isMobile = useMediaQuery("(max-width:900px)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode: darkMode ? "dark" : "light", primary: { main: "#6366f1" } },
        shape: { borderRadius: 12 },
      }),
    [darkMode]
  );

  // Alkudata haetaan API:sta vain ensimmäisellä käynnistyskerralla.
  // Sen jälkeen kaikki tulee localStoragesta (ks. useStore).
  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const { courses, notes } = await loadInitialData();
      setInitialData(courses, notes);
    } catch {
      setLoadError(true);
    }
  }, [setInitialData]);

  useEffect(() => {
    if (!initialized) load();
  }, [initialized, load]);

  const query = search.trim().toLowerCase();
  const filteredNotes = notes
    .filter((n) => selectedCourseId === null || n.courseId === selectedCourseId)
    .filter((n) => n.text.toLowerCase().includes(query))
    .reverse(); // uusimmat ensin (filter palauttaa uuden taulukon)

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const emptyText = query
    ? "Haulla ei löytynyt muistiinpanoja."
    : "Lisää uusi muistiinpano painamalla plus-painiketta.";

  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} aria-label="Avaa kurssit" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Luentomuistiinpanot
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Vaihda teema">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? drawerOpen : true}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: isMobile ? undefined : DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          <Toolbar />
          <CourseSidebar selectedCourseId={selectedCourseId} onSelect={handleSelectCourse} />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, pb: 12 }}>
          <Toolbar />
          <Container maxWidth="md" disableGutters>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              {selectedCourse ? selectedCourse.name : "Kaikki muistiinpanot"}
            </Typography>

            <TextField
              fullWidth
              placeholder="Hae muistiinpanoja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {!initialized && !loadError && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Ladataan tietoja...
              </Alert>
            )}

            {loadError && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={load}>
                    Yritä uudelleen
                  </Button>
                }
              >
                Tietojen lataus epäonnistui. Tarkista verkkoyhteys.
              </Alert>
            )}

            {initialized && <NoteList notes={filteredNotes} emptyText={emptyText} />}
          </Container>
        </Box>

        <Fab
          color="primary"
          onClick={() => setDialogOpen(true)}
          aria-label="Lisää muistiinpano"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
        >
          <AddIcon />
        </Fab>

        {dialogOpen && (
          <NoteDialog initialCourseId={selectedCourseId} onClose={() => setDialogOpen(false)} />
        )}
      </Box>
    </ThemeProvider>
  );
}
