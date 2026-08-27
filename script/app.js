const map = document.querySelector('[data-map]');
const route = document.querySelector('[data-route]');
const pins = map ? [...map.querySelectorAll('[data-pin]')] : [];
const travelNote = document.querySelector('[data-travel-note]');

if (map && pins.length === 2) {
  const indonesia = (pin) => {
    const x = pin.offsetLeft / map.clientWidth * 100;
    const y = pin.offsetTop / map.clientHeight * 100;
    return x > 68 && x < 88 && y > 44 && y < 65;
  };

  const updateRoute = () => {
    if (!route) return;
    const [me, you] = pins;
    const meX = me.offsetLeft + me.offsetWidth / 2;
    const meY = me.offsetTop + me.offsetHeight / 2;
    const youX = you.offsetLeft + you.offsetWidth / 2;
    const youY = you.offsetTop + you.offsetHeight / 2;
    const distance = Math.hypot(meX - youX, meY - youY);
    route.style.width = `${distance}px`;
    route.style.left = `${meX}px`;
    route.style.top = `${meY}px`;
    route.style.transform = `rotate(${Math.atan2(youY - meY, youX - meX)}rad)`;

    if (travelNote) {
      const meInIndonesia = indonesia(me);
      const youInIndonesia = indonesia(you);
      const middleApart = distance > map.clientWidth * .025;
      const farApart = distance > map.clientWidth * .07;
      let message;
      if (meInIndonesia && youInIndonesia) {
        message = farApart ? "We're both in Indonesia, but why are we this far apart?" : middleApart ? "We're still in Indonesia... why are we 20–30 km apart?" : "We're traveling in Indonesia together.";
      } else if (!meInIndonesia && youInIndonesia) {
        message = farApart ? "I'm really far away now... you didn't come with me?" : "I'm going out on my own... you didn't come with me?";
      } else if (meInIndonesia && !youInIndonesia) {
        message = farApart ? "You're really far away. Don't go alone, take me with you." : "Don't go alone. Take me with you.";
      } else {
        message = farApart ? "Don't go too far from me, I can't see you." : middleApart ? "We're in different places now... don't get too far from me." : "We're off exploring together.";
      }
      travelNote.querySelector('span:last-child').textContent = message;
    }
  };

  pins.forEach((pin) => pin.addEventListener('pointerdown', (event) => {
    pin.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const bounds = map.getBoundingClientRect();
      const x = Math.max(4, Math.min(bounds.width - 17, moveEvent.clientX - bounds.left - 6));
      const y = Math.max(4, Math.min(bounds.height - 17, moveEvent.clientY - bounds.top - 6));
      pin.style.left = `${x}px`;
      pin.style.top = `${y}px`;
      updateRoute();
    };
    pin.addEventListener('pointermove', move);
    const stop = () => {
      pin.removeEventListener('pointermove', move);
      pin.removeEventListener('pointerup', stop);
      pin.removeEventListener('pointercancel', stop);
    };
    pin.addEventListener('pointerup', stop);
    pin.addEventListener('pointercancel', stop);
  }));

  window.addEventListener('resize', updateRoute);
  updateRoute();
}

const flower = document.querySelector('[data-flower]');
const revealLayer = document.querySelector('[data-reveal]');
const openReveal = document.querySelector('[data-open-reveal]');
if (revealLayer && openReveal) {
  openReveal.addEventListener('click', () => document.body.classList.add('revealed'));
}

const segmentButtons = [...document.querySelectorAll('[data-expand]')];
segmentButtons.forEach((button) => button.addEventListener('click', () => {
  const segment = document.querySelector(`#message-${button.dataset.expand}`);
  if (!segment) return;
  button.setAttribute('aria-expanded', 'true');
  segment.classList.add('is-open');
  requestAnimationFrame(() => segment.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}));

if (flower) {
  const bloom = (event) => {
    flower.classList.remove('bloom');
    void flower.offsetWidth;
    flower.classList.add('bloom');
    const glitterField = flower.querySelector('.glitter-field');
    if (!glitterField) return;
    const bounds = flower.getBoundingClientRect();
    const originX = event.clientX ? event.clientX - bounds.left : bounds.width / 2;
    const originY = event.clientY ? event.clientY - bounds.top : bounds.height / 2;
    for (let index = 0; index < 12; index += 1) {
      const glitter = document.createElement('span');
      glitter.className = 'glitter';
      glitter.style.left = `${originX}px`;
      glitter.style.top = `${originY}px`;
      glitter.style.setProperty('--x', `${Math.cos(index * .52) * (35 + Math.random() * 85)}px`);
      glitter.style.setProperty('--y', `${Math.sin(index * .52) * (35 + Math.random() * 85)}px`);
      glitter.style.animationDelay = `${index * 25}ms`;
      glitterField.appendChild(glitter);
      glitter.addEventListener('animationend', () => glitter.remove(), { once: true });
    }
  };
  flower.addEventListener('click', bloom);
  flower.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      bloom(event);
    }
  });
}
