const sendEmail = async (to, subject, message) => {
    console.log("📧 Email Simulation");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Message:", message);

    return true;
};

module.exports = sendEmail;