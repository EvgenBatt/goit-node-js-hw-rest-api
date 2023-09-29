const Contact = require("../models/contacts");
const { HttpError, controllerWrapper } = require("../utils");

// Reads a list of contacts from the database and sends them as a JSON response
const listContacts = async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).json(contacts);
};

// Retrieves a contact object from the database based on the provided contactId
const getContactById = async (req, res) => {
  const { contactId } = req.params;

  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw new HttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json(contact);
};

// Adds a new contact to the database based on the data provided in the request body
const addContact = async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json(contact);
};

// Removes a contact from the database based on the provided contactId parameter
const removeContact = async (req, res, next) => {
  const { contactId } = req.params;

  const deleteContact = await await Contact.findByIdAndRemove(contactId);

  if (!deleteContact) {
    throw new HttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json({ message: "Contact deleted" });
};

// Updates a contact in the database based on the provided contactId parameter and request body
const updateContact = async (req, res) => {
  const { contactId } = req.params;

  const editContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  if (!editContact) {
    throw new HttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json(editContact);
};

/**
 * Updates the favorite status of a contact in the database based on the provided contactId parameter
 * and the updated favorite status in the request body
 */
const updateFavoriteContact = async (req, res) => {
  const { contactId } = req.params;
  
  if (req.body.favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }
  
  const editFavorite = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!editFavorite) {
    throw new HttpError(404, `Contact ${contactId} not found`);
  }
  res.status(200).json(editFavorite);
};

module.exports = {
  listContacts: controllerWrapper(listContacts),
  getContactById: controllerWrapper(getContactById),
  addContact: controllerWrapper(addContact),
  removeContact: controllerWrapper(removeContact),
  updateContact: controllerWrapper(updateContact),
  updateFavoriteContact: controllerWrapper(updateFavoriteContact),
};
