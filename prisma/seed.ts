import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📌 Note: ChatSmart uses anonymous sessions (no authentication)');

  // Clean up expired sessions first
  const deletedExpired = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  console.log(`🧹 Cleaned up ${deletedExpired.count} expired sessions`);

  // Create test session
  const testSessionId = `session-test-${Date.now()}`;

  const session = await prisma.session.upsert({
    where: { sessionId: testSessionId },
    update: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      sessionId: testSessionId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log('✅ Created/Updated anonymous session:', {
    id: session.id,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
  });

  // Create sample chat messages
  const messages = [
    {
      sessionId: session.id, // Use internal ID, not sessionId string
      role: 'user',
      content: 'Hello! How are you?',
    },
    {
      sessionId: session.id,
      role: 'assistant',
      content: "I'm doing well, thank you! How can I help you today?",
    },
    {
      sessionId: session.id,
      role: 'user',
      content: 'Can you tell me about ChatSmart?',
    },
    {
      sessionId: session.id,
      role: 'assistant',
      content:
        'ChatSmart is an intelligent chat application that uses AI to provide helpful responses. It features persistent chat history, secure authentication, and seamless integration with n8n workflows.',
    },
  ];

  // Delete existing messages for this session to avoid duplicates
  await prisma.message.deleteMany({
    where: { sessionId: session.id }, // Use internal ID
  });

  // Create messages
  for (const messageData of messages) {
    const message = await prisma.message.create({
      data: messageData,
    });
    console.log(`✅ Created message: [${message.role}] ${message.content.substring(0, 50)}...`);
  }

  // Seed background music
  console.log('\n🎵 Seeding background music...');
  
  const musicData = [
    {
      title: 'Kampus Biru Langkah Baru',
      artist: 'Kampus Biru',
      url: 'https://atddgwpoppuuarddneip.supabase.co/storage/v1/object/public/background-music/Kampus%20Biru%20Langkah%20Baru.mp3',
      order: 1,
    },
    {
      title: 'Kampus Biru Semangat Baru',
      artist: 'Kampus Biru',
      url: 'https://atddgwpoppuuarddneip.supabase.co/storage/v1/object/public/background-music/Kampus%20Biru%20Semangat%20Baru.mp3',
      order: 2,
    },
  ];

  // Delete existing music to avoid duplicates
  await prisma.backgroundMusic.deleteMany({});

  for (const music of musicData) {
    const created = await prisma.backgroundMusic.create({
      data: music,
    });
    console.log(`✅ Created music: ${created.title}`);
  }

  // Summary
  const totalSessions = await prisma.session.count();
  const totalMessages = await prisma.message.count();
  const totalMusic = await prisma.backgroundMusic.count();

  console.log('\n📊 Database Summary:');
  console.log(`   Sessions: ${totalSessions}`);
  console.log(`   Messages: ${totalMessages}`);
  console.log(`   Background Music: ${totalMusic}`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n💡 Test session:');
  console.log(`   Session ID: ${session.sessionId}`);
  console.log('\n📝 Test the API:');
  console.log(`   curl http://localhost:3001/api/chat/history/${session.sessionId}`);
  console.log(`   curl http://localhost:3001/api/music`);
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
