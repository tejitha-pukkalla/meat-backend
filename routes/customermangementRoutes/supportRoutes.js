const express = require('express');
const router = express.Router();
const supportController = require('../../controllers/customermanagementController/supportController');
const templateController = require('../../controllers/customermanagementController/templateController');
const { verifyToken, checkSuperAdmin } = require('../../middleware/superAdminMiddleware'); // FIXED: Corrected path and imported functions

// Apply authentication middleware to all routes
router.use(verifyToken); // FIXED: Use verifyToken instead of authMiddleware
router.use(checkSuperAdmin); // FIXED: Use checkSuperAdmin instead of superAdminOnly

// Support Ticket Routes
router.get('/tickets', supportController.getAllTickets);
router.get('/tickets/stats', supportController.getTicketStats);
router.get('/tickets/:id', supportController.getTicketById);
router.post('/tickets', supportController.createTicket);
router.patch('/tickets/:id/assign', supportController.assignTicket);
router.post('/tickets/:id/reply', supportController.addReply);
router.post('/tickets/:id/note', supportController.addInternalNote);
router.patch('/tickets/:id/priority', supportController.updatePriority);
router.patch('/tickets/:id/status', supportController.updateStatus);
router.patch('/tickets/:id/close', supportController.closeTicket);
router.patch('/tickets/:id/reopen', supportController.reopenTicket);

// Response Template Routes
router.get('/templates', templateController.getAllTemplates);
router.get('/templates/:id', templateController.getTemplateById);
router.get('/templates/type/:issueType', templateController.getTemplatesByIssueType);
router.post('/templates', templateController.createTemplate);
router.put('/templates/:id', templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);

module.exports = router;