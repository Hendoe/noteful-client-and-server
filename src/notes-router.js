const express = require('express')
const xss = require('xss')
const NotefulServices = require('./notes-services')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
  noteid: note.noteid,
  name: xss(note.name),
  modified: note.modified,
  folderid: note.folderid,
  content: xss(note.content),
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    NotefulServices.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    console.log(req)
    const { name, content, modified, folderid } = req.body
    const newNote = { name, content, modified, folderid }

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    newNote.folderid = folderid
    NotefulServices.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(`/notes/${note.noteid}`)
          .json(serializeNote(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotefulServices.getById(
      req.app.get('db'),
      req.params.note_noteid
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note))
  })
  .delete((req, res, next) => {
    NotefulServices.deleteNote(
      req.app.get('db'),
      req.params.note_noteid
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter