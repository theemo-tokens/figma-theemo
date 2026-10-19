// jsdom gaps for the UI3 kit Menu (rAF-driven scroll shadows, keyboard scroll)
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb: FrameRequestCallback) =>
    window.setTimeout(() => cb(Date.now()), 0) as unknown as number;
}

window.HTMLElement.prototype.scrollIntoView ??= function () {};
