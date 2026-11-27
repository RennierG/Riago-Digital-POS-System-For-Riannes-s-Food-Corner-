import * as menuService from '../services/menuService.js';

export const list = async (req, res) => {
    try {
        const result = await menuService.fetchAll(false);
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

export const listAdmin = async (req, res) => {
    try {
        const result = await menuService.fetchAll(true);
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

export const create = async (req, res) => {
    try {
        const result = await menuService.create(req.body);
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

export const update = async (req, res) => {
    try {
        const result = await menuService.update(req.params.id, req.body);
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

export const setAvailability = async (req, res) => {
    try {
        const result = await menuService.setAvailability(req.params.id, req.body.is_available);
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

export const setImage = async (req, res) => {
    try {
        const result = await menuService.setImage(req.params.id, req.body);
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

export const setStock = async (req, res) => {
    try {
        const result = await menuService.setStock(req.params.id, req.body.stock);
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

export const setArchived = async (req, res) => {
    try {
        const result = await menuService.setArchived(req.params.id, req.body.archived);
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
