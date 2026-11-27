import * as userService from '../services/userService.js';

export const customers = async (req, res) => {
    try {
        const result = await userService.customers();
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || 'Internal Server Error'}`
        });
    }
}

export const staff = async (req, res) => {
    try {
        const result = await userService.staff();
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || 'Internal Server Error'}`
        });
    }
}

export const riders = async (req, res) => {
    try {
        const result = await userService.riders();
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || 'Internal Server Error'}`
        });
    }
}

export const createStaff = async (req, res) => {
    try {
        const result = await userService.createStaff(req.body);
        res.status(201).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || 'Internal Server Error'}`
        });
    }
}

export const removeStaff = async (req, res) => {
    try {
        const result = await userService.removeStaff(req.params.id);
        res.status(200).json({
            success: true,
            message: result
        });
    } catch (e) {
        console.log(e);
        res.status(e.statusCode || 500).json({
            error: `${e.message || 'Internal Server Error'}`
        });
    }
}
