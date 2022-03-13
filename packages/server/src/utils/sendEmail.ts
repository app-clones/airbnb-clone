import * as Mailjet from "node-mailjet";

const mailjet = Mailjet.connect(
    process.env.MAILJET_API_KEY!,
    process.env.MAILJET_API_SECRET!
);

export const sendEmail = async (
    recipient: string,
    subject: string,
    text?: string,
    html?: string
) => {
    const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
            {
                From: {
                    Email: "beatairbnb@gmail.com",
                    Name: "Air BNB"
                },
                To: [
                    {
                        Email: recipient
                    }
                ],
                Subject: subject,
                TextPart: text,
                HTMLPart: html,
                CustomID: "airbnb"
            }
        ]
    });

    request.catch((err) => {
        console.log(err.statusCode);
    });
};
