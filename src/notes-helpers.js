
export const findFolder = (folders=[], folderid) =>
  folders.find(folder => folder.id === folderid)

export const findNote = (notes=[], noteid) =>
  notes.find(note => note.noteid === parseInt(noteid))

export const getNotesForFolder = (notes=[], folderid) => (
  (!folderid)
    ? notes
    : notes.filter(note => note.folderid === parseInt(folderid))
)

export const countNotesForFolder = (notes=[], folderid) =>
  notes.filter(note => note.folderid === folderid).length
