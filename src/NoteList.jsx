import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useStore } from "./store/useStore";

// API palauttaa ajat muodossa "2022-10-23 13:13:13", joten välilyönti vaihdetaan T:ksi.
function formatDate(timestamp) {
  const date = new Date(String(timestamp).replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" });
}

export default function NoteList({ notes, emptyText }) {
  const courses = useStore((s) => s.courses);
  const deleteNote = useStore((s) => s.deleteNote);

  if (notes.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">Ei muistiinpanoja</Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const courseName = (courseId) => courses.find((c) => c.id === courseId)?.name ?? "Ei kurssia";

  const handleDelete = (id) => {
    if (window.confirm("Poistetaanko muistiinpano?")) {
      deleteNote(id);
    }
  };

  return (
    <Stack spacing={2}>
      {notes.map((note) => (
        <Card key={note.id} variant="outlined">
          <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", mb: 1 }}>
                {note.text}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={courseName(note.courseId)} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(note.timestamp)}
                </Typography>
              </Stack>
            </Box>
            <IconButton onClick={() => handleDelete(note.id)} color="error" aria-label="Poista muistiinpano">
              <DeleteIcon />
            </IconButton>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
