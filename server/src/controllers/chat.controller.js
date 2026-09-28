import { askAssistant } from '../services/chat.service.js'

export async function create(req, res) {
  const data = await askAssistant(req.body)
  res.json({ success: true, data })
}
