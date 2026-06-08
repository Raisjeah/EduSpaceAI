'use server';

import dbConnect from '@/lib/db/mongodb';
import Project from '@/models/Project';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/core/session';

export async function createProject(name, agentId) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan login kembali." };
    const userId = user._id.toString();

    await dbConnect();
    const newProject = new Project({
      name,
      userId,
      agentId
    });
    const savedProject = await newProject.save();
    revalidatePath('/');
    revalidatePath('/workspace');
    return { success: true, project: JSON.parse(JSON.stringify(savedProject)) };
  } catch (error) {
    console.error("Gagal membuat proyek:", error);
    return { success: false, error: "Gagal membuat proyek." };
  }
}

export async function getProjects() {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const userId = user._id.toString();

    await dbConnect();
    const projects = await Project.find({ userId, isArchived: { $ne: true } }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Gagal mengambil proyek:", error);
    return [];
  }
}

export async function getProjectDetails(projectId) {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const userId = user._id.toString();

    await dbConnect();
    const project = await Project.findOne({ _id: projectId, userId, isArchived: { $ne: true } }).lean();
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Gagal mengambil detail proyek:", error);
    return null;
  }
}

export async function updateProject(projectId, name) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir." };

    await dbConnect();
    const updated = await Project.findOneAndUpdate(
      { _id: projectId, userId: user._id.toString() },
      { name },
      { new: true }
    );

    if (!updated) return { success: false, error: "Proyek tidak ditemukan." };

    revalidatePath('/');
    revalidatePath('/workspace');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(projectId) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir." };

    await dbConnect();
    // Archive project instead of hard delete
    const archived = await Project.findOneAndUpdate(
      { _id: projectId, userId: user._id.toString() },
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );

    if (!archived) return { success: false, error: "Proyek tidak ditemukan." };

    revalidatePath('/');
    revalidatePath('/workspace');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
