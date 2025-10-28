const ResponseTemplate = require('../../models/ResponseTemplate');

// Get all response templates
exports.getAllTemplates = async (req, res) => {
  try {
    const { issueType, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (issueType) query.issueType = issueType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const templates = await ResponseTemplate.find(query)
      .populate('createdBy lastModifiedBy', 'name email')
      .sort(sortOptions)
      .lean();

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }

    const template = await ResponseTemplate.findById(id)
      .populate('createdBy lastModifiedBy', 'name email')
      .lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { title, issueType, content, isAutoResponse } = req.body;
    const adminId = req.superAdmin.id;

    // Validate required fields
    if (!title || !issueType || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, issueType, content'
      });
    }

    // If setting as auto-response, disable other auto-responses
    if (isAutoResponse) {
      await ResponseTemplate.updateMany(
        { isAutoResponse: true },
        { isAutoResponse: false }
      );
    }

    const template = new ResponseTemplate({
      title,
      issueType,
      content,
      isAutoResponse: isAutoResponse || false,
      createdBy: adminId
    });

    await template.save();

    const populatedTemplate = await ResponseTemplate.findById(template._id)
      .populate('createdBy', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: populatedTemplate
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issueType, content, isAutoResponse, isActive } = req.body;
    const adminId = req.superAdmin.id;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }

    const template = await ResponseTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // If setting as auto-response, disable other auto-responses
    if (isAutoResponse && !template.isAutoResponse) {
      await ResponseTemplate.updateMany(
        { isAutoResponse: true, _id: { $ne: id } },
        { isAutoResponse: false }
      );
    }

    if (title !== undefined) template.title = title;
    if (issueType !== undefined) template.issueType = issueType;
    if (content !== undefined) template.content = content;
    if (isAutoResponse !== undefined) template.isAutoResponse = isAutoResponse;
    if (isActive !== undefined) template.isActive = isActive;
    template.lastModifiedBy = adminId;

    await template.save();

    const updatedTemplate = await ResponseTemplate.findById(id)
      .populate('createdBy lastModifiedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template ID format'
      });
    }

    const template = await ResponseTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
};

// Get templates by issue type (for quick access)
exports.getTemplatesByIssueType = async (req, res) => {
  try {
    const { issueType } = req.params;

    if (!issueType) {
      return res.status(400).json({
        success: false,
        message: 'Issue type is required'
      });
    }

    const templates = await ResponseTemplate.find({
      issueType,
      isActive: true
    })
      .select('title content usageCount')
      .sort({ usageCount: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};