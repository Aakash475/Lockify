import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (to, token) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationLink = `${process.env.VERIFICATION_URL}/verification?token=${token}`;

    const mailOptions = {
        from: `"Lockify " <${process.env.EMAIL_USER}>`,
        to,
        subject: "Please Verify Your Email",
        html: `<p>Please click the link to verify your email:</p>
               <a href="${verificationLink}">${verificationLink}</a>`
    };

    await transporter.sendMail(mailOptions);

};
