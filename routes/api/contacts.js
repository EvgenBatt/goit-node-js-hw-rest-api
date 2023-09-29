const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/contactControllers");
const { isValidId, validateBody } = require("../../middlewares");
const {
  contactSchema: { addContactSchema, updateContactFavoriteSchema },
} = require("../../utils");

router.get("/", ctrl.listContacts);

router.get("/:contactId", isValidId, ctrl.getContactById);

router.post("/", validateBody(addContactSchema), ctrl.addContact);

router.delete("/:contactId", isValidId, ctrl.removeContact);

router.put("/:contactId", isValidId, validateBody(updateContactFavoriteSchema), ctrl.updateContact);

router.patch("/:contactId/favorite", isValidId, validateBody(updateContactFavoriteSchema), ctrl.updateFavoriteContact);

module.exports = router;
