type EmailTemplate = {
  subject: string;
  preview: string;
  text: string;
  html: string;
};

function wrapHtml(title: string, body: string, footer: string) {
  return `
  <div style="background:#f7f2e9;padding:32px 16px;font-family:Georgia,serif;color:#1e2a3b;">
    <div style="max-width:640px;margin:0 auto;background:#fffaf2;border:1px solid #e4d7c5;border-radius:24px;padding:32px;box-shadow:0 12px 30px rgba(31,58,95,0.08);">
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;">${title}</h1>
      <div style="font-size:16px;line-height:1.8;color:#34445d;">${body}</div>
      <p style="margin-top:24px;color:#657088;font-size:14px;line-height:1.6;">${footer}</p>
    </div>
  </div>`;
}

export function donationThankYouTemplate(amountLabel: string): EmailTemplate {
  const subject = 'Îți mulțumim pentru sprijin';
  const preview = 'Contribuția ta susține dezvoltarea liniștită a comunității.';
  const body = `
    <p>Îți mulțumim pentru donația de <strong>${amountLabel}</strong>.</p>
    <p>Prin gestul tău, susții o aplicație construită cu grijă, liniște și responsabilitate pentru comunitatea Vorbește cu Dumnezeu.</p>
    <p>Ne rugăm ca ceea ce oferim aici să rămână un spațiu cald, discret și folositor pentru cei care caută pace și sprijin spiritual.</p>`;
  return {
    subject,
    preview,
    text: `Îți mulțumim pentru donația de ${amountLabel}. Contribuția ta susține dezvoltarea comunității Vorbește cu Dumnezeu.`,
    html: wrapHtml('Îți mulțumim pentru sprijin', body, 'Cu recunoștință, echipa Vorbește cu Dumnezeu'),
  };
}

export function premiumConfirmationTemplate(planName: string): EmailTemplate {
  const subject = `Abonamentul ${planName} este activ`;
  const preview = 'Ai acces la experiența completă și la funcțiile premium.';
  const body = `
    <p>Abonamentul tău <strong>${planName}</strong> este acum activ.</p>
    <p>Ai acces la funcțiile premium pregătite cu grijă: planuri extinse, favorite fără limită, export elegant și opțiuni personalizate pentru ritmul tău spiritual.</p>
    <p>Îți mulțumim că alegi să susții această comunitate într-un mod calm și generos.</p>`;
  return {
    subject,
    preview,
    text: `Abonamentul ${planName} este activ. Îți mulțumim că susții comunitatea Vorbește cu Dumnezeu.`,
    html: wrapHtml('Bine ai venit în Premium', body, 'Continuă călătoria spirituală în ritmul tău.'),
  };
}

export function subscriptionExpiringTemplate(planName: string): EmailTemplate {
  const subject = `Abonamentul ${planName} se apropie de expirare`;
  const preview = 'Poți gestiona abonamentul oricând din profilul tău.';
  const body = `
    <p>Abonamentul tău <strong>${planName}</strong> se apropie de finalul perioadei curente.</p>
    <p>Dacă dorești să continui, îl poți gestiona oricând din profil. Dacă alegi o pauză, funcțiile esențiale spirituale rămân în continuare disponibile în planul gratuit.</p>`;
  return {
    subject,
    preview,
    text: `Abonamentul ${planName} se apropie de expirare. Îl poți gestiona din profilul tău.`,
    html: wrapHtml('Abonamentul se apropie de expirare', body, 'Îți mulțumim pentru timpul petrecut în comunitate.'),
  };
}

export function premiumWelcomeTemplate(planName: string): EmailTemplate {
  const subject = `Bine ai venit în ${planName}`;
  const preview = 'Te așteaptă funcții suplimentare pentru un parcurs spiritual mai bogat.';
  const body = `
    <p>Ne bucurăm că ai ales <strong>${planName}</strong>.</p>
    <p>De acum poți descoperi planuri extinse, instrumente premium și o experiență mai personalizată, păstrând același ton cald și discret al aplicației.</p>
    <p>Fie ca această etapă să-ți aducă mai multă claritate, liniște și consecvență.</p>`;
  return {
    subject,
    preview,
    text: `Bine ai venit în ${planName}. Te bucuri acum de experiența completă Vorbește cu Dumnezeu.`,
    html: wrapHtml('Bine ai venit în Premium', body, 'Suntem alături de tine în această călătorie spirituală.'),
  };
}