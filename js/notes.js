// =======================
//  -RUTAS
// =======================
const API_URL = "http://localhost:3000";
const sessionUser = JSON.parse(sessionStorage.getItem("sessionUser"));
const myNotesContainer = document.getElementById("myNotes");
const sharedNotesContainer = document.getElementById("sharedNotes");
const greeting = document.getElementById("greeting");
const newNoteBtn = document.getElementById("newNoteBtn");

// =======================
//  -REDIRECCION SI NO HAY SESION ABIERTA
// =======================
if (!sessionUser) {
  window.location.href = "/assets/login.html";
}

// =======================
//  -CARGAR DATOS AL INICIAR
// =======================
document.addEventListener("DOMContentLoaded", () => {
  if (greeting) greeting.innerText = `Hello, ${sessionUser.fullName}`;
  if (myNotesContainer && sharedNotesContainer) loadNotes();

  if (newNoteBtn) {
    newNoteBtn.addEventListener("click", () => {
      createNote();
    });
  }
});

// =======================
//  -CARGAR NOTAS DEL USUARIO
// =======================
async function loadNotes() {
  const notes = await fetch(`${API_URL}/notes`).then((res) => res.json());

  const myNotes = notes.filter((n) => n.ownerId === sessionUser.id);
  const sharedNotes = notes.filter((n) =>
    n.sharedWith?.some((u) => u.userId === sessionUser.id)
  );

  renderNotes(myNotes, myNotesContainer, true);
  renderNotes(sharedNotes, sharedNotesContainer, false);
}

// =======================
//  -RENDERIZAR NOTAS
// =======================
function renderNotes(notes, container, isOwner) {
  container.innerHTML = "";
  notes.forEach((note) => {
    const col = document.createElement("div");
    col.className = "col-md-3";
    col.innerHTML = `
      <div class="card h-100 cursor-pointer note-card" onclick="goToNote(${
        note.id
      })">
        <div class="card-body">
          <h6 class="fw-bold">${note.title}</h6>
          <p class="text-muted small">${note.description || "No content"}</p>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// =======================
//  -IR A LA NOTA
// =======================
function goToNote(id) {
  window.location.href = `/assets/note.html?id=${id}`;
}

// =======================
//  -CREAR UNA NOTA VACIA
// =======================
async function createNote() {
  const note = {
    title: "Untitled Note",
    description: "",
    ownerId: sessionUser.id,
    sharedWith: [],
    createdAt: new Date().toISOString(),
  };

  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  const data = await res.json();
  goToNote(data.id);
}

// =======================
//  -OBTENER UNA ID DESDE UNA URL
// =======================
function getNoteIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// =======================
//  -EDICION DE NOTAS
// =======================
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");

if (noteTitle && noteContent) {
  const noteId = getNoteIdFromURL();

  fetch(`${API_URL}/notes/${noteId}`)
    .then((res) => res.json())
    .then((note) => {
      noteTitle.innerText = note.title;
      noteContent.value = note.description;

      const isOwner = note.ownerId === sessionUser.id;
      noteContent.disabled = !isOwner;
      saveNoteBtn.style.display = isOwner ? "inline-block" : "none";
      deleteNoteBtn.style.display = isOwner ? "inline-block" : "none";

      // Guardar cambios
      saveNoteBtn.addEventListener("click", async () => {
        const updated = {
          ...note,
          description: noteContent.value,
        };
        await fetch(`${API_URL}/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        alert("Note updated");
      });

      // Eliminar nota
      deleteNoteBtn.addEventListener("click", async () => {
        if (confirm("Delete this note?")) {
          await fetch(`${API_URL}/notes/${noteId}`, {
            method: "DELETE",
          });
          window.location.href = "home.html";
        }
      });

      // Compartir nota
      document.getElementById("shareNoteBtn").addEventListener("click", () => {
        const user = prompt("Enter email or username to share:");
        const permission = confirm("Allow editing?") ? "edit" : "read";

        fetch(`${API_URL}/users`)
          .then((res) => res.json())
          .then((users) => {
            const found = users.find(
              (u) => u.email === user || u.username === user
            );
            if (!found) {
              alert("User not found");
              return;
            }

            if (note.sharedWith.some((s) => s.userId === found.id)) {
              alert("Already shared with this user");
              return;
            }

            note.sharedWith.push({ userId: found.id, permission });
            return fetch(`${API_URL}/notes/${noteId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(note),
            });
          })
          .then(() => {
            alert("Note shared successfully");
          });
      });
    });
}
