import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';

async function main() {
  const passwordHash = await bcrypt.hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@signalstack.ai' },
    update: { name: 'Admin', role: 'ADMIN', passwordHash, plan: 'DESK' },
    create: {
      name: 'Admin',
      email: 'admin@signalstack.ai',
      passwordHash,
      role: 'ADMIN',
      plan: 'DESK'
    }
  });

  await prisma.notificationPreference.upsert({
    where: { userId: admin.id },
    update: { emailEnabled: true, emailAddress: admin.email, digestEnabled: true },
    create: { userId: admin.id, emailEnabled: true, emailAddress: admin.email, digestEnabled: true }
  });

  const existingAlerts = await prisma.alert.count({ where: { userId: admin.id } });
  if (existingAlerts === 0) {
    await prisma.alert.createMany({
      data: [
        { userId: admin.id, symbol: 'BTC/USDT', timeframe: '1h', condition: 'RSI < 35 and EMA 9 > EMA 21', channel: 'EMAIL', severity: 'HIGH' },
        { userId: admin.id, symbol: 'ETH/USDT', timeframe: '4h', condition: 'Breakout above previous day high', channel: 'TELEGRAM', severity: 'CRITICAL' }
      ]
    });
  }

  const existingBacktests = await prisma.backtest.count({ where: { userId: admin.id } });
  if (existingBacktests === 0) {
    await prisma.backtest.create({
      data: { userId: admin.id, symbol: 'BTC/USDT', timeframe: '1h', totalTrades: 128, winRate: 54.8, netReturn: 21.4, maxDrawdown: 8.2 }
    });
  }

  const existingDeliveryLogs = await prisma.alertDelivery.count({ where: { userId: admin.id } });
  if (existingDeliveryLogs === 0) {
    const alert = await prisma.alert.findFirst({ where: { userId: admin.id } });
    await prisma.alertDelivery.create({
      data: {
        userId: admin.id,
        alertId: alert?.id,
        channel: 'EMAIL',
        status: 'SENT',
        destination: admin.email,
        subject: 'Welcome to SignalStack AI',
        body: 'Your notification pipeline is ready.',
        sentAt: new Date()
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
