import { useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";
import NotesIcon from "@mui/icons-material/Notes";
import { useStore } from "./store/useStore";

// selectedCourseId === null tarkoittaa "kaikki kurssit".
export default function CourseSidebar({ selectedCourseId, onSelect }) {
  const courses = useStore((s) => s.courses);
  const notes = useStore((s) => s.notes);
  const addCourse = useStore((s) => s.addCourse);

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const countFor = (courseId) => notes.filter((n) => n.courseId === courseId).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (courses.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError("Kurssi on jo olemassa.");
      return;
    }

    addCourse(trimmed);
    setName("");
    setError("");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Kurssit
      </Typography>

      <List dense>
        <ListItemButton selected={selectedCourseId === null} onClick={() => onSelect(null)}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <NotesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Kaikki" secondary={`${notes.length} muistiinpanoa`} />
        </ListItemButton>

        {courses.map((course) => (
          <ListItemButton
            key={course.id}
            selected={selectedCourseId === course.id}
            onClick={() => onSelect(course.id)}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SchoolIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={course.name} secondary={`${countFor(course.id)} muistiinpanoa`} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1 }}>
        <TextField
          size="small"
          label="Uusi kurssi"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={Boolean(error)}
          helperText={error}
          fullWidth
        />
        <IconButton type="submit" color="primary" aria-label="Lisää kurssi" sx={{ alignSelf: "flex-start" }}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
