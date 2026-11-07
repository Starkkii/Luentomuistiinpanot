const API_URL =
  import.meta.env.VITE_API_URL ?? "https://luentomuistiinpano-api.netlify.app/.netlify/functions";

// Sovelluksen vanha versio tallensi muistiinpanot tähän avaimeen.
const LEGACY_NOTES_KEY = "note-app-notes";
const LEGACY_THEME_KEY = "note-app-theme";

async function getJson(path) {
  const response = await fetch(`${API_URL}/${path}`);
  if (!response.ok) {
    throw new Error(`Haku epäonnistui: ${path} (${response.status})`);
  }
  return response.json();
}

export const fetchCourses = () => getJson("courses");
export const fetchNotes = () => getJson("notes");

function readLegacyNotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEGACY_NOTES_KEY));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Muuntaa API:n ({ text, course: {id, name} }) ja vanhan version
// ({ title, content, course: "nimi" }) muistiinpanot yhteen muotoon:
// { id, text, courseId, timestamp }
function normalizeNote(note, courses) {
  const courseName = note.course?.name ?? note.course;
  const course =
    courses.find((c) => c.id === note.course?.id) ?? courses.find((c) => c.name === courseName);

  return {
    id: String(note.id),
    text: note.text ?? [note.title, note.content].filter(Boolean).join("\n"),
    courseId: course ? course.id : null,
    timestamp: note.timestamp ?? new Date().toISOString(),
  };
}

// Hakee alkudatan ensimmäisellä käynnistyskerralla. Jos vanhan version
// muistiinpanoja löytyy, käytetään niitä API:n muistiinpanojen sijaan.
export async function loadInitialData() {
  const legacyNotes = readLegacyNotes();
  const [courses, apiNotes] = await Promise.all([fetchCourses(), fetchNotes()]);
  const notes = (legacyNotes ?? apiNotes).map((note) => normalizeNote(note, courses));

  localStorage.removeItem(LEGACY_NOTES_KEY);
  localStorage.removeItem(LEGACY_THEME_KEY);

  return { courses, notes };
}
