import {
  CHAT_SUGGESTIONS,
  findPreparedReply,
} from './chat-rules.mjs';
import { createRobotViewer } from './robot-webgl.mjs?v=3';

const RESPONSE_DELAY = 720;
const ROBOT_MODEL_URL = new URL('../models/robot.glb?v=2', import.meta.url).href;
const ROBOT_FALLBACK_URL = new URL('../images/chat/robot-fallback.png?v=2', import.meta.url).href;

export function createChatWidget(documentRef = document) {
  const existingWidget = documentRef.querySelector('[data-chat-widget]');
  if (existingWidget) return existingWidget;

  const template = documentRef.createElement('template');
  template.innerHTML = `
    <div class="chat-widget" data-chat-widget>
      <section class="chat-widget__panel" id="nutlens-chat-panel" role="dialog" aria-modal="false" aria-hidden="true" aria-labelledby="nutlens-chat-title" inert data-chat-panel>
        <header class="chat-widget__header">
          <div class="chat-widget__avatar" aria-hidden="true"><span class="material-symbols-outlined">offline_bolt</span></div>
          <div class="chat-widget__header-copy">
            <h2 class="chat-widget__title" id="nutlens-chat-title">Teman NutLens</h2>
            <p class="chat-widget__status">Respons lokal tanpa AI</p>
          </div>
          <button class="chat-widget__close" type="button" aria-label="Tutup Teman NutLens" data-chat-close><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
        </header>
        <div class="chat-widget__messages" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" data-chat-messages>
          <article class="chat-widget__message chat-widget__message--bot">
            <span class="chat-widget__message-avatar" aria-hidden="true"><span class="material-symbols-outlined">offline_bolt</span></span>
            <div class="chat-widget__bubble"><p>Halo, aku bisa membantu menjelaskan fitur NutLens dan informasi nutrisi umum yang sudah disiapkan.</p></div>
          </article>
        </div>
        <footer class="chat-widget__footer">
          <p class="chat-widget__safety"><span class="material-symbols-outlined" aria-hidden="true">verified_user</span>Informasi umum, bukan diagnosis medis.</p>
          <div class="chat-widget__suggestions" aria-label="Saran pertanyaan" data-chat-suggestions></div>
          <p class="chat-widget__allowance">Jawaban lokal berbasis kata kunci</p>
          <form class="chat-widget__form" data-chat-form>
            <label class="visually-hidden" for="nutlens-chat-input">Tulis pertanyaan untuk Teman NutLens</label>
            <input class="chat-widget__input" id="nutlens-chat-input" type="text" name="message" maxlength="180" autocomplete="off" placeholder="Tulis pertanyaanmu" aria-describedby="nutlens-chat-note" required data-chat-input />
            <button class="chat-widget__submit" type="submit" aria-label="Kirim pesan" disabled data-chat-submit><span class="material-symbols-outlined" aria-hidden="true">send</span></button>
          </form>
          <p class="visually-hidden" id="nutlens-chat-note">Jawaban dipilih dari topik yang telah disiapkan dan tidak dikirim ke layanan AI.</p>
        </footer>
      </section>
      <button class="chat-widget__launcher" type="button" aria-label="Buka Teman NutLens" aria-expanded="false" aria-controls="nutlens-chat-panel" data-chat-launcher>
        <span class="chat-widget__launcher-label">Ada yang bisa dibantu? <span aria-hidden="true">👋</span></span>
        <span class="chat-widget__robot-stage" data-chat-robot-stage>
          <img class="chat-widget__launcher-image" src="${ROBOT_FALLBACK_URL}" alt="" width="512" height="512" />
          <canvas class="chat-widget__robot-canvas" aria-hidden="true" data-chat-robot-canvas></canvas>
        </span>
      </button>
    </div>
  `;

  const widget = template.content.firstElementChild;
  documentRef.body.append(widget);
  return widget;
}

function createMessage(documentRef, role, text, { typing = false } = {}) {
  const item = documentRef.createElement('article');
  item.className = `chat-widget__message chat-widget__message--${role}`;

  if (role === 'bot') {
    const avatar = documentRef.createElement('span');
    avatar.className = 'chat-widget__message-avatar';
    avatar.setAttribute('aria-hidden', 'true');

    const avatarIcon = documentRef.createElement('span');
    avatarIcon.className = 'material-symbols-outlined';
    avatarIcon.textContent = 'offline_bolt';
    avatar.append(avatarIcon);
    item.append(avatar);
  }

  const bubble = documentRef.createElement('div');
  bubble.className = 'chat-widget__bubble';

  if (typing) {
    item.dataset.chatTyping = 'true';
    bubble.setAttribute('aria-label', 'Teman NutLens sedang menyiapkan jawaban');
    bubble.innerHTML = [0, 1, 2]
      .map(() => '<span class="chat-widget__typing-dot" aria-hidden="true"></span>')
      .join('');
  } else {
    const messageText = documentRef.createElement('p');
    messageText.textContent = text;
    bubble.append(messageText);
  }

  item.append(bubble);
  return item;
}

export function initChatWidget(root, environment = globalThis) {
  const documentRef = root.ownerDocument;
  const launcher = root.querySelector('[data-chat-launcher]');
  const panel = root.querySelector('[data-chat-panel]');
  const closeButton = root.querySelector('[data-chat-close]');
  const messageLog = root.querySelector('[data-chat-messages]');
  const form = root.querySelector('[data-chat-form]');
  const input = root.querySelector('[data-chat-input]');
  const submitButton = root.querySelector('[data-chat-submit]');
  const quickReplies = root.querySelector('[data-chat-suggestions]');
  const canvas = root.querySelector('[data-chat-robot-canvas]');
  const robotStage = root.querySelector('[data-chat-robot-stage]');

  if (
    !launcher
    || !panel
    || !closeButton
    || !messageLog
    || !form
    || !input
    || !submitButton
    || !quickReplies
    || !canvas
    || !robotStage
  ) {
    return () => {};
  }

  let isOpen = false;
  let isResponding = false;
  let responseTimer = null;
  let viewer = null;
  const listeners = [];

  const listen = (target, type, handler) => {
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  };

  const ensureViewer = () => {
    if (viewer) return viewer;

    viewer = createRobotViewer(canvas, {
      modelUrl: ROBOT_MODEL_URL,
      onReady() {
        robotStage.classList.add('is-webgl-ready');
        robotStage.classList.remove('has-webgl-error');
      },
      onError() {
        robotStage.classList.add('has-webgl-error');
      },
    });
    return viewer;
  };

  const scrollMessages = () => {
    const reduceMotion = environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    messageLog.scrollTo({
      top: messageLog.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const setOpen = (nextOpen, { restoreFocus = true } = {}) => {
    isOpen = Boolean(nextOpen);
    root.classList.toggle('is-open', isOpen);
    panel.classList.toggle('is-open', isOpen);
    panel.setAttribute('aria-hidden', String(!isOpen));
    panel.inert = !isOpen;
    launcher.setAttribute('aria-expanded', String(isOpen));
    launcher.setAttribute(
      'aria-label',
      isOpen ? 'Tutup Teman NutLens' : 'Buka Teman NutLens',
    );

    ensureViewer().react();

    if (isOpen) {
      environment.requestAnimationFrame?.(() => {
        input.focus();
        scrollMessages();
      });
    } else {
      if (restoreFocus) launcher.focus();
    }
  };

  const setResponding = (nextResponding) => {
    isResponding = nextResponding;
    input.disabled = nextResponding;
    submitButton.disabled = nextResponding || !input.value.trim();
    quickReplies.querySelectorAll('button').forEach((button) => {
      button.disabled = nextResponding;
    });
  };

  const sendMessage = (rawMessage) => {
    const message = String(rawMessage ?? '').trim();
    if (!message || isResponding) return;

    const preparedReply = findPreparedReply(message);
    if (!preparedReply) return;

    messageLog.append(createMessage(documentRef, 'user', message));
    input.value = '';
    setResponding(true);

    const typingMessage = createMessage(documentRef, 'bot', '', { typing: true });
    messageLog.append(typingMessage);
    scrollMessages();

    responseTimer = environment.setTimeout(() => {
      typingMessage.remove();
      messageLog.append(createMessage(documentRef, 'bot', preparedReply.response));
      setResponding(false);
      viewer?.react();
      scrollMessages();
      input.focus();
      responseTimer = null;
    }, RESPONSE_DELAY);
  };

  CHAT_SUGGESTIONS.forEach((suggestion) => {
    const button = documentRef.createElement('button');
    button.type = 'button';
    button.className = 'chat-widget__suggestion';
    button.textContent = suggestion;
    button.dataset.chatSuggestion = suggestion;
    quickReplies.append(button);
  });

  listen(launcher, 'click', () => setOpen(!isOpen));
  listen(closeButton, 'click', () => setOpen(false));
  listen(form, 'submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  listen(input, 'input', () => {
    submitButton.disabled = isResponding || !input.value.trim();
  });
  listen(quickReplies, 'click', (event) => {
    const suggestion = event.target.closest('[data-chat-suggestion]');
    if (suggestion) sendMessage(suggestion.dataset.chatSuggestion);
  });
  listen(documentRef, 'keydown', (event) => {
    if (event.key === 'Escape' && isOpen) setOpen(false);
  });

  panel.inert = true;
  ensureViewer().setActive(true);

  return () => {
    if (responseTimer !== null) environment.clearTimeout(responseTimer);
    listeners.forEach((cleanup) => cleanup());
    viewer?.destroy();
  };
}

if (typeof document !== 'undefined') {
  createChatWidget(document);
  document.querySelectorAll('[data-chat-widget]').forEach((root) => {
    initChatWidget(root, window);
  });
}
