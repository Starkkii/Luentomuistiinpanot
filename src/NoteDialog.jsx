import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useStore } from "./store/useStore";

// Dialogi renderöidään vain kun se on auki, joten lomake alkaa aina tyhjänä.
export default function NoteDialog({ initialCourseId, onClose }) {
  const courses = useStore((s) => s.courses);
  const addNote = useStore((s) => s.addNote);

  const [text, setText] = useState("");
  const [courseId, setCourseId] = useState(initialCourseId ?? "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();

    const newErrors = {};
    if (courseId === "") newErrors.course = "Valitse kurssi.";
    if (!trimmed) newErrors.text = "Kirjoita muistiinpano.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addNote(trimmed, courseId);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Uusi muistiinpano</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Kurssi"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            error={Boolean(errors.course)}
            helperText={errors.course ?? (courses.length === 0 ? "Lisää ensin kurssi sivupalkista." : " ")}
            disabled={courses.length === 0}
            sx={{ mt: 1 }}
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            autoFocus
            multiline
            minRows={4}
            label="Muistiinpano"
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={Boolean(errors.text)}
            helperText={errors.text ?? " "}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Peruuta</Button>
          <Button type="submit" variant="contained" disabled={courses.length === 0}>
            Tallenna
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
