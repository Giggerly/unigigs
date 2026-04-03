// services/moderation/moderationService.ts
import prisma from '@/lib/db/prisma'

export type FlagReason = 'NSFW_IMAGE' | 'SPAM' | 'GIBBERISH' | 'NO_REAL_TASK'

interface ModerationResult {
  flagged: boolean
  reasons: FlagReason[]
  confidence: number
  details: string
}

export class ModerationService {
  // Flag content for admin review — never auto-ban
  async moderateGig(gigId: string, title: string, description: string): Promise<ModerationResult> {
    const result = await this.analyzeContent(title + ' ' + description)

    if (result.flagged) {
      for (const reason of result.reasons) {
        await prisma.aIFlag.create({
          data: {
            gigId,
            reason,
            confidence: result.confidence,
            details: result.details,
            status: 'PENDING', // Always pending — never auto-action
          },
        })
      }
    }

    return result
  }

  async moderateImage(userId: string, imageUrl: string): Promise<ModerationResult> {
    const result = await this.analyzeImage(imageUrl)

    if (result.flagged) {
      await prisma.aIFlag.create({
        data: {
          userId,
          reason: 'NSFW_IMAGE',
          confidence: result.confidence,
          details: result.details,
          status: 'PENDING',
        },
      })
    }

    return result
  }

  // ─── Content analysis (OpenAI-compatible interface) ─────────────────────────
  private async analyzeContent(text: string): Promise<ModerationResult> {
    // If OpenAI key is available, use their moderation endpoint
    if (process.env.OPENAI_API_KEY) {
      try {
        return await this.openAIModerate(text)
      } catch (err) {
        console.error('[Moderation] OpenAI error, falling back to heuristics:', err)
      }
    }

    // Fallback: simple heuristic checks
    return this.heuristicModerate(text)
  }

  private async openAIModerate(text: string): Promise<ModerationResult> {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    })

    if (!res.ok) throw new Error('OpenAI moderation failed')

    const data = await res.json()
    const result = data.results?.[0]

    if (!result) return { flagged: false, reasons: [], confidence: 0, details: '' }

    const flagged = result.flagged
    const reasons: FlagReason[] = []

    // Map OpenAI categories to our flag reasons
    if (result.categories?.sexual) reasons.push('NSFW_IMAGE')
    if (result.categories?.['harassment']) reasons.push('SPAM')

    // Check for spam/gibberish heuristically in addition
    const heuristic = this.heuristicModerate(text)
    if (heuristic.flagged) {
      heuristic.reasons.forEach((r) => {
        if (!reasons.includes(r)) reasons.push(r)
      })
    }

    return {
      flagged: flagged || heuristic.flagged,
      reasons,
      confidence: result.category_scores
        ? Math.max(...Object.values(result.category_scores as Record<string, number>))
        : 0.5,
      details: `OpenAI moderation: ${Object.entries(result.categories || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ')}`,
    }
  }

  private heuristicModerate(text: string): ModerationResult {
    const reasons: FlagReason[] = []
    const lower = text.toLowerCase()

    // Gibberish detection: very short meaningful content
    const words = text.trim().split(/\s+/).filter((w) => w.length > 2)
    if (words.length < 3 && text.length < 30) {
      reasons.push('GIBBERISH')
    }

    // Spam patterns: excessive repetition, all caps, excessive punctuation
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1)
    const excessivePunct = (text.match(/[!?]{3,}/g) || []).length > 0
    const hasSpamUrls = /https?:\/\/|www\.|\.com\/|bit\.ly/i.test(text)

    if (capsRatio > 0.7 && text.length > 20) reasons.push('SPAM')
    if (excessivePunct && hasSpamUrls) reasons.push('SPAM')

    // No real task: purely price listings without task description
    const noVerbPattern = !/\b(need|want|looking|help|create|build|make|design|pick|deliver|write|fix|teach|find|buy|sell|edit|print|format|tutor)\b/i.test(text)
    if (noVerbPattern && text.length < 50) {
      reasons.push('NO_REAL_TASK')
    }

    const flagged = reasons.length > 0
    return {
      flagged,
      reasons,
      confidence: flagged ? 0.65 : 0,
      details: flagged ? `Heuristic flags: ${reasons.join(', ')}` : '',
    }
  }

  private async analyzeImage(imageUrl: string): Promise<ModerationResult> {
    // Image moderation would use OpenAI Vision or similar service
    // For MVP: return safe by default, actual implementation via OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const res = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            input: [{ type: 'image_url', image_url: { url: imageUrl } }],
          }),
        })
        if (res.ok) {
          const data = await res.json()
          const result = data.results?.[0]
          return {
            flagged: result?.flagged || false,
            reasons: result?.flagged ? ['NSFW_IMAGE'] : [],
            confidence: 0.8,
            details: 'Image moderation via OpenAI',
          }
        }
      } catch {}
    }

    // Default: safe
    return { flagged: false, reasons: [], confidence: 0, details: '' }
  }
}

export const moderationService = new ModerationService()
