/**
 * Evolution API Integration Service
 * 
 * Documentação: https://doc.evolution-api.com/
 * 
 * Este serviço gerencia a comunicação com a Evolution API para:
 * - Criar/deletar instâncias
 * - Gerar QR Codes
 * - Conectar/desconectar instâncias
 * - Enviar mensagens
 * - Receber webhooks
 */

import { env } from '../config/env.js';

// ============================================================================
// TIPOS
// ============================================================================

export interface EvolutionInstance {
  instance: {
    instanceName: string;
    instanceId?: string;
    status: string;
    serverUrl?: string;
    apikey?: string;
    owner?: string;
  };
  hash?: {
    apikey: string;
  };
  settings?: {
    reject_call: boolean;
    msg_call: string;
    groups_ignore: boolean;
    always_online: boolean;
    read_messages: boolean;
    read_status: boolean;
  };
  qrcode?: {
    pairingCode?: string;
    code?: string;
    base64?: string;
    count?: number;
  };
}

export interface EvolutionQRCode {
  pairingCode?: string;
  code?: string;
  base64: string;
  count?: number;
}

export interface EvolutionConnectionState {
  instance: string;
  state: 'open' | 'close' | 'connecting';
}

export interface EvolutionSendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: string;
  status: string;
}

export interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: any;
  destination?: string;
  date_time?: string;
  sender?: string;
  server_url?: string;
  apikey?: string;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const EVOLUTION_API_URL = env.EVOLUTION_API_URL || 'https://api.gandhivati.com.br';
const EVOLUTION_API_KEY = env.EVOLUTION_API_KEY || '6f40d224053ebc24fbf8de801b3ab429';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

async function evolutionRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  instanceApiKey?: string
): Promise<T> {
  const url = `${EVOLUTION_API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': instanceApiKey || EVOLUTION_API_KEY,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  console.log(`[Evolution API] ${method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    
    const responseText = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      console.error(`[Evolution API] Error ${response.status}:`, data);
      throw new Error(data?.message || data?.error || `Evolution API error: ${response.status}`);
    }

    console.log(`[Evolution API] Response:`, JSON.stringify(data).substring(0, 200));
    return data as T;
  } catch (error) {
    console.error(`[Evolution API] Request failed:`, error);
    throw error;
  }
}

// ============================================================================
// INSTÂNCIAS
// ============================================================================

/**
 * Criar uma nova instância na Evolution API
 */
export async function createInstance(
  instanceName: string,
  options?: {
    webhookUrl?: string;
    webhookByEvents?: boolean;
    webhookBase64?: boolean;
    rejectCall?: boolean;
    msgCall?: string;
    groupsIgnore?: boolean;
    alwaysOnline?: boolean;
    readMessages?: boolean;
    readStatus?: boolean;
  }
): Promise<EvolutionInstance> {
  const payload = {
    instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
    reject_call: options?.rejectCall ?? false,
    msg_call: options?.msgCall ?? '',
    groups_ignore: options?.groupsIgnore ?? false,
    always_online: options?.alwaysOnline ?? false,
    read_messages: options?.readMessages ?? false,
    read_status: options?.readStatus ?? false,
    webhook: options?.webhookUrl ? {
      url: options.webhookUrl,
      by_events: options.webhookByEvents ?? true,
      base64: options.webhookBase64 ?? true,
      events: [
        'APPLICATION_STARTUP',
        'QRCODE_UPDATED',
        'MESSAGES_SET',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'CONTACTS_SET',
        'CONTACTS_UPSERT',
        'CONTACTS_UPDATE',
        'PRESENCE_UPDATE',
        'CHATS_SET',
        'CHATS_UPSERT',
        'CHATS_UPDATE',
        'CHATS_DELETE',
        'GROUPS_UPSERT',
        'GROUP_UPDATE',
        'GROUP_PARTICIPANTS_UPDATE',
        'CONNECTION_UPDATE',
        'CALL',
        'LABELS_EDIT',
        'LABELS_ASSOCIATION',
      ],
    } : undefined,
  };

  return evolutionRequest<EvolutionInstance>('/instance/create', 'POST', payload);
}

/**
 * Buscar informações de uma instância
 */
export async function fetchInstance(instanceName: string): Promise<EvolutionInstance> {
  return evolutionRequest<EvolutionInstance>(`/instance/fetchInstances?instanceName=${instanceName}`);
}

/**
 * Listar todas as instâncias
 */
export async function listInstances(): Promise<EvolutionInstance[]> {
  const response = await evolutionRequest<EvolutionInstance[] | EvolutionInstance>('/instance/fetchInstances');
  return Array.isArray(response) ? response : [response];
}

/**
 * Deletar uma instância
 */
export async function deleteInstance(instanceName: string): Promise<void> {
  await evolutionRequest(`/instance/delete/${instanceName}`, 'DELETE');
}

/**
 * Desconectar (logout) uma instância
 */
export async function logoutInstance(instanceName: string): Promise<void> {
  await evolutionRequest(`/instance/logout/${instanceName}`, 'DELETE');
}

/**
 * Reiniciar uma instância
 */
export async function restartInstance(instanceName: string): Promise<void> {
  await evolutionRequest(`/instance/restart/${instanceName}`, 'PUT');
}

// ============================================================================
// CONEXÃO / QR CODE
// ============================================================================

/**
 * Obter estado da conexão
 */
export async function getConnectionState(instanceName: string): Promise<EvolutionConnectionState> {
  return evolutionRequest<EvolutionConnectionState>(`/instance/connectionState/${instanceName}`);
}

/**
 * Conectar instância (gerar QR Code)
 */
export async function connectInstance(instanceName: string): Promise<EvolutionQRCode> {
  const response = await evolutionRequest<{ base64?: string; code?: string; pairingCode?: string; count?: number }>(
    `/instance/connect/${instanceName}`
  );
  
  return {
    base64: response.base64 || '',
    code: response.code,
    pairingCode: response.pairingCode,
    count: response.count,
  };
}

/**
 * Definir presença (online/offline)
 */
export async function setPresence(
  instanceName: string,
  presence: 'available' | 'unavailable'
): Promise<void> {
  await evolutionRequest(`/chat/setPresence/${instanceName}`, 'POST', { presence });
}

// ============================================================================
// MENSAGENS
// ============================================================================

/**
 * Enviar mensagem de texto
 */
export async function sendTextMessage(
  instanceName: string,
  to: string,
  text: string,
  options?: {
    delay?: number;
    linkPreview?: boolean;
    mentionsEveryOne?: boolean;
    mentioned?: string[];
  }
): Promise<EvolutionSendMessageResponse> {
  // Formatar número para o padrão do WhatsApp
  const formattedNumber = formatPhoneNumber(to);
  
  return evolutionRequest<EvolutionSendMessageResponse>(
    `/message/sendText/${instanceName}`,
    'POST',
    {
      number: formattedNumber,
      text,
      delay: options?.delay,
      linkPreview: options?.linkPreview ?? true,
      mentionsEveryOne: options?.mentionsEveryOne ?? false,
      mentioned: options?.mentioned,
    }
  );
}

/**
 * Enviar mensagem com mídia (imagem, vídeo, documento, áudio)
 */
export async function sendMediaMessage(
  instanceName: string,
  to: string,
  mediaType: 'image' | 'video' | 'document' | 'audio',
  media: string, // URL ou base64
  options?: {
    caption?: string;
    fileName?: string;
    delay?: number;
  }
): Promise<EvolutionSendMessageResponse> {
  const formattedNumber = formatPhoneNumber(to);
  
  return evolutionRequest<EvolutionSendMessageResponse>(
    `/message/sendMedia/${instanceName}`,
    'POST',
    {
      number: formattedNumber,
      mediatype: mediaType,
      media,
      caption: options?.caption,
      fileName: options?.fileName,
      delay: options?.delay,
    }
  );
}

/**
 * Enviar localização
 */
export async function sendLocationMessage(
  instanceName: string,
  to: string,
  latitude: number,
  longitude: number,
  options?: {
    name?: string;
    address?: string;
    delay?: number;
  }
): Promise<EvolutionSendMessageResponse> {
  const formattedNumber = formatPhoneNumber(to);
  
  return evolutionRequest<EvolutionSendMessageResponse>(
    `/message/sendLocation/${instanceName}`,
    'POST',
    {
      number: formattedNumber,
      latitude,
      longitude,
      name: options?.name,
      address: options?.address,
      delay: options?.delay,
    }
  );
}

/**
 * Enviar contato
 */
export async function sendContactMessage(
  instanceName: string,
  to: string,
  contact: {
    fullName: string;
    wuid: string;
    phoneNumber: string;
  },
  options?: {
    delay?: number;
  }
): Promise<EvolutionSendMessageResponse> {
  const formattedNumber = formatPhoneNumber(to);
  
  return evolutionRequest<EvolutionSendMessageResponse>(
    `/message/sendContact/${instanceName}`,
    'POST',
    {
      number: formattedNumber,
      contact: [contact],
      delay: options?.delay,
    }
  );
}

/**
 * Enviar reação a uma mensagem
 */
export async function sendReaction(
  instanceName: string,
  to: string,
  messageId: string,
  emoji: string
): Promise<void> {
  const formattedNumber = formatPhoneNumber(to);
  
  await evolutionRequest(
    `/message/sendReaction/${instanceName}`,
    'POST',
    {
      key: {
        remoteJid: formattedNumber,
        id: messageId,
      },
      reaction: emoji,
    }
  );
}

/**
 * Marcar mensagem como lida
 */
export async function markMessageAsRead(
  instanceName: string,
  remoteJid: string,
  messageId: string
): Promise<void> {
  await evolutionRequest(
    `/chat/markMessageAsRead/${instanceName}`,
    'POST',
    {
      read_messages: [
        {
          remoteJid,
          id: messageId,
        },
      ],
    }
  );
}

// ============================================================================
// GRUPOS
// ============================================================================

/**
 * Listar grupos
 */
export async function listGroups(instanceName: string): Promise<any[]> {
  const response = await evolutionRequest<any>(`/group/fetchAllGroups/${instanceName}?getParticipants=false`);
  return Array.isArray(response) ? response : [];
}

/**
 * Obter informações de um grupo
 */
export async function getGroupInfo(instanceName: string, groupJid: string): Promise<any> {
  return evolutionRequest(`/group/findGroupInfos/${instanceName}?groupJid=${groupJid}`);
}

// ============================================================================
// CONTATOS
// ============================================================================

/**
 * Verificar se número tem WhatsApp
 */
export async function checkNumberExists(
  instanceName: string,
  numbers: string[]
): Promise<{ exists: boolean; jid: string; number: string }[]> {
  const formattedNumbers = numbers.map(formatPhoneNumber);
  
  return evolutionRequest(
    `/chat/whatsappNumbers/${instanceName}`,
    'POST',
    { numbers: formattedNumbers }
  );
}

/**
 * Obter foto de perfil
 */
export async function getProfilePicture(
  instanceName: string,
  number: string
): Promise<{ profilePictureUrl?: string }> {
  const formattedNumber = formatPhoneNumber(number);
  
  return evolutionRequest(
    `/chat/fetchProfilePictureUrl/${instanceName}`,
    'POST',
    { number: formattedNumber }
  );
}

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Configurar webhook para uma instância
 */
export async function setWebhook(
  instanceName: string,
  webhookUrl: string,
  events?: string[]
): Promise<void> {
  await evolutionRequest(
    `/webhook/set/${instanceName}`,
    'POST',
    {
      url: webhookUrl,
      webhook_by_events: true,
      webhook_base64: true,
      events: events || [
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'SEND_MESSAGE',
        'CONNECTION_UPDATE',
      ],
    }
  );
}

/**
 * Obter configuração de webhook
 */
export async function getWebhook(instanceName: string): Promise<any> {
  return evolutionRequest(`/webhook/find/${instanceName}`);
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Formatar número de telefone para o padrão do WhatsApp
 * Entrada: +55 61 9 9999-9999, 5561999999999, 61999999999
 * Saída: 5561999999999@s.whatsapp.net
 */
export function formatPhoneNumber(phone: string): string {
  // Remove tudo que não é número
  let cleaned = phone.replace(/\D/g, '');
  
  // Se já termina com @s.whatsapp.net ou @g.us, retorna como está
  if (phone.includes('@')) {
    return phone;
  }
  
  // Adiciona código do Brasil se não tiver
  if (cleaned.length === 11 && cleaned.startsWith('9')) {
    // Número local com 9 dígitos (ex: 999999999)
    cleaned = '55' + cleaned;
  } else if (cleaned.length === 10) {
    // Número local sem 9 (ex: 99999999)
    cleaned = '55' + cleaned;
  } else if (cleaned.length === 11 && !cleaned.startsWith('55')) {
    // DDD + número (ex: 61999999999)
    cleaned = '55' + cleaned;
  }
  
  return cleaned + '@s.whatsapp.net';
}

/**
 * Extrair número de telefone do JID do WhatsApp
 */
export function extractPhoneFromJid(jid: string): string {
  return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
}

/**
 * Verificar se é um grupo
 */
export function isGroup(jid: string): boolean {
  return jid.endsWith('@g.us');
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  // Instâncias
  createInstance,
  fetchInstance,
  listInstances,
  deleteInstance,
  logoutInstance,
  restartInstance,
  
  // Conexão
  getConnectionState,
  connectInstance,
  setPresence,
  
  // Mensagens
  sendTextMessage,
  sendMediaMessage,
  sendLocationMessage,
  sendContactMessage,
  sendReaction,
  markMessageAsRead,
  
  // Grupos
  listGroups,
  getGroupInfo,
  
  // Contatos
  checkNumberExists,
  getProfilePicture,
  
  // Webhooks
  setWebhook,
  getWebhook,
  
  // Utilitários
  formatPhoneNumber,
  extractPhoneFromJid,
  isGroup,
};
