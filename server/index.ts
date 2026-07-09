import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

const app = express()
const root = process.cwd()
const credentialsPath = path.join(root, 'linkedin-credentials.txt')
const tokenPath = path.join(root, '.linkedin-token.json')
const webUrl = 'http://127.0.0.1:5173'
const apiVersion = process.env.LINKEDIN_API_VERSION || '202606'
const pendingStates = new Map<string, number>()

type Credentials = {
  clientId: string
  clientSecret: string
  organizationId: string
  redirectUri: string
}

type StoredToken = {
  accessToken: string
  expiresAt: number
}

function readField(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.match(new RegExp(`${escaped}:\\s*\\n?([^\\n]*)`, 'i'))?.[1]?.trim() || ''
}

function getCredentials(): Credentials {
  const text = fs.readFileSync(credentialsPath, 'utf8')
  const credentials = {
    clientId: readField(text, 'LINKEDIN CLIENT ID'),
    clientSecret: readField(text, 'LINKEDIN CLIENT SECRET'),
    organizationId: readField(text, 'LINKEDIN ORGANIZATION ID'),
    redirectUri: readField(text, 'LINKEDIN REDIRECT URI'),
  }
  if (Object.values(credentials).some((value) => !value)) {
    throw new Error('Thong tin LinkedIn chua day du trong linkedin-credentials.txt')
  }
  return credentials
}

function readToken(): StoredToken | null {
  if (!fs.existsSync(tokenPath)) return null
  try {
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8')) as StoredToken
  } catch {
    return null
  }
}

function saveToken(token: StoredToken) {
  fs.writeFileSync(tokenPath, JSON.stringify(token), { encoding: 'utf8', mode: 0o600 })
  fs.chmodSync(tokenPath, 0o600)
}

async function linkedInFetch(endpoint: string) {
  const token = readToken()
  if (!token || token.expiresAt <= Date.now()) {
    throw new Error('LINKEDIN_AUTH_REQUIRED')
  }
  const response = await fetch(`https://api.linkedin.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'LinkedIn-Version': apiVersion,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`LinkedIn API ${response.status}: ${body.slice(0, 300)}`)
  }
  return response.json()
}

app.get('/api/linkedin/status', (_request, response) => {
  try {
    const credentials = getCredentials()
    const token = readToken()
    response.json({
      configured: true,
      connected: Boolean(token && token.expiresAt > Date.now()),
      organizationId: credentials.organizationId,
    })
  } catch (error) {
    response.status(400).json({ configured: false, connected: false, message: error instanceof Error ? error.message : 'Loi cau hinh' })
  }
})

app.get('/api/linkedin/auth', (_request, response) => {
  try {
    const credentials = getCredentials()
    const state = crypto.randomBytes(24).toString('hex')
    pendingStates.set(state, Date.now() + 10 * 60 * 1000)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      state,
      scope: 'r_organization_social rw_organization_admin',
    })
    response.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`)
  } catch (error) {
    response.status(400).send(error instanceof Error ? error.message : 'Khong the bat dau ket noi')
  }
})

app.get('/auth/linkedin/callback', async (request, response) => {
  const code = typeof request.query.code === 'string' ? request.query.code : ''
  const state = typeof request.query.state === 'string' ? request.query.state : ''
  const stateExpiry = pendingStates.get(state)
  pendingStates.delete(state)
  if (!code || !stateExpiry || stateExpiry < Date.now()) {
    response.redirect(`${webUrl}/?linkedin=error`)
    return
  }

  try {
    const credentials = getCredentials()
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: credentials.redirectUri,
      }),
    })
    if (!tokenResponse.ok) throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    const data = await tokenResponse.json() as { access_token: string; expires_in: number }
    saveToken({ accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 })
    response.redirect(`${webUrl}/?linkedin=connected`)
  } catch {
    response.redirect(`${webUrl}/?linkedin=error`)
  }
})

app.get('/api/linkedin/organizations', async (_request, response) => {
  try {
    const aclData = await linkedInFetch('/rest/organizationAcls?q=roleAssignee&state=APPROVED&count=100')
    const ids = [...new Set((aclData?.elements || [])
      .map((item: { organization?: string; organizationalTarget?: string }) => item.organization || item.organizationalTarget || '')
      .map((urn: string) => urn.match(/organization:(\d+)/)?.[1])
      .filter(Boolean))] as string[]

    if (!ids.length) {
      response.json({ organizations: [] })
      return
    }

    const lookup = await linkedInFetch(`/rest/organizationsLookup?ids=List(${ids.join(',')})`)
    const results = lookup?.results || {}
    const organizations = ids.map((id) => {
      const item = results[id] || results[`urn:li:organization:${id}`] || {}
      return {
        id,
        name: item.localizedName || item.name?.localized?.en_US || `LinkedIn Page ${id}`,
        vanityName: item.vanityName || '',
      }
    })
    response.json({ organizations })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Khong the tai danh sach Page'
    response.status(message === 'LINKEDIN_AUTH_REQUIRED' ? 401 : 502).json({ message })
  }
})

app.get('/api/linkedin/analytics', async (request, response) => {
  try {
    const configured = getCredentials()
    const requestedId = typeof request.query.organizationId === 'string' ? request.query.organizationId : ''
    const organizationId = requestedId || configured.organizationId
    if (!/^\d+$/.test(organizationId)) {
      response.status(400).json({ message: 'Organization ID khong hop le' })
      return
    }
    const organization = encodeURIComponent(`urn:li:organization:${organizationId}`)
    const data = await linkedInFetch(`/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${organization}`)
    const statistics = data?.elements?.[0]?.totalShareStatistics || {}
    response.json({
      impressions: statistics.impressionCount || 0,
      clicks: statistics.clickCount || 0,
      likes: statistics.likeCount || 0,
      comments: statistics.commentCount || 0,
      shares: statistics.shareCount || 0,
      engagement: statistics.engagement || 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Khong the dong bo'
    response.status(message === 'LINKEDIN_AUTH_REQUIRED' ? 401 : 502).json({ message })
  }
})

app.listen(8787, '127.0.0.1', () => {
  console.log('LinkedIn API server: http://127.0.0.1:8787')
})
