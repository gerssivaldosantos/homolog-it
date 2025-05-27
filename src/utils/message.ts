export const getReadyForQAMessage = ({
  mainUser,
  cardTitle,
  otherUsers,
}: {
  mainUser: string;
  cardTitle: string;
  otherUsers: string[];
}): string => {
  const userMentions = otherUsers.map(user => `<@${user}>`).join(' ');
  return `:rotating_light:  Card pronto para homologação! :rotating_light:
  
Fala <@${mainUser}>! :eggplant:

O card ${cardTitle} está pronto para ser homologado. :hammer_and_wrench:

Por favor, confira o que foi implementado e, caso tudo esteja certo, mova o card para "Ready to Prod".

Caso encontre algum problema, por favor mova o card para "In Progress" e marque o responsável aqui no canal para que possamos agilizar.

FYI ${userMentions}`;
};
