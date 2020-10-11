const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name) =>{
    sgMail.send({
        to:email,
        from:'arjunmkp18@gmail.com',
        subject:'Thank you for joining Task Manager',
        text:`Hey ${name},\nWelcome to Task Manger App. Looking forward to your valuable feedback.\nRegards,\nTask Manager Team,\nBangalore`
    }).catch(e=>console.log(e));
}

const sendCancellationEmail = (email,name) =>{
    sgMail.send({
        to:email,
        from:'arjunmkp18@gmail.com',
        subject:'Sorry to see you leave us!',
        text:`Hey ${name},\nGoodbye ${name}. We hope to see you again.\nRegards,\nTask Manager Team,\nBangalore`
    })
}

module.exports={
    sendCancellationEmail,
    sendWelcomeEmail
}