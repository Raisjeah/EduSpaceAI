'use server';

import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { revalidatePath } from 'next/cache';

export async function createProject(name, userId, agentId) {
  try {
    await dbConnect();
    const newProject = new Project({
      name,
      userId,
      agentId
    });
    const savedProject = await newProject.save();
    revalidatePath('/');
    return { success: true, project: JSON.parse(JSON.stringify(savedProject)) };
  } catch (error) {
    console.error("Gagal membuat proyek:", error);
    return { success: false, error: "Gagal membuat proyek." };
  }
}

export async function getProjects(userId) {
  if (!userId) return [];
  try {
    await dbConnect();
    const projects = await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Gagal mengambil proyek:", error);
    return [];
  }
}

export async function getProjectDetails(projectId) {
  try {
    await dbConnect();
    const project = await Project.findById(projectId).lean();
    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Gagal mengambil detail proyek:", error);
    return null;
  }
}
