import { create } from "zustand";
import { persist } from "zustand/middleware";

// Koko sovelluksen tila. persist-middleware tallentaa tilan automaattisesti
// localStorageen ja lataa sen takaisin, kun sivu avataan uudelleen.
export const useStore = create(
  persist(
    (set) => ({
      courses: [],
      notes: [],
      initialized: false, // onko alkudata jo haettu API:sta
      darkMode: true,

      // Asetetaan vain kerran, jotta API-data ei koskaan ylikirjoita omia muistiinpanoja.
      setInitialData: (courses, notes) =>
        set((state) => (state.initialized ? {} : { courses, notes, initialized: true })),

      addCourse: (name) =>
        set((state) => ({
          courses: [...state.courses, { id: crypto.randomUUID(), name }],
        })),

      addNote: (text, courseId) =>
        set((state) => ({
          notes: [
            ...state.notes,
            { id: crypto.randomUUID(), text, courseId, timestamp: new Date().toISOString() },
          ],
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: "muistiinpanot" }
  )
);
