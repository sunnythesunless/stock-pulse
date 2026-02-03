import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"StockPulse" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `Welcome to StockPulse - your stock market toolkit is ready!`,
        text: 'Thanks for joining StockPulse',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"StockPulse News" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from StockPulse`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendPriceAlertEmail = async ({
    email,
    symbol,
    company,
    alertType,
    targetPrice,
    currentPrice,
}: {
    email: string;
    symbol: string;
    company: string;
    alertType: 'upper' | 'lower';
    targetPrice: number;
    currentPrice: number;
}): Promise<void> => {
    // Dynamically import templates to avoid circular deps
    const { STOCK_ALERT_UPPER_EMAIL_TEMPLATE, STOCK_ALERT_LOWER_EMAIL_TEMPLATE } = await import('@/lib/nodemailer/templates');

    const template = alertType === 'upper' ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const htmlTemplate = template
        .replace(/{{symbol}}/g, symbol)
        .replace(/{{company}}/g, company)
        .replace(/{{targetPrice}}/g, `$${targetPrice.toFixed(2)}`)
        .replace(/{{currentPrice}}/g, `$${currentPrice.toFixed(2)}`)
        .replace(/{{timestamp}}/g, timestamp);

    const subject = alertType === 'upper'
        ? `📈 ${symbol} hit your upper target of $${targetPrice.toFixed(2)}!`
        : `📉 ${symbol} dropped below $${targetPrice.toFixed(2)}`;

    const mailOptions = {
        from: `"StockPulse Alerts" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject,
        text: `${symbol} price alert triggered. Current price: $${currentPrice.toFixed(2)}`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};
