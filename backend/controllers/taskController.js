const Task = require('../models/Task');

// @desc    Get all active tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user._id,
            isArchived: false
        }).sort({ deadline: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, alarmSound, isAlarmEnabled } = req.body;
        const task = await Task.create({
            user: req.user._id,
            title,
            description,
            deadline,
            priority,
            alarmSound,
            isAlarmEnabled
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update task status or details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check ownership
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete/Archive task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
