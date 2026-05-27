import type { Request, Response } from "express";
import { Workspace, Share } from '../models/Schemas.js';
import crypto from 'crypto';

export const syncWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId, collections, requests, environments, history } = req.body;
    if (!workspaceId || typeof workspaceId !== "string") {
  res.status(400).json({
    error: "Invalid workspace id",
  });
  return;

    }

    const doc = await Workspace.findOneAndUpdate(
      { workspaceId },
      { $set: { collections, requests, environments, history: (history || []).slice(0, 50) } },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, lastSavedAt: doc.updatedAt });
  } catch (error) {
    res.status(500).json({ error: 'Operational database state synchronization failure.' });
  }
};

export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
const id = req.params.id;

if (!id || Array.isArray(id)) {
  res.status(400).json({
    error: "Invalid workspace id",
  });
  return;
}    const doc = await Workspace.findOne({ workspaceId: id });
    if (!doc) {
      res.status(404).json({ found: false, error: 'Target workspace index record matches empty collection.' });
      return;
    }
    res.status(200).json({ found: true, data: doc });
  } catch (error) {
    res.status(500).json({ error: 'Internal schema runtime querying breakdown.' });
  }
};

export const createShare = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = crypto.randomBytes(6).toString('hex');
    const newShare = new Share({ shareId: slug, request: req.body });
    await newShare.save();

    res.status(201).json({ success: true, shareId: slug });
  } catch (error) {
    res.status(500).json({ error: 'Failed to serialize immutable link snapshot profile.' });
  }
};

export const getShare = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      res.status(400).json({
        success: false,
        error: "Invalid share id",
      });
      return;
    }

    const doc = await Share.findOne({
      shareId: id,
    });

    if (!doc) {
      res.status(404).json({
        success: false,
        error: "Share not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      request: doc.request,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch shared request",
    });
  }
};