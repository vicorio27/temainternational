import { create } from "zustand";
import type { Note } from "../types/note";
import { loadNotes, saveNotes } from "../utils/persistence";

interface NotesState {
  notes: Note[];
  maxZIndex: number;

  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id">>) => void;
  removeNote: (id: string) => void;
  bringToFront: (id: string) => void;
  loadFromStorage: () => void;
  persistToStorage: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  maxZIndex: 0,

  addNote: (note) =>
    set((state) => {
      const newZIndex = state.maxZIndex + 1;
      const newNote = { ...note, zIndex: newZIndex };
      const notes = [...state.notes, newNote];
      return { notes, maxZIndex: newZIndex };
    }),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),

  bringToFront: (id) =>
    set((state) => {
      const newZIndex = state.maxZIndex + 1;
      return {
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, zIndex: newZIndex } : n
        ),
        maxZIndex: newZIndex,
      };
    }),

  loadFromStorage: () => {
    const notes = loadNotes();
    const maxZIndex = notes.reduce((max, n) => Math.max(max, n.zIndex), 0);
    set({ notes, maxZIndex });
  },

  persistToStorage: () => {
    saveNotes(get().notes);
  },
}));
