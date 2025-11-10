import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Simple random string generator (no crypto dependency needed)
function generateRandomToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'auth_';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📌 Note: ChatSmart uses PIN-based authentication (no email/password)');

  // Clean up expired sessions first
  const deletedExpired = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  console.log(`🧹 Cleaned up ${deletedExpired.count} expired sessions`);

  // Create test session with token (simulating PIN authentication)
  const testToken = generateRandomToken();
  const testSessionId = `session-test-${Date.now()}`;

  const session = await prisma.session.upsert({
    where: { sessionId: testSessionId },
    update: {
      token: testToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    create: {
      sessionId: testSessionId,
      token: testToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });
  console.log('✅ Created/Updated anonymous session:', {
    id: session.id,
    sessionId: session.sessionId,
    token: session.token?.substring(0, 20) + '...',
    expiresAt: session.expiresAt,
  });

  // Create sample chat messages
  const messages = [
    {
      sessionId: session.sessionId,
      role: 'user',
      content: 'Hello! How are you?',
    },
    {
      sessionId: session.sessionId,
      role: 'assistant',
      content: "I'm doing well, thank you! How can I help you today?",
    },
    {
      sessionId: session.sessionId,
      role: 'user',
      content: 'Can you tell me about ChatSmart?',
    },
    {
      sessionId: session.sessionId,
      role: 'assistant',
      content:
        'ChatSmart is an intelligent chat application that uses AI to provide helpful responses. It features persistent chat history, secure authentication, and seamless integration with n8n workflows.',
    },
  ];

  // Delete existing messages for this session to avoid duplicates
  await prisma.message.deleteMany({
    where: { sessionId: session.sessionId },
  });

  // Create messages
  for (const messageData of messages) {
    const message = await prisma.message.create({
      data: messageData,
    });
    console.log(`✅ Created message: [${message.role}] ${message.content.substring(0, 50)}...`);
  }

  // Summary
  const totalSessions = await prisma.session.count();
  const totalMessages = await prisma.message.count();

  console.log('\n📊 Database Summary:');
  console.log(`   Sessions: ${totalSessions}`);
  console.log(`   Messages: ${totalMessages}`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n💡 Test credentials:');
  console.log(`   Session ID: ${session.sessionId}`);
  console.log(`   Token: ${session.token}`);
  console.log('\n📝 You can use this token to test the API:');
  console.log(`   curl -H "Authorization: Bearer ${session.token}" http://localhost:3001/api/chat/history/${session.sessionId}`);
}

main()
  .then(() => {
    console.log('✨ Disconnecting from database...');
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
