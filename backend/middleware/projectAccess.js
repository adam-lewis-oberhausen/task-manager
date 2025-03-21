const mongoose = require('mongoose');
const Project = require('../models/Project');
const Workspace = require('../models/Workspace');

const checkProjectAccess = () => {
  return async (req, res, next) => {
    try {
      const projectId = req.body?.project || req.query?.project;
      
      // If no project ID is provided, skip the check
      if (!projectId) {
        return next();
      }

      // Validate project ID format
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ 
          error: 'Invalid project ID format' 
        });
      }

      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { 'members.user': req.userId },
          { workspace: { $in: await Workspace.find({
            $or: [
              { owner: req.userId },
              { 'members.user': req.userId }
            ]
          }).select('_id') }}
        ]
      })
      .populate('workspace')
      .populate('members.user');

      if (!project) {
        return res.status(403).json({ error: 'Access to project denied' });
      }

      req.project = project;
      next();
    } catch (error) {
      console.error('Project access check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = checkProjectAccess;
