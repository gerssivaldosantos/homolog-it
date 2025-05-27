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
  return `:rotating_light: Card pronto para homologação! :rotating_light:
Fala, <@${mainUser}>!
O card ${cardTitle} está pronto para ser homologado. :hammer_and_wrench:
Por favor, confiram o que foi implementado e, caso tudo esteja certo, movam o card para "Ready to Prod".
Caso encontrem algum problema, por favor mova o card para "In Progress" e marque o responsável aqui no canal para que possamos agilizar.
FYI ${userMentions}`;
};
