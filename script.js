const copy = {
 en: {
  plan: ['Start with a clear task.', 'Separate responsibilities, choose useful tools and define what a good result looks like before an agent starts working.'],
  tools: ['Give the agent useful access.', 'MCP tools expose structured actions. RAG brings relevant context into the conversation, with explicit bounds on what the agent can do.'],
  review: ['Check before moving forward.', 'Validate outputs and use test gates or another model to review the work. Bound retries and escalate when the workflow cannot make progress.'],
  human: ['Keep the decision visible.', 'Use approval, cancellation and escalation checkpoints so people can steer consequential actions instead of discovering them afterwards.']
 },
 tr: {
  plan: ['Net bir görevle başla.', 'Ajan çalışmaya başlamadan sorumlulukları ayır, yararlı araçları seç ve iyi bir sonucun nasıl görüneceğini tanımla.'],
  tools: ['Ajana işe yarayan erişim ver.', 'MCP araçları yapılandırılmış eylemler sunar. RAG ilgili bağlamı sohbete taşır; ajanın yapabileceklerine açık sınırlar koyar.'],
  review: ['İlerlemeden önce doğrula.', 'Çıktıları doğrula; test kapıları veya başka bir modelle incele. Yeniden denemeleri sınırla, akış ilerleyemediğinde eskalasyon kullan.'],
  human: ['Kararı görünür tut.', 'Onay, iptal ve eskalasyon noktalarıyla önemli eylemleri sonradan öğrenmek yerine insanların yönlendirmesini sağla.']
 }
};
let language = 'en';
let stage = 'plan';
function renderStage() {
 document.getElementById('stage-title').textContent = copy[language][stage][0];
 document.getElementById('stage-description').textContent = copy[language][stage][1];
 document.querySelectorAll('[data-stage]').forEach(button => {
  const selected = button.dataset.stage === stage;
  button.classList.toggle('active', selected);
  button.setAttribute('aria-pressed', String(selected));
 });
}
function setLanguage(next) {
 language = next === 'tr' ? 'tr' : 'en';
 document.documentElement.lang = language;
 document.querySelectorAll('[data-en]').forEach(element => element.textContent = element.dataset[language]);
 document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
 renderStage();
 try { localStorage.setItem('portfolio-language', language); } catch (_) { /* Storage is optional. */ }
}
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => { stage = button.dataset.stage; renderStage(); }));
document.getElementById('year').textContent = new Date().getFullYear();
try { language = localStorage.getItem('portfolio-language') === 'tr' ? 'tr' : 'en'; } catch (_) {}
setLanguage(language);
