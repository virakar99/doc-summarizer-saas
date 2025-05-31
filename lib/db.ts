import { supabaseAdmin } from "./supabase"
import { auth } from "@clerk/nextjs/server"

// Document operations
export async function createDocument(data: {
  fileName: string
  fileType: string
  fileSize: number
}) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .insert({
      user_id: userId,
      file_name: data.fileName,
      file_type: data.fileType,
      file_size: data.fileSize,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return document
}

export async function getUserDocuments() {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*, summaries(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getDocument(id: string) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*, summaries(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error) {
    throw error
  }

  return data
}

// Summary operations
export async function createSummary(data: {
  documentId: string
  content: string
}) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Verify document belongs to user
  const { data: document, error: docError } = await supabaseAdmin
    .from("documents")
    .select()
    .eq("id", data.documentId)
    .eq("user_id", userId)
    .single()

  if (docError || !document) {
    throw new Error("Document not found or access denied")
  }

  const { data: summary, error } = await supabaseAdmin
    .from("summaries")
    .insert({
      document_id: data.documentId,
      content: data.content,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return summary
}
