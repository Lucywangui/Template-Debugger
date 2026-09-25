// Shared types for study-note content. Kept dependency-free so the generated
// notes module and the build script can both import it without cycles.

export interface NoteBlock {
  heading: string;
  paragraphs: string[];
  points?: string[];
}

/** A drill-down section within a topic (built from a source article's sections). */
export interface NoteSubtopic {
  name: string;
  paragraphs: string[];
}

export interface NoteSource {
  title: string;
  url: string;
  /** Human label for the source site, e.g. "Wikipedia". */
  site: string;
  /** SPDX-ish licence label, e.g. "CC BY-SA 4.0". */
  license: string;
}

export interface GeneratedNote {
  /** 1–3 paragraphs defining the topic. */
  overview: string[];
  /** Navigable sub-sections of the topic. May be empty. */
  subtopics: NoteSubtopic[];
  sources: NoteSource[];
}
