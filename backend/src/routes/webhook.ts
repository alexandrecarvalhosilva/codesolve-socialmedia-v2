import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { getIO } from '../config/socket.js';
import { v4 as uuidv4 } from 'uuid';
import { extractPhoneFromJid } from '../services/evolutionApi.js';

const router = Router();

// ============================================================================
// EVOLUTION API WEBHOOK HANDLER
// ============================================================================

/**
 * POST /api/webhook/evolution
 * Recebe eventos da Evolution API (mensagens, status de conexão, etc.)
 * 
 * Eventos suportados:
 * - messages.upsert: Nova mensagem recebida
 * - connection.update: Status de conexão alterado
 * - qrcode.updated: QR Code atualizado
 * - messages.update: Status de mensagem atualizado (entregue, lido)
 */
router.post('/evolution', async (req: Request, res: Response) => {
  try {
    const { event, instance, data } = req.body;
    
    console.log(`[Webhook] Received event: ${event} for instance: ${instance}`);
    console.log(`[Webhook] Data:`, JSON.stringify(data, null, 2));

    // Buscar instância pelo nome na Evolution API
    const whatsappInstance = await prisma.whatsappInstance.findFirst({
      where: {
        evolutionInstanceId: instance,
        deletedAt: null,
      },
      include: {
        tenant: true,
      },
    });

    if (!whatsappInstance) {
      console.warn(`[Webhook] Instance not found: ${instance}`);
      return res.status(200).json({ success: true, message: 'Instance not found, ignoring' });
    }

    // Processar evento baseado no tipo
    switch (event) {
      case 'messages.upsert':
        await handleMessagesUpsert(whatsappInstance, data);
        break;
      
      case 'connection.update':
        await handleConnectionUpdate(whatsappInstance, data);
        break;
      
      case 'qrcode.updated':
        await handleQRCodeUpdate(whatsappInstance, data);
        break;
      
      case 'messages.update':
        await handleMessagesUpdate(whatsappInstance, data);
        break;
      
      default:
        console.log(`[Webhook] Unhandled event type: ${event}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Processa novas mensagens recebidas
 */
async function handleMessagesUpsert(instance: any, data: any) {
  try {
    const messages = Array.isArray(data) ? data : [data];
    
    for (const messageData of messages) {
      // Ignorar mensagens enviadas por nós
      if (messageData.key?.fromMe) {
        console.log('[Webhook] Ignoring message sent by us');
        continue;
      }

      const remoteJid = messageData.key?.remoteJid;
      if (!remoteJid) {
        console.warn('[Webhook] Message without remoteJid, skipping');
        continue;
      }

      // Extrair número do telefone
      const contactPhone = extractPhoneFromJid(remoteJid);
      const isGroup = remoteJid.includes('@g.us');
      
      // Extrair conteúdo da mensagem
      const messageContent = extractMessageContent(messageData.message);
      if (!messageContent) {
        console.log('[Webhook] Message without content, skipping');
        continue;
      }

      // Buscar ou criar conversa
      let conversation = await prisma.conversation.findFirst({
        where: {
          tenantId: instance.tenantId,
          whatsappInstanceId: instance.id,
          contactPhone: contactPhone,
          status: { in: ['open', 'pending'] },
        },
      });

      if (!conversation) {
        // Criar nova conversa
        conversation = await prisma.conversation.create({
          data: {
            id: uuidv4(),
            tenantId: instance.tenantId,
            channel: 'whatsapp',
            whatsappInstanceId: instance.id,
            contactPhone: contactPhone,
            contactName: messageData.pushName || contactPhone,
            status: 'open',
            priority: 'normal',
            aiEnabled: true,
            lastMessageAt: new Date(),
          },
        });

        console.log(`[Webhook] Created new conversation: ${conversation.id}`);

        // Criar notificação para nova conversa
        await createNotificationForNewConversation(instance, conversation);
      }

      // Verificar se a mensagem já existe (idempotência)
      const existingMessage = await prisma.message.findFirst({
        where: {
          tenantId: instance.tenantId,
          evolutionMessageId: messageData.key?.id,
        },
      });

      if (existingMessage) {
        console.log('[Webhook] Message already exists, skipping');
        continue;
      }

      // Criar mensagem
      const message = await prisma.message.create({
        data: {
          id: uuidv4(),
          tenantId: instance.tenantId,
          conversationId: conversation.id,
          content: messageContent.text || '',
          type: messageContent.type,
          direction: 'inbound',
          senderName: messageData.pushName || contactPhone,
          status: 'received',
          evolutionMessageId: messageData.key?.id,
          mediaUrl: messageContent.mediaUrl,
          mediaType: messageContent.mediaType,
          mediaMimeType: messageContent.mediaMimeType,
        },
      });

      // Atualizar lastMessageAt da conversa
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });

      console.log(`[Webhook] Created message: ${message.id}`);

      // Emitir evento via Socket.IO
      const io = getIO();
      if (io) {
        io.to(`tenant:${instance.tenantId}`).emit('message:new', {
          conversationId: conversation.id,
          message: {
            id: message.id,
            content: message.content,
            type: message.type,
            direction: message.direction,
            senderName: message.senderName,
            status: message.status,
            createdAt: message.createdAt.toISOString(),
          },
        });

        io.to(`tenant:${instance.tenantId}`).emit('conversation:updated', {
          id: conversation.id,
          lastMessageAt: conversation.lastMessageAt?.toISOString(),
          lastMessage: message.content,
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Error handling messages.upsert:', error);
  }
}

/**
 * Processa atualizações de status de conexão
 */
async function handleConnectionUpdate(instance: any, data: any) {
  try {
    const { state } = data;
    
    let newStatus: string;
    switch (state) {
      case 'open':
        newStatus = 'connected';
        break;
      case 'connecting':
        newStatus = 'connecting';
        break;
      case 'close':
      default:
        newStatus = 'disconnected';
    }

    // Atualizar status no banco
    await prisma.whatsappInstance.update({
      where: { id: instance.id },
      data: {
        status: newStatus as any,
        connectedAt: newStatus === 'connected' ? new Date() : instance.connectedAt,
        disconnectedAt: newStatus === 'disconnected' ? new Date() : instance.disconnectedAt,
      },
    });

    console.log(`[Webhook] Updated instance ${instance.id} status to: ${newStatus}`);

    // Emitir evento via Socket.IO
    const io = getIO();
    if (io) {
      io.to(`tenant:${instance.tenantId}`).emit('whatsapp:status', {
        instanceId: instance.id,
        status: newStatus,
      });
    }
  } catch (error) {
    console.error('[Webhook] Error handling connection.update:', error);
  }
}

/**
 * Processa atualizações de QR Code
 */
async function handleQRCodeUpdate(instance: any, data: any) {
  try {
    const { qrcode } = data;
    
    if (qrcode) {
      // Atualizar QR Code no banco
      await prisma.whatsappInstance.update({
        where: { id: instance.id },
        data: {
          qrCode: qrcode,
          status: 'connecting',
        },
      });

      console.log(`[Webhook] Updated QR Code for instance ${instance.id}`);

      // Emitir evento via Socket.IO
      const io = getIO();
      if (io) {
        io.to(`tenant:${instance.tenantId}`).emit('whatsapp:qrcode', {
          instanceId: instance.id,
          qrCode: qrcode,
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Error handling qrcode.updated:', error);
  }
}

/**
 * Processa atualizações de status de mensagem (entregue, lido)
 */
async function handleMessagesUpdate(instance: any, data: any) {
  try {
    const updates = Array.isArray(data) ? data : [data];
    
    for (const update of updates) {
      const messageId = update.key?.id;
      if (!messageId) continue;

      const message = await prisma.message.findFirst({
        where: {
          tenantId: instance.tenantId,
          evolutionMessageId: messageId,
        },
      });

      if (!message) continue;

      let newStatus = message.status;
      let deliveredAt = message.deliveredAt;
      let readAt = message.readAt;

      // Mapear status da Evolution API
      if (update.update?.status === 3) { // DELIVERED
        newStatus = 'delivered';
        deliveredAt = new Date();
      } else if (update.update?.status === 4) { // READ
        newStatus = 'read';
        readAt = new Date();
      }

      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: newStatus as any,
          deliveredAt,
          readAt,
        },
      });

      console.log(`[Webhook] Updated message ${message.id} status to: ${newStatus}`);

      // Emitir evento via Socket.IO
      const io = getIO();
      if (io) {
        io.to(`tenant:${instance.tenantId}`).emit('message:status', {
          messageId: message.id,
          conversationId: message.conversationId,
          status: newStatus,
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Error handling messages.update:', error);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extrai conteúdo da mensagem do formato da Evolution API
 */
function extractMessageContent(message: any): { text: string; type: string; mediaUrl?: string; mediaType?: string; mediaMimeType?: string } | null {
  if (!message) return null;

  // Mensagem de texto
  if (message.conversation) {
    return { text: message.conversation, type: 'text' };
  }

  if (message.extendedTextMessage?.text) {
    return { text: message.extendedTextMessage.text, type: 'text' };
  }

  // Imagem
  if (message.imageMessage) {
    return {
      text: message.imageMessage.caption || '',
      type: 'image',
      mediaUrl: message.imageMessage.url,
      mediaType: 'image',
      mediaMimeType: message.imageMessage.mimetype,
    };
  }

  // Áudio
  if (message.audioMessage) {
    return {
      text: '',
      type: 'audio',
      mediaUrl: message.audioMessage.url,
      mediaType: 'audio',
      mediaMimeType: message.audioMessage.mimetype,
    };
  }

  // Vídeo
  if (message.videoMessage) {
    return {
      text: message.videoMessage.caption || '',
      type: 'video',
      mediaUrl: message.videoMessage.url,
      mediaType: 'video',
      mediaMimeType: message.videoMessage.mimetype,
    };
  }

  // Documento
  if (message.documentMessage) {
    return {
      text: message.documentMessage.fileName || '',
      type: 'document',
      mediaUrl: message.documentMessage.url,
      mediaType: 'document',
      mediaMimeType: message.documentMessage.mimetype,
    };
  }

  // Sticker
  if (message.stickerMessage) {
    return {
      text: '',
      type: 'sticker',
      mediaUrl: message.stickerMessage.url,
      mediaType: 'sticker',
      mediaMimeType: message.stickerMessage.mimetype,
    };
  }

  // Localização
  if (message.locationMessage) {
    return {
      text: `📍 ${message.locationMessage.degreesLatitude}, ${message.locationMessage.degreesLongitude}`,
      type: 'location',
    };
  }

  // Contato
  if (message.contactMessage) {
    return {
      text: message.contactMessage.displayName || 'Contato',
      type: 'contact',
    };
  }

  return null;
}

/**
 * Cria notificação para nova conversa
 */
async function createNotificationForNewConversation(instance: any, conversation: any) {
  try {
    // Buscar admins e operadores do tenant
    const users = await prisma.user.findMany({
      where: {
        tenantId: instance.tenantId,
        isActive: true,
        role: { in: ['admin', 'operador'] },
      },
    });

    for (const user of users) {
      await prisma.notification.create({
        data: {
          id: uuidv4(),
          tenantId: instance.tenantId,
          userId: user.id,
          type: 'new_conversation',
          title: 'Nova conversa',
          message: `Nova conversa de ${conversation.contactName || conversation.contactPhone}`,
          data: {
            conversationId: conversation.id,
            contactPhone: conversation.contactPhone,
            contactName: conversation.contactName,
          },
        },
      });
    }
  } catch (error) {
    console.error('[Webhook] Error creating notification:', error);
  }
}

export default router;
