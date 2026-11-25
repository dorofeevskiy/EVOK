(() => {
  const house = document.querySelector(".house");
  const roomButtons = Array.from(house.querySelectorAll(".house-room"));
  const heading = document.querySelector("#room-heading");
  const announcement = document.querySelector(".room-announcement");
  const numberFormat = new Intl.NumberFormat("ru-RU");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const stats = Array.from(document.querySelectorAll(".stat"), (card) => ({
    label: card.querySelector("dt"),
    value: card.querySelector(".stat-value"),
    readable: card.querySelector(".stat-readable"),
  }));

  const roomProducts = {
    living: stats.map(({ label, readable }) => [
      Number(readable.textContent.replace(/\s/g, "")),
      label.textContent,
    ]),
    kitchen: [
      [684, "кухонных гарнитура изготовлены по размерам клиентов"],
      [1126, "обеденных столов доставлено клиентам"],
      [3840, "обеденных стульев отправлено с фабрик"],
      [798, "подвесных светильников подобрано для кухонь"],
    ],
    bedroom: [
      [1056, "кроватей изготовлено по заказам клиентов"],
      [1872, "прикроватные тумбочки собраны по нашим заказам"],
      [624, "шкафа для одежды изготовлены на фабриках Китая"],
      [768, "комодов доставлено заказчикам"],
    ],
    bathroom: [
      [486, "ванн отправлено клиентам"],
      [912, "раковин подобрано для ванных"],
      [774, "тумбы под раковину изготовлены по заказам"],
      [1338, "смесителей отправлено вместе с сантехникой"],
    ],
  };

  function displayedDigits(output) {
    const reels = Array.from(output.querySelectorAll(".digit-reel"));
    if (reels.length === 0) return output.textContent.match(/\d/g) ?? [];

    return reels.map((reel) => {
      const { transform, lineHeight } = getComputedStyle(reel);
      const offset = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      const index = Math.round(-offset / parseFloat(lineHeight));
      return reel.children[index]?.textContent ?? reel.lastElementChild.textContent;
    });
  }

  function rollNumber(output, formatted, direction) {
    if (motion.matches || !Element.prototype.animate) {
      output.textContent = formatted;
      return;
    }

    const oldDigits = displayedDigits(output);
    const newLength = formatted.replace(/\D/g, "").length;
    const alignedDigits = oldDigits.join("").padStart(newLength, "0").slice(-newLength);
    const digits = document.createDocumentFragment();
    let place = 0;

    for (const character of formatted) {
      if (!/\d/.test(character)) {
        const separator = document.createElement("span");
        separator.className = "digit-separator";
        digits.append(separator);
        continue;
      }

      const target = Number(character);
      const from = Number(alignedDigits[place]);
      const steps = ((target - from) * direction + 10) % 10;
      const digitWindow = document.createElement("span");
      const reel = document.createElement("span");
      digitWindow.className = "digit-window";
      reel.className = "digit-reel";

      for (let step = 0; step <= steps; step += 1) {
        const digit = document.createElement("span");
        digit.textContent = (from + step * direction + 10) % 10;
        reel.append(digit);
      }

      digitWindow.append(reel);
      digits.append(digitWindow);
      if (steps > 0) {
        const animation = reel.animate(
          { transform: ["translateY(0)", "translateY(" + -100 * steps + "%)"] },
          { duration: 430 + place * 22, easing: "cubic-bezier(.18,.7,.23,1)", fill: "forwards" }
        );
        animation.onfinish = () => {
          const lastDigit = reel.lastElementChild;
          animation.cancel();
          reel.replaceChildren(lastDigit);
        };
      }
      place += 1;
    }

    output.replaceChildren(digits);
  }

  let selected = roomButtons.find((button) => button.getAttribute("aria-pressed") === "true");
  let hoverTimer;
  let currentValues = roomProducts[selected.dataset.room];

  function selectRoom(button, announce = false) {
    if (selected === button) return;

    const room = button.getAttribute("aria-label");
    const products = roomProducts[button.dataset.room];
    selected.setAttribute("aria-pressed", "false");
    selected = button;
    selected.setAttribute("aria-pressed", "true");
    heading.textContent = room;

    for (const [index, [amount, label]] of products.entries()) {
      const { value, label: labelElement, readable } = stats[index];
      const formatted = numberFormat.format(amount);
      const direction = amount < currentValues[index][0] ? -1 : 1;
      labelElement.textContent = label;
      readable.textContent = formatted;
      rollNumber(value, formatted, direction);
    }
    currentValues = products;

    if (announce) {
      const summary = products.map(([value, label]) => numberFormat.format(value) + " " + label);
      announcement.textContent = room + ". " + summary.join(", ") + ".";
    }
  }

  for (const button of roomButtons) {
    button.disabled = false;
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => selectRoom(button), 65);
    });
    button.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) selectRoom(button, true);
    });
    button.addEventListener("click", () => {
      clearTimeout(hoverTimer);
      selectRoom(button, true);
    });
  }
})();
