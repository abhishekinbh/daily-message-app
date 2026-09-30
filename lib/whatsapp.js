function formatWhatsAppMessage(msg) {
  const escape = (str) => {
    return str
      .replace(/[&<>"']/g, (c) => {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return entities[c];
      })
      .replace(/\n/g, ' ');
  };

  let text = '';

  if (msg.greeting_text) {
    text += `*${escape(msg.greeting_text)}*\n`;
  }
  if (msg.special_note) {
    text += `_${escape(msg.special_note)}_\n`;
  }

  text += '\n━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += `*Thought of the Day*\n${escape(msg.thought_text)}\n\n_Meaning:_ ${escape(msg.thought_meaning)}\n`;
  text += '━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += `*Word of the Day: ${escape(msg.word)}*\n${escape(msg.word_meaning)}\n`;
  if (msg.synonyms) {
    text += `\n_Synonyms:_ ${escape(msg.synonyms)}`;
  }
  if (msg.antonyms) {
    text += `\n_Antonyms:_ ${escape(msg.antonyms)}`;
  }
  text += `\n\n_Example:_ ${escape(msg.example_sentence)}\n_Meaning:_ ${escape(msg.example_meaning)}\n`;
  text += '━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += `_${escape(msg.footer_text)}_`;

  return text;
}

module.exports = { formatWhatsAppMessage };
