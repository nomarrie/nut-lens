import {
  CHAT_SUGGESTIONS,
  findPreparedReply,
} from './chat-rules.mjs';
import { createRobotViewer } from './robot-webgl.mjs?v=3';

const RESPONSE_DELAY = 720;

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
  document.querySelectorAll('[data-chat-widget]').forEach((root) => {
    initChatWidget(root, window);
  });
}
