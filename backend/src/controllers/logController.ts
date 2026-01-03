import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dsaDone: z.boolean().optional(),
  dsaType: z.enum(['NEW', 'REVISION']).optional(),
  dsaCount: z.number().int().min(0).optional(),
  dsaTime: z.number().int().min(0).optional(),
  meditationDone: z.boolean().optional(),
  meditationTime: z.number().int().min(0).optional(),
  gymDone: z.boolean().optional(),
  gymType: z.enum(['DUMBBELLS', 'PUSH_PULL', 'SHOULDERS']).optional(),
  gymTime: z.number().int().min(0).optional(),
  learningNotes: z.string().optional(),
  learningTime: z.number().int().min(0).optional(),
  projectDone: z.boolean().optional(),
  projectName: z.string().optional(),
  projectNotes: z.string().optional(),
  projectTime: z.number().int().min(0).optional(),
});

export const createOrUpdateLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = logSchema.parse(req.body);
    const { date, ...data } = validated;

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const log = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: req.userId!,
          date: dateObj,
        },
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId: req.userId!,
        date: dateObj,
        ...data,
      },
    });

    res.json({ log });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLogByDate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const log = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: req.userId!,
          date: dateObj,
        },
      },
    });

    res.json({ log: log || null });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWeekLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const year = parseInt(req.params.year);
    const weekNumber = parseInt(req.params.weekNumber);

    if (isNaN(year) || isNaN(weekNumber) || weekNumber < 1 || weekNumber > 53) {
      res.status(400).json({ error: 'Invalid year or week number' });
      return;
    }

    const jan1 = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(jan1);
    weekStart.setDate(jan1.getDate() + daysOffset - jan1.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId: req.userId!,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    let totalDsaProblems = 0;
    let totalRevisionProblems = 0;
    let totalStudyTime = 0;
    let gymDays = 0;
    let meditationDays = 0;

    logs.forEach((log) => {
      if (log.dsaDone && log.dsaType === 'NEW') {
        totalDsaProblems += log.dsaCount;
      }
      if (log.dsaDone && log.dsaType === 'REVISION') {
        totalRevisionProblems += log.dsaCount;
      }
      if (log.dsaDone) {
        totalStudyTime += log.dsaTime;
      }
      if (log.learningTime > 0) {
        totalStudyTime += log.learningTime;
      }
      if (log.projectDone) {
        totalStudyTime += log.projectTime;
      }
      if (log.gymDone) {
        gymDays++;
      }
      if (log.meditationDone) {
        meditationDays++;
      }
    });

    res.json({
      logs,
      summary: {
        totalDsaProblems,
        totalRevisionProblems,
        totalStudyTime,
        gymDays,
        meditationDays,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Invalid year or month' });
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId: req.userId!,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const heatmapData = [];
    const weeklyDsaData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const log = logs.find(
        (l) => l.date.toISOString().split('T')[0] === dateStr
      );

      let intensity = 0;
      if (log) {
        if (log.dsaDone) intensity++;
        if (log.meditationDone) intensity++;
        if (log.gymDone) intensity++;
        if (log.learningTime > 0 || log.learningNotes.trim() !== '') intensity++;
        if (log.projectDone) intensity++;
      }

      heatmapData.push({ day, intensity });
    }

    const firstDay = new Date(year, month - 1, 1);
    let currentWeekStart = new Date(firstDay);
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);

    while (currentWeekStart <= endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);

      const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= currentWeekStart && logDate <= weekEnd;
      });

      let problems = 0;
      weekLogs.forEach((log) => {
        if (log.dsaDone && log.dsaType === 'NEW') {
          problems += log.dsaCount;
        }
      });

      const weekLabel = `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
      weeklyDsaData.push({ week: weekLabel, problems });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    const totalDays = logs.length;
    const activeDays = logs.filter((log) => {
      return (
        log.dsaDone ||
        log.meditationDone ||
        log.gymDone ||
        log.learningTime > 0 ||
        log.learningNotes.trim() !== '' ||
        log.projectDone
      );
    }).length;

    const consistencyPercentage =
      daysInMonth > 0 ? Math.round((activeDays / daysInMonth) * 100) : 0;

    res.json({
      logs,
      heatmapData,
      weeklyDsaData,
      consistencyPercentage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
