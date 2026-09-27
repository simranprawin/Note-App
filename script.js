"use strict";

const noteForm = document.querySelector("#noteForm");
const noteTitleInput = document.querySelector("#noteTitle");
const noteContentInput = document.querySelector("#noteContent");
const searchInput = document.querySelector("#searchInput");

const notesContainer = document.querySelector("#notesContainer");
const emptyState = document.querySelector("#emptyState");
const noteCount = document.querySelector("#noteCount");

const saveButton = document.querySelector("#saveButton");
const cancelButton = document.querySelector("#cancelButton");
const clearAllButton = document.querySelector("#clearAllButton");
const formTitle = document.querySelector("#formTitle");

const storageKey = "noteNestNotes";

let notes = loadNotes();
let editingNoteId = null;

const colors = [
  "#4f46e5",
  "#0891b2",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#7c3aed"
];

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch (error) {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(storageKey, JSON.stringify(notes));
}

function createId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function updateNoteCount(visibleNotes) {
  const noteWord = visibleNotes.length === 1 ? "note" : "notes";
  noteCount.textContent = `${visibleNotes.length} ${noteWord}`;
}

function getFilteredNotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    return notes;
  }

  return notes.filter(function (note) {
    return (
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)
    );
  });
}

function renderNotes() {
  const visibleNotes = getFilteredNotes();

  notesContainer.innerHTML = "";
  updateNoteCount(visibleNotes);

  if (visibleNotes.length === 0) {
    emptyState.classList.remove("hidden");

    if (notes.length > 0) {
      emptyState.querySelector("h3").textContent =
        "No matching notes";
      emptyState.querySelector("p").textContent =
        "Try searching with different words.";
    } else {
      emptyState.querySelector("h3").textContent =
        "No notes yet";
      emptyState.querySelector("p").textContent =
        "Create your first note to get started.";
    }

    return;
  }

  emptyState.classList.add("hidden");

  visibleNotes.forEach(function (note) {
    const noteCard = document.createElement("article");
    noteCard.className = "note-card";

    if (note.pinned) {
      noteCard.classList.add("pinned");
    }

    noteCard.style.setProperty("--card-color", note.color);

    const titleRow = document.createElement("div");
    titleRow.className = "note-title-row";

    const title = document.createElement("h3");
    title.textContent = note.title;

    titleRow.appendChild(title);

    if (note.pinned) {
      const pinIcon = document.createElement("span");
      pinIcon.className = "pin-icon";
      pinIcon.textContent = "📌";
      pinIcon.title = "Pinned note";
      titleRow.appendChild(pinIcon);
    }

    const content = document.createElement("p");
    content.className = "note-content";
    content.textContent = note.content;

    const date = document.createElement("p");
    date.className = "note-date";
    date.textContent = `Created: ${formatDate(note.createdAt)}`;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const pinButton = document.createElement("button");
    pinButton.className = "note-action";
    pinButton.type = "button";
    pinButton.textContent = note.pinned ? "Unpin" : "Pin";
    pinButton.addEventListener("click", function () {
      togglePin(note.id);
    });

    const editButton = document.createElement("button");
    editButton.className = "note-action";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      editNote(note.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "note-action delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteNote(note.id);
    });

    actions.appendChild(pinButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    noteCard.appendChild(titleRow);
    noteCard.appendChild(content);
    noteCard.appendChild(date);
    noteCard.appendChild(actions);

    notesContainer.appendChild(noteCard);
  });
}

function addNote(title, content) {
  const newNote = {
    id: createId(),
    title: title,
    content: content,
    pinned: false,
    color: colors[notes.length % colors.length],
    createdAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  saveNotes();
  renderNotes();
}

function updateNote(id, title, content) {
  notes = notes.map(function (note) {
    if (note.id === id) {
      return {
        ...note,
        title: title,
        content: content
      };
    }

    return note;
  });

  saveNotes();
  renderNotes();
}

function editNote(id) {
  const note = notes.find(function (item) {
    return item.id === id;
  });

  if (!note) {
    return;
  }

  editingNoteId = id;
  noteTitleInput.value = note.title;
  noteContentInput.value = note.content;
  formTitle.textContent = "Edit your note";
  saveButton.textContent = "Update Note";
  cancelButton.classList.remove("hidden");

  noteTitleInput.focus();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function cancelEdit() {
  editingNoteId = null;
  noteForm.reset();
  formTitle.textContent = "Add a new note";
  saveButton.textContent = "Add Note";
  cancelButton.classList.add("hidden");
}

function deleteNote(id) {
  const shouldDelete = confirm(
    "Are you sure you want to delete this note?"
  );

  if (!shouldDelete) {
    return;
  }

  notes = notes.filter(function (note) {
    return note.id !== id;
  });

  saveNotes();
  renderNotes();

  if (editingNoteId === id) {
    cancelEdit();
  }
}

function togglePin(id) {
  notes = notes.map(function (note) {
    if (note.id === id) {
      return {
        ...note,
        pinned: !note.pinned
      };
    }

    return note;
  });

  notes.sort(function (firstNote, secondNote) {
    return Number(secondNote.pinned) - Number(firstNote.pinned);
  });

  saveNotes();
  renderNotes();
}

function clearAllNotes() {
  if (notes.length === 0) {
    return;
  }

  const shouldClear = confirm(
    "Are you sure you want to delete all notes?"
  );

  if (!shouldClear) {
    return;
  }

  notes = [];
  saveNotes();
  cancelEdit();
  renderNotes();
}

noteForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();

  if (!title || !content) {
    return;
  }

  if (editingNoteId !== null) {
    updateNote(editingNoteId, title, content);
  } else {
    addNote(title, content);
  }

  cancelEdit();
});

cancelButton.addEventListener("click", cancelEdit);
clearAllButton.addEventListener("click", clearAllNotes);
searchInput.addEventListener("input", renderNotes);

renderNotes();