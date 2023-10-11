const express = require("express");

const { isValidId, validateBody, authenticate } = require("../../middlewares");
const {
  contactSchema: { addContactSchema, updateContactFavoriteSchema },
} = require("../../utils");

const ctrl = require("../../controllers/contactControllers");

const router = express.Router();

router.get("/", authenticate, ctrl.listContacts);

router.get("/:contactId", authenticate, isValidId, ctrl.getContactById);

router.post("/", authenticate, validateBody(addContactSchema), ctrl.addContact);

router.delete("/:contactId", authenticate, isValidId, ctrl.removeContact);

router.put("/:contactId", authenticate, isValidId, validateBody(updateContactFavoriteSchema), ctrl.updateContact);

router.patch("/:contactId/favorite", authenticate, isValidId, validateBody(updateContactFavoriteSchema), ctrl.updateFavoriteContact);

module.exports = router;
