import { inngest } from "@/lib/inngest/client";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";

// Welcome email on user signup
export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        await step.run('send-welcome-email', async () => {
            const { data: { email, name } } = event;
            const introText = `Welcome to StockPulse! You now have access to real-time stock tracking, price alerts, portfolio management, and AI-powered insights. Start by adding your favorite stocks to your watchlist.`;

            return await sendWelcomeEmail({ email, name, intro: introText });
        });

        return {
            success: true,
            message: 'Welcome email sent successfully'
        };
    }
);

// Daily news summary email
export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }],
    async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail);

        if (!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        type UserForNewsEmail = { id: string; name: string; email: string };

        // Step #2: For each user, get watchlist symbols -> fetch news
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    articles = (articles || []).slice(0, 6);
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: Generate summary and send emails
        const emailResults = await step.run('send-news-emails', async () => {
            const sentResults: { email: string; success: boolean }[] = [];

            for (const { user, articles } of results) {
                try {
                    // Create a simple news summary from headlines
                    const newsContent = articles.length > 0
                        ? articles.map(a => `• ${a.headline}`).join('\n')
                        : 'No market news for your watchlist today.';

                    await sendNewsSummaryEmail({
                        email: user.email,
                        name: user.name,
                        newsContent,
                        date: getFormattedTodayDate(),
                    });
                    sentResults.push({ email: user.email, success: true });
                } catch (e) {
                    console.error('daily-news: error sending email', user.email, e);
                    sentResults.push({ email: user.email, success: false });
                }
            }
            return sentResults;
        });

        return {
            success: true,
            message: `Sent news to ${emailResults.filter(r => r.success).length}/${users.length} users`
        };
    }
);

// Check price alerts every 5 minutes
export const checkPriceAlerts = inngest.createFunction(
    { id: 'check-price-alerts' },
    { cron: '*/5 * * * *' },
    async ({ step }) => {
        const { getAllPendingAlerts, triggerAlert } = await import('@/lib/actions/alert.actions');
        const { getStockQuote } = await import('@/lib/actions/finnhub.actions');
        const { getUserById } = await import('@/lib/actions/user.actions');
        const { sendPriceAlertEmail } = await import('@/lib/nodemailer');

        const alerts = await step.run('get-pending-alerts', getAllPendingAlerts);

        if (!alerts || alerts.length === 0) {
            return { success: true, message: 'No pending alerts to check' };
        }

        type AlertDoc = {
            _id: unknown;
            userId: string;
            symbol: string;
            company: string;
            alertType: 'upper' | 'lower';
            targetPrice: number;
            triggered: boolean;
        };

        const typedAlerts = alerts as AlertDoc[];

        // Group alerts by symbol to minimize API calls
        const alertsBySymbol = typedAlerts.reduce((acc: Record<string, AlertDoc[]>, alert) => {
            const sym = alert.symbol;
            if (!acc[sym]) acc[sym] = [];
            acc[sym].push(alert);
            return acc;
        }, {} as Record<string, AlertDoc[]>);

        // Check and trigger alerts
        const triggeredCount = await step.run('check-and-trigger-alerts', async () => {
            let triggered = 0;

            for (const [symbol, symbolAlerts] of Object.entries(alertsBySymbol)) {
                try {
                    const quote = await getStockQuote(symbol);
                    if (!quote || quote.c === 0) continue;

                    const currentPrice = quote.c;

                    for (const alert of symbolAlerts) {
                        let shouldTrigger = false;

                        if (alert.alertType === 'upper' && currentPrice >= alert.targetPrice) {
                            shouldTrigger = true;
                        } else if (alert.alertType === 'lower' && currentPrice <= alert.targetPrice) {
                            shouldTrigger = true;
                        }

                        if (shouldTrigger) {
                            await triggerAlert(String(alert._id));

                            const user = await getUserById(alert.userId);
                            if (user?.email) {
                                try {
                                    await sendPriceAlertEmail({
                                        email: user.email,
                                        symbol: alert.symbol,
                                        company: alert.company,
                                        alertType: alert.alertType,
                                        targetPrice: alert.targetPrice,
                                        currentPrice,
                                    });
                                } catch (emailErr) {
                                    console.error('Failed to send price alert email:', emailErr);
                                }
                            }
                            triggered++;
                        }
                    }
                } catch (err) {
                    console.error('Error checking alerts for symbol:', symbol, err);
                }
            }
            return triggered;
        });

        return { success: true, message: `Checked ${alerts.length} alerts, triggered ${triggeredCount}` };
    }
);
