
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

export const sendEmail = async (mailOptions: any) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your app password
      },
    });

    // Configure handlebars
    const handlebarOptions: any = {
      viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve("./templates"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./templates"),
      extName: ".hbs",
    };

    transporter.use("compile", hbs(handlebarOptions));

    // Send email with template
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (err) {
    throw err;
  }
}