const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const ResourceVersion = require('../models/ResourceVersion');
const User = require('../models/User');

// Create a new version of a resource
const createVersion = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const {
      changeType = 'minor',
      changeDescription,
      scheduledPublishAt,
      ...updateData
    } = req.body;

    // Find the original resource
    const originalResource = await Resource.findById(resourceId);
    if (!originalResource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Check permissions
    if (originalResource.createdBy.toString() !== req.user.id && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to edit this resource'
      });
    }

    // Get current version to compare changes
    const currentVersion = await ResourceVersion.getCurrentVersion(resourceId);
    
    // Create snapshot with updated data
    const newSnapshot = {
      title: updateData.title || originalResource.title,
      description: updateData.description || originalResource.description,
      type: updateData.type || originalResource.type,
      category: updateData.category || originalResource.category,
      difficulty: updateData.difficulty || originalResource.difficulty,
      targetAudience: updateData.targetAudience || originalResource.targetAudience,
      content: { ...originalResource.content, ...updateData.content },
      author: { ...originalResource.author, ...updateData.author },
      tags: updateData.tags || originalResource.tags,
      triggers: updateData.triggers || originalResource.triggers,
      contentWarning: updateData.contentWarning || originalResource.contentWarning,
      accessibility: { ...originalResource.accessibility, ...updateData.accessibility },
      qualityScore: updateData.qualityScore || originalResource.qualityScore,
      isVerified: updateData.isVerified !== undefined ? updateData.isVerified : originalResource.isVerified
    };

    // Detect changes between current and new version
    const changes = detectChanges(currentVersion?.snapshot || originalResource.toObject(), newSnapshot);

    // Create new version
    const newVersion = await ResourceVersion.create({
      resourceId,
      changeType,
      changeDescription: changeDescription || `${changeType.charAt(0).toUpperCase() + changeType.slice(1)} update to resource`,
      changes,
      snapshot: newSnapshot,
      createdBy: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending_review',
      scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null
    });

    const populatedVersion = await ResourceVersion.findById(newVersion._id)
      .populate('createdBy', 'firstName lastName displayName')
      .populate('resourceId', 'title category type');

    res.status(201).json({
      status: 'success',
      message: 'New resource version created successfully',
      data: { version: populatedVersion }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get version history for a resource
const getVersionHistory = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { limit = 50, includeMetrics = 'false' } = req.query;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    const versions = await ResourceVersion.getVersionHistory(resourceId, { limit: parseInt(limit) });

    // Include performance metrics if requested
    if (includeMetrics === 'true') {
      for (let version of versions) {
        // Calculate metrics for this version (simplified)
        const versionMetrics = await calculateVersionMetrics(version);
        version.metrics = versionMetrics;
      }
    }

    res.status(200).json({
      status: 'success',
      results: versions.length,
      data: {
        resource: {
          id: resource._id,
          title: resource.title,
          category: resource.category,
          type: resource.type
        },
        versions
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a specific version
const getVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await ResourceVersion.findById(versionId)
      .populate('resourceId', 'title category type')
      .populate('createdBy', 'firstName lastName displayName')
      .populate('approvedBy', 'firstName lastName displayName')
      .populate('reviewHistory.reviewer', 'firstName lastName displayName');

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { version }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Compare two versions
const compareVersions = async (req, res) => {
  try {
    const { versionId, targetVersionId } = req.params;

    const [version1, version2] = await Promise.all([
      ResourceVersion.findById(versionId).populate('resourceId', 'title'),
      ResourceVersion.findById(targetVersionId).populate('resourceId', 'title')
    ]);

    if (!version1 || !version2) {
      return res.status(404).json({
        status: 'error',
        message: 'One or both versions not found'
      });
    }

    if (version1.resourceId._id.toString() !== version2.resourceId._id.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Versions must belong to the same resource'
      });
    }

    const diff = version2.createDiff(version1);

    res.status(200).json({
      status: 'success',
      data: {
        resource: {
          id: version1.resourceId._id,
          title: version1.resourceId.title
        },
        comparison: {
          from: {
            version: version1.version,
            createdAt: version1.createdAt
          },
          to: {
            version: version2.version,
            createdAt: version2.createdAt
          },
          diff
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Approve a version (admin/moderator only)
const approveVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { notes, makeCurrentVersion = true } = req.body;

    const version = await ResourceVersion.findById(versionId)
      .populate('resourceId', 'title category type');

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    // Add review to history
    await version.addReview(req.user.id, 'approved', notes);

    // Optionally make this the current version
    if (makeCurrentVersion) {
      await version.promoteToCurrentVersion();
      
      // Update the main resource with the approved version data
      await Resource.findByIdAndUpdate(version.resourceId._id, version.snapshot);
    }

    const updatedVersion = await ResourceVersion.findById(versionId)
      .populate('createdBy', 'firstName lastName displayName')
      .populate('approvedBy', 'firstName lastName displayName')
      .populate('resourceId', 'title category type');

    res.status(200).json({
      status: 'success',
      message: 'Version approved successfully',
      data: { version: updatedVersion }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reject a version (admin/moderator only)
const rejectVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection notes are required'
      });
    }

    const version = await ResourceVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    await version.addReview(req.user.id, 'rejected', notes);

    const updatedVersion = await ResourceVersion.findById(versionId)
      .populate('createdBy', 'firstName lastName displayName')
      .populate('resourceId', 'title category type');

    res.status(200).json({
      status: 'success',
      message: 'Version rejected',
      data: { version: updatedVersion }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Rollback to a previous version
const rollbackToVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { rollbackReason } = req.body;

    const version = await ResourceVersion.findById(versionId);
    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    if (!version.canRollback) {
      return res.status(400).json({
        status: 'error',
        message: 'This version cannot be rolled back to'
      });
    }

    // Create rollback record
    version.rolledBackBy = req.user.id;
    version.rolledBackAt = new Date();
    version.rollbackReason = rollbackReason || 'Manual rollback';

    // Promote this version to current
    await version.promoteToCurrentVersion();

    // Update the main resource
    await Resource.findByIdAndUpdate(version.resourceId, version.snapshot);

    const updatedVersion = await ResourceVersion.findById(versionId)
      .populate('resourceId', 'title category type')
      .populate('rolledBackBy', 'firstName lastName displayName');

    res.status(200).json({
      status: 'success',
      message: 'Successfully rolled back to previous version',
      data: { version: updatedVersion }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get pending versions for review (admin/moderator only)
const getPendingVersions = async (req, res) => {
  try {
    const { limit = 20, category, type } = req.query;

    let versions = await ResourceVersion.getPendingReviews({ limit: parseInt(limit) });

    // Filter by category or type if specified
    if (category || type) {
      versions = versions.filter(version => {
        if (category && version.resourceId.category !== category) return false;
        if (type && version.resourceId.type !== type) return false;
        return true;
      });
    }

    res.status(200).json({
      status: 'success',
      results: versions.length,
      data: { versions }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Schedule version publication
const schedulePublication = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { scheduledPublishAt } = req.body;

    if (!scheduledPublishAt) {
      return res.status(400).json({
        status: 'error',
        message: 'Scheduled publish date is required'
      });
    }

    const scheduleDate = new Date(scheduledPublishAt);
    if (scheduleDate <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Scheduled date must be in the future'
      });
    }

    const version = await ResourceVersion.findByIdAndUpdate(
      versionId,
      { scheduledPublishAt: scheduleDate },
      { new: true }
    ).populate('resourceId', 'title category type');

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Version publication scheduled successfully',
      data: { version }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Cancel scheduled publication
const cancelScheduledPublication = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await ResourceVersion.findByIdAndUpdate(
      versionId,
      { $unset: { scheduledPublishAt: 1 } },
      { new: true }
    ).populate('resourceId', 'title category type');

    if (!version) {
      return res.status(404).json({
        status: 'error',
        message: 'Version not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Scheduled publication cancelled successfully',
      data: { version }
    });

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get scheduled versions
const getScheduledVersions = async (req, res) => {
  try {
    const { limit = 20, upcoming = 'true' } = req.query;
    
    const query = { scheduledPublishAt: { $exists: true } };
    
    if (upcoming === 'true') {
      query.scheduledPublishAt = { $gte: new Date() };
    }

    const versions = await ResourceVersion.find(query)
      .populate('resourceId', 'title category type')
      .populate('createdBy', 'firstName lastName displayName')
      .sort({ scheduledPublishAt: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: versions.length,
      data: { versions }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get version metrics
const getVersionMetrics = async (req, res) => {
  try {
    const { timeRange = '30d', resourceId } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case '1y':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const matchFilter = { createdAt: dateFilter };
    if (resourceId) {
      matchFilter.resourceId = mongoose.Types.ObjectId(resourceId);
    }

    const [totalVersions, versionsByStatus, versionsByType, recentActivity] = await Promise.all([
      ResourceVersion.countDocuments(matchFilter),
      ResourceVersion.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ResourceVersion.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$changeType', count: { $sum: 1 } } }
      ]),
      ResourceVersion.find(matchFilter)
        .populate('resourceId', 'title category')
        .populate('createdBy', 'firstName lastName displayName')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const metrics = {
      overview: {
        totalVersions,
        timeRange,
        dateRange: {
          start: dateFilter.$gte || new Date(0),
          end: new Date()
        }
      },
      versionsByStatus: versionsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      versionsByType: versionsByType.reduce((acc, item) => {
        acc[item._id || 'unspecified'] = item.count;
        return acc;
      }, {}),
      recentActivity
    };

    res.status(200).json({
      status: 'success',
      data: { metrics }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get version activity feed
const getVersionActivity = async (req, res) => {
  try {
    const { limit = 50, type, status } = req.query;
    
    const matchFilter = {};
    if (type) matchFilter.changeType = type;
    if (status) matchFilter.status = status;

    const activity = await ResourceVersion.find(matchFilter)
      .populate('resourceId', 'title category type')
      .populate('createdBy', 'firstName lastName displayName')
      .populate('approvedBy', 'firstName lastName displayName')
      .populate('rolledBackBy', 'firstName lastName displayName')
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(parseInt(limit));

    // Transform to activity feed format
    const activityFeed = activity.map(version => ({
      id: version._id,
      type: 'version_activity',
      action: version.status,
      resource: {
        id: version.resourceId._id,
        title: version.resourceId.title,
        category: version.resourceId.category,
        type: version.resourceId.type
      },
      version: {
        number: version.version,
        changeType: version.changeType,
        description: version.changeDescription
      },
      actor: version.approvedBy || version.rolledBackBy || version.createdBy,
      timestamp: version.approvedAt || version.rolledBackAt || version.createdAt,
      metadata: {
        reviewCount: version.reviewHistory?.length || 0,
        isScheduled: !!version.scheduledPublishAt,
        scheduledFor: version.scheduledPublishAt
      }
    }));

    res.status(200).json({
      status: 'success',
      results: activityFeed.length,
      data: { activity: activityFeed }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to detect changes between two objects
const detectChanges = (oldData, newData, path = '') => {
  const changes = [];
  
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  
  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const oldValue = oldData?.[key];
    const newValue = newData?.[key];
    
    if (oldValue === undefined && newValue !== undefined) {
      changes.push({
        field: fullPath,
        oldValue: null,
        newValue,
        changeType: 'added'
      });
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push({
        field: fullPath,
        oldValue,
        newValue: null,
        changeType: 'removed'
      });
    } else if (typeof oldValue !== 'object' && oldValue !== newValue) {
      changes.push({
        field: fullPath,
        oldValue,
        newValue,
        changeType: 'modified'
      });
    } else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      changes.push(...detectChanges(oldValue, newValue, fullPath));
    }
  }
  
  return changes;
};

// Helper function to calculate version metrics
const calculateVersionMetrics = async (version) => {
  // This is a simplified version - in a real implementation, 
  // you would track metrics per version more granularly
  return {
    views: Math.floor(Math.random() * 1000), // Placeholder
    likes: Math.floor(Math.random() * 100),
    bookmarks: Math.floor(Math.random() * 50),
    averageRating: Math.round((Math.random() * 4 + 1) * 10) / 10,
    engagementRate: Math.round((Math.random() * 0.15 + 0.02) * 100) / 100
  };
};

module.exports = {
  createVersion,
  getVersionHistory,
  getVersion,
  compareVersions,
  approveVersion,
  rejectVersion,
  rollbackToVersion,
  getPendingVersions,
  schedulePublication,
  cancelScheduledPublication,
  getScheduledVersions,
  getVersionMetrics,
  getVersionActivity
};
