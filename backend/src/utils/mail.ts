// import mailjet from "node-mailjet";
import SibApiV3Sdk from "sib-api-v3-sdk";

const MAILJET_PUBLIC = process.env?.MAILJET_API_KEY;
const MAILJET_PRIVATE = process.env?.MAILJET_API_SECRET;
const SENDINBLUE_KEY = process.env?.SENDINBLUE_KEY;

const SibClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = SibClient.authentications["api-key"];
apiKey.apiKey = SENDINBLUE_KEY;

if (SENDINBLUE_KEY) {
  const SibApi = new SibApiV3Sdk.AccountApi();
  SibApi.getAccount().then(
    function (data) {
      console.log("SIB API called successfully. Returned data: " + data);
      console.log(data);
    },
    function (error) {
      console.error(error);
    }
  );
}

export const TEMPLATES = {
  resetPassword: 1,
};

export const sendMailTemplate = async ({
  toEmail,
  fromEmail,
  templateId,
  subject,
  variables,
}) => {
  if (!SENDINBLUE_KEY) {
    console.log(
      `Cannot send SIB template ${templateId} to ${toEmail} because no key is set`
    );

    return;
  }

  const instance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  const sendSmtpEmailTo = new SibApiV3Sdk.SendSmtpEmailTo();
  sendSmtpEmailTo.name = "Cartels Player";
  sendSmtpEmailTo.email = toEmail;
  sendSmtpEmail.to = [sendSmtpEmailTo];
  sendSmtpEmail.replyTo = {
    name: "Cartels Support",
    email: "support@codeorder.com",
  };
  sendSmtpEmail.templateId = templateId;
  sendSmtpEmail.params = variables;
  sendSmtpEmail.subject = subject;

  const message = instance.sendTransacEmail(sendSmtpEmail);

  message
    .then((result) => {
      console.log(`Sent SIB template ${templateId} - ${result?.body}`);
      console.log(result);
    })
    .catch((err) => {
      console.log(`SIB template ${templateId} - ${err?.text}`);
      console.log(err);
    });
};
